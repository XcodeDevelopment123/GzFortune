import { MapperMap } from 'src/app/shared/utils/dto-to-model';
import { environment } from 'src/environments/environment';

export interface Member {
  accountStatus: string;
  availablePoint: number;
  balance: number;
  birthDate: string;
  createDate: string;
  deviceId: string;
  email: string;
  emailSubcribe: string;
  emailVerified: boolean;
  expireDate: string;
  firstLogin: string;
  image: string;
  imageByte: string;
  indicatorMax: number;
  indicatorText: string;
  name: string;
  notificationStatus: string;
  password: string;
  phoneNumber: string;
  phoneVerified: boolean;
  point: number;
  pointBonus: number;
  pointIndicatorText: string;
  pointIndicatorText2: string;
  referralBy: string;
  referralCode: string;
  registerTime: string;
  status: string;
  tier: string;
  totalStamp: number;
  totalTopupAmount: number;
  userId: string;
  walletId: string;
  contactId?: number;
}

export interface MemberAddress {
  id: number;
  addressId: string;
  memberPhone: string;
  address: string;
  remark: string;
  latitude: number;
  longitude: number;
  receiverPhone: string;
  receiverName: string;
  isDefault: boolean;
}

export const memberMapper: MapperMap<any, Member> = {
  image: (dto) => (dto.Image ?? '').trim(),
  name: (dto) => dto.Name,
  phoneNumber: (dto) => dto.PhoneNumber,
  point: (dto) => dto.Point,
  tier: (dto) => dto.Tier,
  // 其它字段同理：优先 dto.<Field>，否则 dto.data?.<Field>
};
