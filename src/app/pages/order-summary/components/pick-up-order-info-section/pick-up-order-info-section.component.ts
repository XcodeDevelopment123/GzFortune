import { Component, Input, OnInit } from '@angular/core';
import { Outlet } from 'src/app/core/models/outlet.model';

@Component({
  selector: 'app-pick-up-order-info-section',
  templateUrl: './pick-up-order-info-section.component.html',
  styleUrls: ['./pick-up-order-info-section.component.scss'],
  standalone: false,
})
export class PickUpOrderInfoSectionComponent implements OnInit {
  @Input() selectedOutlet: Outlet | null = null;
  constructor() {}

  ngOnInit() {}
}
