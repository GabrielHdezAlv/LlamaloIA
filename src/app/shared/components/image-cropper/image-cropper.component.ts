import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-cropper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.scss']
})
export class ImageCropperComponent implements AfterViewInit, OnDestroy {
  @Input() imageUrl: string = '';
  @Output() imageCropped = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('canvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('imageElement', { static: false }) imageElement!: ElementRef<HTMLImageElement>;
  @ViewChild('container', { static: false }) container!: ElementRef<HTMLDivElement>;

  private image = new Image();
  public scale = 1;
  private translateX = 0;
  private translateY = 0;
  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private lastTranslateX = 0;
  private lastTranslateY = 0;
  private initialPinchDistance = 0;
  private initialScale = 1;

  // Getter para obtener el porcentaje de zoom
  get scalePercentage(): number {
    return Math.round(this.scale * 100);
  }
  public cropSize = 200;
  public canvasSize = 300;

  ngAfterViewInit() {
    if (this.imageUrl) {
      this.loadImage();
    }
  }

  ngOnDestroy() {
    // Limpiar la imagen para evitar fugas de memoria
    this.image.onload = null;
    this.image.onerror = null;
  }

  loadImage() {
    this.image.onload = () => {
      this.resetTransform();
      this.drawImage();
    };

    this.image.onerror = () => {
      console.error('Error al cargar la imagen');
    };

    this.image.src = this.imageUrl;
  }

  resetTransform() {
    // Calcular escala inicial para que la imagen cubra el círculo
    const imageAspect = this.image.width / this.image.height;
    const cropAspect = 1; // Círculo (aspect ratio 1:1)

    let initialScale;
    if (imageAspect > cropAspect) {
      // Imagen más ancha que alta
      initialScale = this.cropSize / this.image.height;
    } else {
      // Imagen más alta que ancha
      initialScale = this.cropSize / this.image.width;
    }

    // Añadir un pequeño margen para que el usuario pueda ajustar
    this.scale = initialScale * 1.2;
    this.translateX = 0;
    this.translateY = 0;
    this.lastTranslateX = 0;
    this.lastTranslateY = 0;
  }

  drawImage() {
    if (!this.canvas || !this.imageElement) return;

    const canvas = this.canvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Guardar estado del contexto
    ctx.save();

    // Configurar área de recorte circular
    ctx.beginPath();
    ctx.arc(
      this.canvasSize / 2,
      this.canvasSize / 2,
      this.cropSize / 2,
      0,
      2 * Math.PI
    );
    ctx.clip();

    // Calcular posición de la imagen
    const centerX = this.canvasSize / 2;
    const centerY = this.canvasSize / 2;

    // Aplicar transformaciones
    ctx.translate(centerX + this.translateX, centerY + this.translateY);
    ctx.scale(this.scale, this.scale);

    // Dibujar imagen centrada
    const drawWidth = this.image.width;
    const drawHeight = this.image.height;
    ctx.drawImage(
      this.image,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );

    // Restaurar estado del contexto
    ctx.restore();

    // Dibujar borde del círculo
    const isDarkMode = document.documentElement.classList.contains('dark');
    ctx.strokeStyle = isDarkMode ? '#60a5fa' : '#3b82f6'; // Azul consistente con el tema
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(
      this.canvasSize / 2,
      this.canvasSize / 2,
      this.cropSize / 2,
      0,
      2 * Math.PI
    );
    ctx.stroke();
  }

  onWheel(event: WheelEvent) {
    event.preventDefault();
    
    // Determinar dirección del zoom: rueda hacia arriba = zoom in, hacia abajo = zoom out
    const delta = event.deltaY < 0 ? 1.1 : 0.9;
    const newScale = this.scale * delta;

    // Limitar escala
    const minScale = 0.1;  // Permitir reducir más el zoom
    const maxScale = 3;
    
    if (newScale >= minScale && newScale <= maxScale) {
      this.scale = newScale;
      this.drawImage();
    }
  }

  onMouseDown(event: MouseEvent) {
    this.isDragging = true;
    this.startX = event.clientX - this.translateX;
    this.startY = event.clientY - this.translateY;
    this.lastTranslateX = this.translateX;
    this.lastTranslateY = this.translateY;
    
    event.preventDefault();
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;

    this.translateX = event.clientX - this.startX;
    this.translateY = event.clientY - this.startY;
    
    this.drawImage();
  }

  onMouseUp() {
    this.isDragging = false;
  }

  onMouseLeave() {
    this.isDragging = false;
  }

  onTouchStart(event: TouchEvent) {
    if (event.touches.length === 1) {
      this.isDragging = true;
      this.startX = event.touches[0].clientX - this.translateX;
      this.startY = event.touches[0].clientY - this.translateY;
      this.lastTranslateX = this.translateX;
      this.lastTranslateY = this.translateY;
      event.preventDefault();
      event.stopPropagation();
    }
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isDragging || event.touches.length !== 1) return;

    this.translateX = event.touches[0].clientX - this.startX;
    this.translateY = event.touches[0].clientY - this.startY;
    
    this.drawImage();
    event.preventDefault();
    event.stopPropagation();
  }

  onTouchEnd() {
    this.isDragging = false;
  }

  onTouchStartForZoom(event: TouchEvent) {
    if (event.touches.length === 2) {
      event.preventDefault();
      // Guardar distancia inicial para zoom con dos dedos
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      this.initialPinchDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      this.initialScale = this.scale;
    }
  }

  onTouchMoveForZoom(event: TouchEvent) {
    if (event.touches.length === 2 && this.initialPinchDistance) {
      event.preventDefault();
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const scaleDelta = currentDistance / this.initialPinchDistance;
      const newScale = this.initialScale * scaleDelta;
      
      // Limitar escala
      if (newScale >= 0.1 && newScale <= 3) {
        this.scale = newScale;
        this.drawImage();
      }
    }
  }

  onZoomIn() {
    const newScale = this.scale * 1.1;
    if (newScale <= 3) {
      this.scale = newScale;
      this.drawImage();
    }
  }

  onZoomOut() {
    const newScale = this.scale * 0.9;
    if (newScale >= 0.1) {  // Permitir reducir más el zoom
      this.scale = newScale;
      this.drawImage();
    }
  }

  onReset() {
    this.resetTransform();
    this.drawImage();
  }

  onCrop() {
    if (!this.canvas) return;

    // Crear un canvas temporal para el recorte final
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.cropSize;
    tempCanvas.height = this.cropSize;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) return;

    // Dibujar solo la parte circular en el canvas temporal
    tempCtx.save();
    tempCtx.beginPath();
    tempCtx.arc(this.cropSize / 2, this.cropSize / 2, this.cropSize / 2, 0, 2 * Math.PI);
    tempCtx.clip();

    // Calcular las coordenadas de recorte en el canvas original
    const sourceX = (this.canvasSize - this.cropSize) / 2;
    const sourceY = (this.canvasSize - this.cropSize) / 2;

    tempCtx.drawImage(
      this.canvas.nativeElement,
      sourceX,
      sourceY,
      this.cropSize,
      this.cropSize,
      0,
      0,
      this.cropSize,
      this.cropSize
    );

    tempCtx.restore();

    // Convertir a blob y emitir
    tempCanvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        this.imageCropped.emit(url);
      }
    }, 'image/png', 0.9);
  }

  onCancel() {
    this.cancel.emit();
  }
}
