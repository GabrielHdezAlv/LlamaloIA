import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkOverlayOrigin,
  Overlay,
  OverlayModule,
  STANDARD_DROPDOWN_BELOW_POSITIONS,
} from '@angular/cdk/overlay';

export interface SegmentationSelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-segmentation-select',
  standalone: true,
  imports: [CommonModule, OverlayModule],
  templateUrl: './segmentation-select.component.html',
  styleUrl: './segmentation-select.component.scss',
})
export class SegmentationSelectComponent {
  private overlay = inject(Overlay);

  /** Opciones visibles (valor + texto). */
  @Input({ required: true }) options: SegmentationSelectOption[] = [];
  /** Valor seleccionado (coincide con `option.value`). */
  @Input() value = '';
  /** `full`: ancho del control; `op`: ancho fijo para operadores de comparación. */
  @Input() variant: 'full' | 'op' = 'full';

  /** Clase extra en el panel CDK (p. ej. z-index alto dentro de un modal). */
  @Input() overlayPanelExtraClass = '';

  @Output() valueChange = new EventEmitter<string>();

  get overlayPanelClassBinding(): string | string[] {
    const extra = this.overlayPanelExtraClass?.trim();
    return extra ? ['seg-dd-overlay-pane', extra] : 'seg-dd-overlay-pane';
  }

  protected readonly positions = STANDARD_DROPDOWN_BELOW_POSITIONS;
  protected readonly scrollStrategy = this.overlay.scrollStrategies.reposition();

  isOpen = false;
  panelWidthPx = 0;

  get selectedLabel(): string {
    return this.options.find((o) => o.value === this.value)?.label ?? '—';
  }

  toggle(origin: CdkOverlayOrigin): void {
    if (!this.isOpen) {
      this.panelWidthPx = Math.ceil(
        origin.elementRef.nativeElement.getBoundingClientRect().width,
      );
    }
    this.isOpen = !this.isOpen;
  }

  close(): void {
    this.isOpen = false;
  }

  get overlayWidthBinding(): number {
    if (this.panelWidthPx > 0) {
      return this.panelWidthPx;
    }
    return this.variant === 'op' ? 72 : 280;
  }

  pick(opt: SegmentationSelectOption): void {
    if (opt.value !== this.value) {
      this.valueChange.emit(opt.value);
    }
    this.close();
  }

  /** Evita recrear el DOM en cada CD cuando el padre pasa getters que devuelven arrays nuevos. */
  trackByValue(_index: number, opt: SegmentationSelectOption): string {
    return opt.value;
  }
}
