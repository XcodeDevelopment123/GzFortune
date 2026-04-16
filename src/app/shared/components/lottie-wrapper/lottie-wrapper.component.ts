import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-lottie-wrapper',
  templateUrl: './lottie-wrapper.component.html',
  styleUrls: ['./lottie-wrapper.component.scss'],
  standalone: false,
})
export class LottieWrapperComponent {
  /**
   * Path to the lottie JSON animation file.
   */
  @Input() src: string = '';

  /**
   * Custom CSS class for styling.
   */
  @Input() lottieClass: string = '';

  /**
   * Whether the animation should loop.
   */
  @Input() loop: boolean = false;

  /**
   * Whether the animation should autoplay on load.
   */
  @Input() autoplay: boolean = true;

  /**
   * Playback speed (units per second).
   */
  @Input() speed: number = 1;

  @ViewChild('lottiePlayer', { static: false }) lottiePlayerRef!: ElementRef;

  /**Play the animation */
  play() {
    (this.lottiePlayerRef.nativeElement as any).play();
  }

  /**Pause the animation */
  pause() {
    (this.lottiePlayerRef.nativeElement as any).pause();
  }

  /**Stop the animation */
  stop() {
    (this.lottiePlayerRef.nativeElement as any).stop();
  }

  /**
   * Set a new playback speed.
   * @param newSpeed new speed value
   */
  setSpeed(newSpeed: number) {
    (this.lottiePlayerRef.nativeElement as any).setSpeed(newSpeed);
  }

  /**
   * Load a new animation source.
   * @param newSrc  animation JSON file path
   */
  loadAnimation(newSrc: string) {
    const player = this.lottiePlayerRef.nativeElement as any;
    player.load(newSrc);
    player.play();
  }
}
