import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-qr-code-modal',
  templateUrl: './qr-code-modal.component.html',
  styleUrls: ['./qr-code-modal.component.scss'],
  standalone: false,
})
export class QrCodeModalComponent implements OnInit {
  @Input() qrData: string = 'https://example.com';
  @Input() labelText: string = '';

  scale: number = 8;
  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    const windowWidth = window.innerWidth;
    this.scale = this.calculateScale(windowWidth);
  }

  private calculateScale(width: number): number {
    if (width > 430) {
      return 11;
    } else if (width > 400) {
      return 9;
    } else {
      return 7;
    }
  }

  dismissModal() {
    this.modalCtrl.dismiss();
  }
}
