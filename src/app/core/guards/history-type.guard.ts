import { CanActivateFn } from '@angular/router';
import { HistoryPageType } from 'src/app/shared/statics/interface-helper';

export const historyTypeGuard: CanActivateFn = (route, state) => {
  const type = route.paramMap.get('type') as HistoryPageType;

  const allowedTypes: HistoryPageType[] = ['order', 'transaction', 'stamp'];
  if (!type || !allowedTypes.includes(type)) {
    console.error('Not support history type :', type);
    return false;
  }
  return true;
};
