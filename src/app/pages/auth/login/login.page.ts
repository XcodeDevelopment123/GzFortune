import { Component, OnInit } from '@angular/core';
import { LoginType } from 'src/app/shared/statics/interface-helper';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  LOGIN_TYPE = LoginType;
  loginType?: LoginType = LoginType.PHONE;

  constructor() {}

  ngOnInit() {}

  loginTypeChanged(type: LoginType) {
    this.loginType = type;
  }
}
