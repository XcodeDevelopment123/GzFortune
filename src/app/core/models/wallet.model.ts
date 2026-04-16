import { MapperMap } from 'src/app/shared/utils/dto-to-model';

export interface Wallet {
  availablePoint: number;
  balance: number;
  createDate: string;
  expireDate: string;
  id: number;
  phoneNumber: string;
  point: number;
  pointBonus: number;
  status: string;
  tier: string;
  totalStamp: number;
  totalTopupAmount: number;
  userId: string;
  walletId: string;
}

export const walletMapper: MapperMap<any, Wallet> = {
  balance: (dto) => dto.Balance,
  phoneNumber: (dto) => dto.PhoneNumber,
};
