import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs';
import { HighlightApiService } from 'src/app/core/repo/api/highlight-api.service';
import { Highlight } from 'src/app/core/models/highlight.model';
import { ToastHelperService } from 'src/app/shared/services/toast-helper.service';
import { Share } from '@capacitor/share';

@Component({
  selector: 'app-highlight',
  templateUrl: './highlight.page.html',
  styleUrls: ['./highlight.page.scss'],
  standalone: false,
})
export class HighlightPage implements OnInit, OnDestroy {
  highlightDetail?: Highlight;

  constructor(
    private route: ActivatedRoute,
    private highlightApi: HighlightApiService,
    private toastHelper: ToastHelperService,
  ) {}

  ngOnInit() {
    //Directly get
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.toastHelper.presentFailedToast('Something went wrong, Try again later');
      return;
    }

    this.highlightApi
      .userGetHighlightById(id)
      .pipe(take(1))
      .subscribe((highlightDetail) => {
        this.highlightDetail = highlightDetail;
        console.log('High Light Load :', this.highlightDetail);
      });
  }

  ngOnDestroy() {}

  async share(type: string, id: string) {
    await Share.share({
      title: 'Share Referral Code',
      text: 'Join Our App now to get more reward \n',
      url: `https://juicyportal.xcode.com.my/sharelink/${type}/${id}`,
      dialogTitle: 'Share With',
    });
  }
}
