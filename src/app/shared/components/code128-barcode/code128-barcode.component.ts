import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import JsBarcode from 'jsbarcode';

/** Renders a value as a Code 128 barcode (SVG). The value is never logged. */
@Component({
  selector: 'app-code128-barcode',
  template: `<svg #svg class="code128" role="img" aria-label="Barcode"></svg>
    <p *ngIf="failed" class="text-description barcode-error">Barcode cannot be displayed. Use the QR code.</p>`,
  styles: [
    `
      :host { display: block; width: 100%; }
      .code128 { display: block; width: 100%; height: auto; background: #fff; }
      .barcode-error { text-align: center; color: var(--ion-color-danger); }
    `,
  ],
  standalone: false,
})
export class Code128BarcodeComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() value = '';
  @ViewChild('svg', { static: true }) svg!: ElementRef<SVGSVGElement>;
  failed = false;

  ngAfterViewInit() {
    this.render();
  }

  ngOnChanges() {
    if (this.svg) this.render();
  }

  ngOnDestroy() {
    if (this.svg) this.svg.nativeElement.innerHTML = '';
  }

  private render() {
    const el = this.svg.nativeElement;
    el.innerHTML = '';
    this.failed = false;
    if (!this.value) return;
    try {
      JsBarcode(el, this.value, {
        format: 'CODE128',
        displayValue: false, // keep the payload off-screen text; scanners read the bars
        margin: 12, // quiet zone
        height: 80,
        width: 2,
        background: '#ffffff',
        lineColor: '#000000',
      });
      el.removeAttribute('width');
      el.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    } catch {
      this.failed = true;
    }
  }
}
