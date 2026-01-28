import { Component, ElementRef, AfterViewInit, ViewChild, OnDestroy, HostListener, Inject, PLATFORM_ID, Input } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-ai-sphere',
    standalone: true,
    imports: [CommonModule],
    template: `<canvas #c></canvas>`,
    styles: [`
    :host {
      display: block;
      /* Aumentamos masivamente el contenedor invisible para que el aura nunca se corte */
      width: 600px;
      height: 600px;
      margin: -130px auto 0; /* Margen negativo superior para compensar el tamaño y subirla */
    }
    canvas {
      width: 600px;
      height: 600px;
      display: block;
      background: transparent;
      /* Quitamos el border-radius que causaba el corte circular */
    }
  `]
})
export class AiSphereComponent implements AfterViewInit, OnDestroy {
    @ViewChild('c', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

    @Input() audioLevel: number = 0;

    private ctx!: CanvasRenderingContext2D;
    private t = 0;
    private mx = 0;
    private my = 0;
    private animationId: number | null = null;
    private isBrowser: boolean;

    // Resolución interna amplia para que el aura tenga espacio infinito
    private readonly INTERNAL_SIZE = 800;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    private _currentLevel = 0;

    ngAfterViewInit() {
        if (!this.isBrowser) return;
        this.initCanvas();
        this.animate();
    }

    ngOnDestroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(e: MouseEvent) {
        if (!this.isBrowser) return;
        this.mx = (e.clientX / window.innerWidth - 0.5) * 2;
        this.my = (e.clientY / window.innerHeight - 0.5) * 2;
    }

    private initCanvas() {
        const canvas = this.canvasRef.nativeElement;
        canvas.width = this.INTERNAL_SIZE;
        canvas.height = this.INTERNAL_SIZE;
        canvas.style.width = '600px';
        canvas.style.height = '600px';
        this.ctx = canvas.getContext('2d', { alpha: true })!;
    }

    private smoothstep(a: number, b: number, x: number) {
        const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
        return t * t * (3 - 2 * t);
    }

    private animate = () => {
        this._currentLevel += (this.audioLevel - this._currentLevel) * 0.12;
        const level = this._currentLevel;

        this.t += 0.012 + (level * 0.07);

        const ctx = this.ctx;
        const s = this.INTERNAL_SIZE;
        const cx = s / 2;
        const cy = s / 2;

        // Mantenemos el núcleo pequeño y elegante (Radio base ~12% del canvas)
        const baseR = s * 0.12;
        const r = baseR * (1 + level * 0.18);

        ctx.clearRect(0, 0, s, s);

        const img = ctx.createImageData(s, s);
        const d = img.data;

        const c1 = [30, 70, 255];
        const c2 = [50, 120, 255];
        const c3 = [20, 180, 240];
        const c4 = [30, 140, 255];

        const warpIntensity = 0.22 + (level * 0.4);

        for (let y = 0; y < s; y++) {
            for (let x = 0; x < s; x++) {
                const dx = x - cx;
                const dy = y - cy;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > r) continue;

                const nx = dx / r;
                const ny = dy / r;
                const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));

                const grain = (Math.random() - 0.5) * 10;

                const warp =
                    Math.sin(nx * 2.5 + this.t) * 0.5 +
                    Math.sin(ny * 3.5 - this.t * 1.5) * 0.5 +
                    Math.sin((nx + ny) * 2.2 + this.t * 0.8) * 0.4;

                const u = nx + warp * warpIntensity;
                const v = ny + warp * warpIntensity;

                const blend1 = 0.5 + 0.5 * Math.sin(u * 2.2 + this.t);
                const blend2 = 0.5 + 0.5 * Math.sin(v * 2.2 - this.t * 0.9);
                const blend3 = 0.5 + 0.5 * Math.sin((u + v) * 2.2 + this.t * 0.7);

                let rCol = c1[0] * blend1 * (1 - blend2) + c2[0] * blend2 * (1 - blend3) + c3[0] * blend3 * (1 - blend1) + c4[0] * blend1 * blend2;
                let gCol = c1[1] * blend1 * (1 - blend2) + c2[1] * blend2 * (1 - blend3) + c3[1] * blend3 * (1 - blend1) + c4[1] * blend1 * blend2;
                let bCol = c1[2] * blend1 * (1 - blend2) + c2[2] * blend2 * (1 - blend3) + c3[2] * blend3 * (1 - blend1) + c4[2] * blend1 * blend2;

                const light = nx * -0.3 + ny * -0.5 + nz * 1.0;
                const spec = Math.pow(Math.max(0, light), 3.5);

                rCol = (rCol + grain) * (0.45 + spec * 1.5);
                gCol = (gCol + grain) * (0.45 + spec * 1.5);
                bCol = (bCol + grain) * (0.50 + spec * 1.7);

                const edge = this.smoothstep(r * 0.95, r, dist);
                const alpha = 1 - edge;

                const i = (y * s + x) * 4;
                d[i] = Math.min(255, rCol);
                d[i + 1] = Math.min(255, gCol);
                d[i + 2] = Math.min(255, bCol);
                d[i + 3] = alpha * 255;
            }
        }

        ctx.putImageData(img, 0, 0);

        // ✨ Reflejo
        const hx = cx - r * 0.35 + this.mx * 18;
        const hy = cy - r * 0.35 + this.my * 18;
        const highlight = ctx.createRadialGradient(hx, hy, r * 0.1, hx, hy, r * 0.6);
        highlight.addColorStop(0, 'rgba(255,255,255,0.6)');
        highlight.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = highlight;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.92, 0, Math.PI * 2);
        ctx.fill();

        // 🌌 Dual Atmospheric Aura (Spatial color separation)
        // 🌌 Dual Atmospheric Aura (Spatial color separation)
        // Reducimos el multiplicador del radio para evitar que corte con los bordes (limitando el alcance)
        const glowRadius = r * (1.4 + (level * 0.6));

        const cyan = `0, 40, 120`;
        const sapphire = `0, 20, 100`;
        const blueGlow = `40, 120, 220`;

        // 1. Sapphire/Cyan Glow (Offset to the left)
        const leftAtm = ctx.createRadialGradient(cx - r * 0.5, cy, r * 0.2, cx, cy, glowRadius);
        leftAtm.addColorStop(0, `rgba(${cyan}, ${0.20 + level * 0.3})`);
        leftAtm.addColorStop(0.6, `rgba(${sapphire}, ${0.05 + level * 0.1})`); // Fade suave intermedio
        leftAtm.addColorStop(1, `rgba(${sapphire}, 0)`); // Transparencia total antes del borde

        ctx.fillStyle = leftAtm;
        ctx.beginPath();
        ctx.arc(cx, cy, s / 2, 0, Math.PI * 2);
        ctx.fill();

        // 2. Blue Glow (Offset to the right)
        const rightAtm = ctx.createRadialGradient(cx + r * 0.5, cy, r * 0.2, cx, cy, glowRadius);
        rightAtm.addColorStop(0, `rgba(${blueGlow}, ${0.15 + level * 0.25})`);
        rightAtm.addColorStop(0.6, `rgba(${blueGlow}, ${0.05 + level * 0.1})`);
        rightAtm.addColorStop(1, `rgba(${blueGlow}, 0)`);

        ctx.fillStyle = rightAtm;
        ctx.beginPath();
        ctx.arc(cx, cy, s / 2, 0, Math.PI * 2);
        ctx.fill();

        this.animationId = requestAnimationFrame(this.animate);
    };
}
