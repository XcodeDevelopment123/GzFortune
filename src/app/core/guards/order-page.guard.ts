import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageHelperService } from 'src/app/shared/services/storage-helper.service';
import { OrderTypePre } from 'src/app/shared/statics/interface-helper';

export const orderPageGuard: CanActivateFn = async (route, state) => {
  const storageHelper = inject(StorageHelperService);
  const router = inject(Router);

  // const typePre = (await storageHelper.getCurrentOrderPre()) as OrderTypePre;
  // if (!typePre) {
  //   router.navigate(['/start-order']);
  //   return false;
  // }

  return true;
};
