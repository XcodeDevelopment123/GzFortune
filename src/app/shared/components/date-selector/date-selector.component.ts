import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-date-selector',
  templateUrl: './date-selector.component.html',
  styleUrls: ['./date-selector.component.scss'],
  standalone: false,
})
export class DateSelectorComponent {
  selectedDate: string = new Date().toISOString();

  constructor(private modalCtrl: ModalController) {}

  confirmDate() {
    this.modalCtrl.dismiss(this.selectedDate);
  }

  dismissModal() {
    this.modalCtrl.dismiss();
  }
}
