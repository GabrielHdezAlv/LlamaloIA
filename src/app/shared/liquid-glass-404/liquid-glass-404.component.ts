import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';

import * as THREE from 'three';

@Component({
  selector: 'app-liquid-glass-404',
  standalone: true,
  templateUrl: './liquid-glass-404.component.html',
  styleUrl: './liquid-glass-404.component.scss',
})
export class LiquidGlass404Component implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.OrthographicCamera;
  private material?: THREE.ShaderMaterial;
  private animationFrameId?: number;

  private readonly textureUrl = 'assets/fondo_404.webp';

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;

    const canvas = this.canvasRef.nativeElement;

    const { innerWidth: width, innerHeight: height } = window;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);

    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const geometry = new THREE.PlaneGeometry(2, 2);

    const loader = new THREE.TextureLoader();
    const texture = loader.load(this.textureUrl);

    const uniforms: { [key: string]: THREE.IUniform } = {
      uMouse: { value: new THREE.Vector2(0, 0) },
      uRes: { value: new THREE.Vector2(width, height) },
      uTexRes: {
        value: new THREE.Vector2(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (texture.image as any)?.width || width,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (texture.image as any)?.height || height
        ),
      },
      uTexture: { value: texture },
    };

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    // Fragment shader adaptado del CodePen Apple Liquid Glass
    const fragmentShader = `
      varying vec2 vUv;
      uniform vec2 uRes;
      uniform vec2 uTexRes;
      uniform vec2 uMouse;
      uniform sampler2D uTexture;

      #define PI 3.14159265
      #define S smoothstep
      #define R uRes
      #define PX(a) a/R.y

      vec2 CoverUV(vec2 u, vec2 s, vec2 i) {
        float rs = s.x / s.y;
        float ri = i.x / i.y;
        vec2 st = rs < ri
          ? vec2(i.x * s.y / i.y, s.y)
          : vec2(s.x, i.y * s.x / i.x);
        vec2 o = (rs < ri
          ? vec2((st.x - s.x) / 2.0, 0.0)
          : vec2(0.0, (st.y - s.y) / 2.0)) / st;
        return u * s / st + o;
      }

      mat2 Rot (float a) {
        return mat2(cos(a), sin(-a), sin(a), cos(a));
      }

      float Box (vec2 p, vec2 b) {
        vec2 d = abs(p) - b;
        return length(max(d,0.)) + min(max(d.x,d.y),0.);
      }

      float IconPhoto (vec2 uv) {
        float c = 0.;
        for (float i = 0.; i < 1.; i+=1./8.) {
          vec2 u = uv;
          u *= Rot(i * 2. * PI);
          u += vec2(0., PX(40.));
          float b = Box(u, vec2(PX(0.), PX(13.)));
          c += S(PX(1.5), 0., b - PX(15.)) * .2;
        }
        return c;
      }

      vec4 LiquidGlass (sampler2D tex, vec2 uv, float direction, float quality, float size) {
        vec2 radius = size/R;
        vec4 color = texture2D(tex, uv);
        for (float d = 0.; d < PI; d += PI/direction) {
          for (float i = 1./quality; i <= 1.; i += 1./quality) {
            color += texture(tex, uv + vec2(cos(d),sin(d)) * radius * i);
          }
        }
        color /= quality * direction;
        return color;
      }

      vec4 Icon (vec2 uv) {
        float box = Box(uv, vec2(PX(50.)));
        float boxShape = S(PX(1.5), 0., box - PX(50.));
        float boxDisp = S(PX(35.), 0., box - PX(25.));
        float boxLight = boxShape * S(0., PX(30.), box - PX(40.));
        float icon = IconPhoto(uv);
        return vec4(boxShape, boxDisp, boxLight, icon);
      }

      void main() {
        vec2 uv = CoverUV(vUv, uRes, uTexRes);
        vec2 st = (gl_FragCoord.xy - 0.5 * R) / R.y;
        vec2 M = uMouse * 0.5;
        M.x *= uRes.x / uRes.y;

        vec3 tex = texture2D(uTexture, uv).rgb;
        vec4 icon = Icon(st - M);

        vec2 uv2 = uv - M;
        uv2 *= S(-0.6, 1.0, icon.y);
        uv2 += M;

        vec3 col = mix(
          tex * 0.8,
          0.1 + LiquidGlass(uTexture, uv2, 10.0, 10.0, 20.0).rgb * 0.7,
          icon.x
        );

        col += icon.z * 0.9 + icon.w;
        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.material = material;

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      uniforms['uRes'].value.set(w, h);
    };

    window.addEventListener('resize', onResize);

    const onPointerMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth) * 2.0 - 1.0;
      const y = (event.clientY / window.innerHeight) * 2.0 - 1.0;
      uniforms['uMouse'].value.set(x, -y);
    };

    window.addEventListener('pointermove', onPointerMove);

    const animate = () => {
      if (!this.renderer || !this.scene || !this.camera) return;
      this.renderer.render(this.scene, this.camera);
      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.ngZone.runOutsideAngular(() => {
      animate();
    });
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    this.scene = undefined;
    this.camera = undefined;
    this.material = undefined;
  }
}

