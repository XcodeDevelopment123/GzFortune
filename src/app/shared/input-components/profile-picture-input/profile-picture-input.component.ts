import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { ImageHelperService } from '../../services/image-helper.service';
import { LoadingHelperService } from '../../services/loading-helper.service';
import { BaseInputComponent } from '../base-input.component';

@Component({
  selector: 'app-profile-picture-input',
  templateUrl: './profile-picture-input.component.html',
  styleUrls: ['./profile-picture-input.component.scss'],
  standalone: false,
})
export class ProfilePictureInputComponent extends BaseInputComponent {
  @Input() isEditable: boolean = false;

  constructor(
    private imageHelper: ImageHelperService,
    private loadingHelper: LoadingHelperService,
    injector: Injector,
  ) {
    super(injector);
  }

  async uploadPhoto(event: any, fileInput: HTMLInputElement) {
    if (this.isDisabled) return;

    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    const maxFileSize = 1024 * 1024 * 5; // 5MB
    const isSupportedType = selectedFile.type === 'image/jpeg' || selectedFile.type === 'image/png';
    const isSizeValid = selectedFile.size < maxFileSize;
    if (!isSupportedType || !isSizeValid) {
      this.resetInput(fileInput);
      return;
    }

    const loading = await this.loadingHelper.getWaiting();
    loading.present();

    try {
      const data = await this.imageHelper.convertImageToBase64(selectedFile);
      this.value = this.imageHelper.displayBase64Image(data);
      this.onChange(selectedFile);
      this.onTouched();
      loading.dismiss();
    } catch (err) {
      loading.dismiss();
      this.resetInput(fileInput);
    }
  }

  resetInput(fileInput: HTMLInputElement) {
    fileInput.value = '';
  }
}
