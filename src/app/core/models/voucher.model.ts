import { MapperMap } from 'src/app/shared/utils/dto-to-model';
import { environment } from 'src/environments/environment';

export type VoucherType =
  | 'Discount'
  | 'Free Shipping'
  | 'Free Drink'
  | 'Buy 1 Free 1'
  | 'New User Only'
  | 'Birthday Promo';

export interface Voucher {
  id: number;
  rewardId: string;
  name: string;
  shortTitle: string;
  title: string;
  subTitle: string;
  description: string;
  descriptionIOS: string;
  tnc: string;
  category: string;
  type: string;
  point: number;
  status: string;
  isUsed: boolean;
  image: string;
  createDate: string;
  expireDate: string;
  discountAmount: number | null;
  voucherNo: string;
  barcodeNo: string;
  voucherTypeCode: string;
  voucherTypeDesc: string;
  statusFlag: number;
  vchValue: number;
}

export const voucherMapper: MapperMap<any, Voucher> = {
  image: (dto) => (dto.Image ?? '').trim(),
  rewardId: (dto) => dto.RewardId,
  title: (dto) => dto.Title,
  description: (dto) => dto.Description,
  createDate: (dto) => dto.CreateDate,
  expireDate: (dto) => dto.ExpireDate,
  status: (dto) => dto.Status,
  category: (dto) => dto.Category,
  discountAmount: (dto) => dto.DiscountAmount,
  voucherNo: (dto) => dto.VoucherNo,
  barcodeNo: (dto) => dto.BarcodeNo,
  voucherTypeCode: (dto) => dto.VoucherTypeCode,
  voucherTypeDesc: (dto) => dto.VoucherTypeDesc,
  statusFlag: (dto) => dto.StatusFlag,
  vchValue: (dto) => dto.VchValue,
  tnc: (dto) => dto.TnC,
  subTitle: (dto) => dto.SubTitle,
  name: (dto) => dto.Name,
  descriptionIOS: (dto) => dto.DescriptionIOS,
};

