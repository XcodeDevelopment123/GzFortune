import { Component, OnInit } from '@angular/core';
import { take, firstValueFrom } from 'rxjs';
import { OutletApiService } from 'src/app/core/repo/api/outlet-api-service';
import { Outlet } from 'src/app/core/models/outlet.model';
import { SelectOption } from 'src/app/shared/statics/interface-helper';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { LoadingHelperService } from 'src/app/shared/services/loading-helper.service';
import { ToastHelperService } from 'src/app/shared/services/toast-helper.service';
import { FeedbackApiService } from 'src/app/core/repo/api/feedback-api-service';
import { Feedback } from 'src/app/core/models/feedback.model';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.page.html',
  styleUrls: ['./feedback.page.scss'],
  standalone: false,
})
export class FeedbackPage implements OnInit {
  form?: FormGroup;
  selectedEmoji: number = 0;

  outletOptions: SelectOption[] = [];
  categoryOptions: SelectOption[] = [
    { label: 'Mobile App', value: 'Mobile App' },
    { label: 'Cleaniness', value: 'Cleaniness' },
    { label: 'Environment', value: 'Environment' },
    { label: 'Food', value: 'Food' },
    { label: 'Price', value: 'Price' },
    { label: 'Service', value: 'Service' },
    { label: 'Other', value: 'Other' },
  ];

  constructor(
    private outletApiService: OutletApiService,
    private fb: FormBuilder,
    private userStateService: UserStateService,
    private loadingHelper: LoadingHelperService,
    private toastHelper: ToastHelperService,
    private feedbackApiService: FeedbackApiService,
  ) {}

  ngOnInit() {
    this.outletApiService
      .getAllOutlets()
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.outletOptions = res.map((outlet: Outlet) => ({
            label: outlet.name,
            value: outlet.name,
          }));
        },
      });

    this.form = this.fb.group({
      category: [null, Validators.required],
      outlet: [null, Validators.required],
      description: [''],
      rating: [null, Validators.required],
    });
  }

  async submit() {
    if (!this.form || this.form.invalid || !this.selectedEmoji) {
      console.log(this.form?.value, this.form?.invalid);

      this.toastHelper.presentFailedToast('Please complete all required fields.');
      return;
    }

    const member = await firstValueFrom(this.userStateService.memberInfo);

    const payload: Feedback = {
      title: 'Feedback',
      description: this.form!.value.description,
      rating: this.selectedEmoji.toString(),
      category: this.form!.value.category,
      userId: member?.userId || '',
      location: this.form!.value.outlet,
    };

    this.loadingHelper.show();

    this.feedbackApiService
      .CreateFeedback(payload)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          console.log('Feedback submitted:', payload);
          this.toastHelper.presentSuccessToast('Feedback submitted successfully!');
          this.form!.reset();
          this.selectedEmoji = 0;
          this.loadingHelper.hide();
        },
        error: (res) => {
          this.toastHelper.presentFailedToast('Something went wrong, try again later', 'middle');
          this.loadingHelper.hide();
        },
      });
  }

  selectEmoji(emoji: number) {
    this.selectedEmoji = emoji !== this.selectedEmoji ? emoji : 0;
    this.form?.get('rating')?.setValue(this.selectedEmoji.toString());
  }
}
