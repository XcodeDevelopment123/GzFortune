import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-on-boarding',
  templateUrl: './on-boarding.page.html',
  styleUrls: ['./on-boarding.page.scss'],
  standalone: false,
})
export class OnBoardingPage implements OnInit {
  hasPreviousPage: boolean = false;
  currentPage: number = 1;
  constructor(private navCtrl: NavController) {}

  ngOnInit() {
    this.preloadImages();
  }

  navToHome() {
    this.navCtrl.navigateRoot('');
  }

  backToPrevious() {
    this.currentPage--;
  }

  nextPage() {
    this.currentPage++;
  }

  preloadImages() {
    return () => {
      const images = [
        'assets/images/on-boarding-1.png',
        'assets/images/on-boarding-2.png',
        'assets/images/on-boarding-3.png',
        'assets/images/on-boarding-4.png',
        'assets/images/on-boarding-5.png',
      ];

      images.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    };
  }
}
