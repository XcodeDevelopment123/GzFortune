import { MapperMap } from 'src/app/shared/utils/dto-to-model';
import { environment } from 'src/environments/environment';

export interface Reward {
  id: number;
  rewardId: string;
  name: string;
  image: string;
  imageByte: string;
  title: string;
  subTitle: string;
  point: number;
  shortTitle: string;
  description: string;
  descriptionIOS: string;
  tnC: string;
  createDate: Date;
  expireDate: Date;
  status: string;
  category: string;
  type: string;
  barcodeNo: string;
  expiryDate: string;
  statusFlag: string;
  vchValue: string;
  voucherNo: string;
  voucherTypeCode: string;
  voucherTypeDesc: string;
}

export const rewardMapper: MapperMap<any, Reward> = {
  image: (dto) => (dto.Image ?? '').trim(),
  description: (dto) => dto.Description,
  tnC: (dto) => dto.TnC,
  title: (dto) => dto.Title,
  subTitle: (dto) => dto.SubTitle,
};
