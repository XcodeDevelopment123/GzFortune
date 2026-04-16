import { Component, Input, input, OnInit } from '@angular/core';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
  standalone: false,
})
export class LoadingComponent implements OnInit {
  @Input() message: string = 'Please waits...';

  private backButtonListener: Function | null = null;

  constructor() {}

  ngOnInit() {
    App.removeAllListeners();
    App.addListener('backButton', (event) => {
      return;
    });
  }

  ngOnDestroy() {
    App.removeAllListeners();
  }
}
