import { Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CartItemComponent } from '../cart-item/cart-item.component';
import { CartMenuItem, CartResponse } from 'src/app/core/models/cart.model';
import { Outlet } from 'src/app/core/models/outlet.model';

@Component({
  selector: 'app-cart-items-section',
  templateUrl: './cart-items-section.component.html',
  styleUrls: ['./cart-items-section.component.scss'],
  standalone: false,
})
export class CartItemsSectionComponent implements OnInit {
  @ViewChildren(CartItemComponent)
  cartItems!: QueryList<CartItemComponent>;
  @Input() cartData: CartResponse | null = null;
  @Input() items: CartMenuItem[] = [];
  @Input() selectedOutlet: Outlet | null = null;

  constructor() {}

  ngOnInit() {}
}
