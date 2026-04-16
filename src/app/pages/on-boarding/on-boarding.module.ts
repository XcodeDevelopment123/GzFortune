import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OnBoardingPageRoutingModule } from './on-boarding-routing.module';

import { OnBoardingPage } from './on-boarding.page';
import { OnBoarding1Component } from './components/on-boarding-1/on-boarding-1.component';
import { OnBoarding2Component } from './components/on-boarding-2/on-boarding-2.component';
import { OnBoarding3Component } from './components/on-boarding-3/on-boarding-3.component';
import { OnBoarding4Component } from './components/on-boarding-4/on-boarding-4.component';
import { OnBoarding5Component } from './components/on-boarding-5/on-boarding-5.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, OnBoardingPageRoutingModule],
  declarations: [
    OnBoardingPage,
    OnBoarding1Component,
    OnBoarding2Component,
    OnBoarding3Component,
    OnBoarding4Component,
    OnBoarding5Component,
  ],
})
export class OnBoardingPageModule {}
