import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Member } from 'src/app/core/models/member.model';
import { Reward } from 'src/app/core/models/reward.model';

@Component({
  selector: 'app-reward-list',
  templateUrl: './reward-list.component.html',
  styleUrls: ['./reward-list.component.scss'],
  standalone: false,
})
export class RewardListComponent implements OnInit, OnChanges {
  @Input() rewards: Reward[] = [];
  @Input() memberInfo: Member | null = null;
  @Input() isLoaded: boolean = false;

  displayRewards: Reward[] = [];

  ngOnInit() {
    this.applyFilterAndSort();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['rewards']) {
      this.applyFilterAndSort();
    }
  }

  private applyFilterAndSort() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    this.displayRewards = (this.rewards ?? [])
      .filter((r) => this.isRewardDisplayable(r, todayStart))
      .sort((a, b) => (a.point ?? 0) - (b.point ?? 0));

    // 如果你真的想在这里标记 loaded（但一般不建议子组件改 Input）
    // this.isLoaded = true;
  }

  private isRewardDisplayable(r: Reward, todayStart: Date): boolean {
    // 只显示 Active（Inactive 过滤掉）
    const status = (r as any).status;
    if (status && String(status).toLowerCase() !== 'active') return false;

    // 过期过滤（expireDate / expiryDate）
    const exp = this.getExpiryDate(r);
    if (!exp) return true; // 没有过期日：默认显示（你也可以改成 false）

    // exp < 今天00:00 => 过期不显示
    return exp.getTime() >= todayStart.getTime();
  }

  private getExpiryDate(r: Reward): Date | null {
    const anyR = r as any;
    const raw: string | null = anyR.expireDate ?? anyR.expiryDate ?? null;
    if (!raw) return null;

    // "YYYY-MM-DD" -> 本地时间 00:00
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      const [y, m, d] = raw.split('-').map(Number);
      return new Date(y, m - 1, d, 0, 0, 0, 0);
    }

    // ISO string -> Date
    const dt = new Date(raw);
    return isNaN(dt.getTime()) ? null : dt;
  }
}
