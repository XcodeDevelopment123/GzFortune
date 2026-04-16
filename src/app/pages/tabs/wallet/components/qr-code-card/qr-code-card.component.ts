import { Component, Input, OnInit } from '@angular/core';
import { Wallet } from 'src/app/core/models/wallet.model';
import { ModalHelperService } from 'src/app/shared/services/modal-helper.service';

@Component({
  selector: 'app-qr-code-card',
  templateUrl: './qr-code-card.component.html',
  styleUrls: ['./qr-code-card.component.scss'],
  standalone: false,
})
export class QrCodeCardComponent implements OnInit {
  @Input() walletInfo: Wallet | null = null;
  qrData: string = 'https://example.com';

  constructor(private modalHelper: ModalHelperService) {}

  ngOnInit() {}

  async showQrModal() {
    const phone = this.walletInfo?.phoneNumber!;
    const modal = await this.modalHelper.createQrCodeModal(phone, phone);
    await modal.present();
  }
}
