import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CartResponse } from 'src/app/core/models/cart.model';

@Component({
  selector: 'app-point-section',
  templateUrl: './point-section.component.html',
  styleUrls: ['./point-section.component.scss'],
  standalone: false,
})
export class PointSectionComponent implements OnChanges {
  @Input() cartData: CartResponse | null = null;
  @Input() availablePoints = 0;

  readonly step = 100;
  readonly maxRedeemPoints = 500;

  redeemedPoints = 0;

  @Output() pointsChanged = new EventEmitter<number>();

  @Output() warn = new EventEmitter<string>();

  ngOnChanges(changes: SimpleChanges): void {
    const maxMultiple = Math.floor(this.availablePoints / this.step) * this.step;
    this.redeemedPoints = Math.min(this.redeemedPoints, maxMultiple);
    this.emitChange();
  }

  dec(): void {
    if (this.redeemedPoints >= this.step) {
      this.redeemedPoints -= this.step;
      this.emitChange();
    }
  }

  inc(): void {
    if (this.cartData!.grandTotal <= 0) {
      this.warn.emit('Order total is zero. Cannot redeem points.');
      return;
    }

    if (this.redeemedPoints >= this.maxRedeemPoints) {
      this.warn.emit('Reminder: The maximum number of points you can redeem is 500.');
      return;
    }

    const next = this.redeemedPoints + this.step;

    if (next > this.maxRedeemPoints) {
      this.warn.emit('Reminder: The maximum number of points you can redeem is 500.');
      return;
    }

    if (next > this.availablePoints) {
      this.warn.emit(`Insufficient Point. Available: ${this.availablePoints} pts.`);
      return;
    }

    this.redeemedPoints = next;
    this.emitChange();
  }

  private emitChange(): void {
    this.pointsChanged.emit(this.redeemedPoints);
  }
}
