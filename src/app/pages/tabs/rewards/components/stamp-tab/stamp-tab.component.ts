import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { StampTncModalComponent } from '../stamp-tnc-modal/stamp-tnc-modal.component';
import { Stamp } from 'src/app/core/models/stamp.model';
import { HistoryApiService } from 'src/app/core/repo/api/history-api.service';
import { take, tap } from 'rxjs';
import { TransactionHistory } from 'src/app/core/models/transactionhistory.model';
import { ModalHelperService } from 'src/app/shared/services/modal-helper.service';

@Component({
  selector: 'app-stamp-tab',
  templateUrl: './stamp-tab.component.html',
  styleUrls: ['./stamp-tab.component.scss'],
  standalone: false,
})
export class StampTabComponent implements OnInit {
  constructor(
    private modalCtrl: ModalController,
    private historyApiService: HistoryApiService,
    private modalHelper: ModalHelperService,
  ) {}
  @Input() userPhoneNumber: string = '';
  @Input() stampList: Stamp[] = [];
  @Input() userTotalStamp: number = 0;
  //userTotalStamp: number = 6;
  selectedStamp!: Stamp;
  stampImages: string[] = [];

  stampHistoryResult: TransactionHistory[] | null = null;
  historySample = [
    { name: 'Free Coffee', point: 3 },
    { name: 'Big Cup Upgrade', point: 5 },
    { name: 'Special Gift', point: 9 },
  ];

  private stampSlotTypes = ['cup', 'cup', 'gift', 'cup', 'cup', 'gift', 'cup', 'cup', 'gift'];

  requiredPoint = this.stampList.reduce((max, s) => Math.max(max, s.point), 0);

  ngOnInit() {
    this.openTncModal();
    this.updateStampImages();

    if (this.userPhoneNumber) {
      this.historyApiService
        .getStampHistoryByPhone(this.userPhoneNumber)
        .pipe(take(1))
        .subscribe((res) => {
          if (Array.isArray(res) && res.length > 0) {
            this.stampHistoryResult = res.sort((a, b) => {
              return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
            });
          } else {
            this.stampHistoryResult = [];
          }

          // console.log('📡 stampHistoryResult =', this.stampHistoryResult);
          // console.log('✅ Array.isArray?', Array.isArray(this.stampHistoryResult));
          // console.log('📏 Length =', this.stampHistoryResult?.length);
        });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // stampList 或 userTotalStamp 一有变化就更新
    if (changes['stampList'] || changes['userTotalStamp']) {
      this.updateRequiredPoint();
      this.updateStampImages();
    }
  }

  private updateRequiredPoint(): void {
    this.requiredPoint = this.stampList.reduce((max, s) => Math.max(max, s.point), 0);
  }

  private updateStampImages(): void {
    const total = this.userTotalStamp ?? 0;

    this.stampImages = this.stampSlotTypes.map((type, index) => {
      const isActive = index < total;
      const imgPath = `/assets/images/stamp-item-${type}${isActive ? '-active' : ''}.png`;
      return imgPath;
    });
  }

  onStampChanged(newStamp: Stamp) {
    this.selectedStamp = newStamp;
  }

  async openTncModal() {
    const modal = await this.modalCtrl.create({
      component: StampTncModalComponent,
      cssClass: 'stamp-tnc-modal',
      initialBreakpoint: 0.5,
      breakpoints: [0, 0.5, 1],
      backdropDismiss: true,
    });

    await modal.present();
  }

  async openQrModal(rewardId: string) {
    const qrData = `${rewardId}|${this.userPhoneNumber}`;
    const modal = await this.modalHelper.createQrCodeModal(qrData, qrData);
    await modal.present();
  }
}
