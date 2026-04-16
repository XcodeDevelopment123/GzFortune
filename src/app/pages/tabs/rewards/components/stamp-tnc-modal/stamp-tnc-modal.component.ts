import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-stamp-tnc-modal',
  templateUrl: './stamp-tnc-modal.component.html',
  styleUrls: ['./stamp-tnc-modal.component.scss'],
  standalone: false,
})
export class StampTncModalComponent implements OnInit {
  tncContent: string = ` <ul class="terms-list">
    <li>Spend RM50& above will get 1 stamp (1 receipt for 1 stamp only).</li>
  <li>3 Stamp  1 x Free topping </li>
  <li>6 Stamp  1 x Free coffee </li>
  <li>9 Stamp  1 x Free juicy </li>
  <li>Reward is valid for dine-in only.</li>
 <li>Reward is valid for dine-in only.</li>
 <li>Reward is strictly valid for 6 Months from the date issue.</li>

  <li>Juicy Malaysia reserves the rights to the change the term & conditions of the rewards without prior notice.</li>
  <li>Redemption only available at All Juicy In Malaysia.</li>

      <li>Spend RM50& above will get 1 stamp (1 receipt for 1 stamp only).</li>
  <li>3 Stamp  1 x Free topping </li>
  <li>6 Stamp  1 x Free coffee </li>
  <li>9 Stamp  1 x Free juicy </li>
  <li>Reward is valid for dine-in only.</li>
 <li>Reward is valid for dine-in only.</li>
 <li>Reward is strictly valid for 6 Months from the date issue.</li>

  <li>Juicy Malaysia reserves the rights to the change the term & conditions of the rewards without prior notice.</li>
  <li>Redemption only available at All Juicy In Malaysia.</li>
  </ul>
`;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}

  dismissModal() {
    this.modalCtrl.dismiss();
  }
}
