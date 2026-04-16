import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Menu } from 'src/app/core/models/menu.model';

@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss'],
  standalone: false,
})
export class MenuItemComponent {
  @ViewChild('root', { static: true }) rootRef!: ElementRef;

  get nativeEl(): HTMLElement {
    return this.rootRef.nativeElement;
  }
  @Input() item!: Menu;
}
