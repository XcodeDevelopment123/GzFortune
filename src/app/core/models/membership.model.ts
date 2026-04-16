import { dtoToModel, MapperMap } from 'src/app/shared/utils/dto-to-model';
import { environment } from 'src/environments/environment';

export interface MembershipLevelResponse {
  currentTier: number;
  lastTier: number;
  membershipLevels: MembershipLevel[];
}

export interface MembershipLevel {
  id: number;
  membershipLevelId: string;
  name: string;
  spendPointRate: number;
  referralPoint: number;
  repeatGetReferralPoint: boolean;
  voucherId: string;
  voucherNumber: number;
  repeatGetVoucher: boolean;
  stampRate: number;
  multipleStamps: boolean;
  tier: number;
  upgradePoint: number;
  createdAt: string;
  updatedAt: string;
  isLastTier: boolean;
  indicatorText: string;
  benefits: MembershipLevelBenefit[];
}

export interface MembershipLevelBenefit {
  id: number;
  membershipLevelBenefitId: string;
  membershipLevelId: string;
  image: string;
  imageByte: string;
  name: string;
}

export const MembershipLevelResponseMapper: MapperMap<any, MembershipLevelResponse> = {
  currentTier: (dto) => dto.CurrentTier,
  lastTier: (dto) => dto.LastTier,
  membershipLevels: (dto) =>
    (dto.MembershipLevels || []).map(
      (level: any): MembershipLevel =>
        dtoToModel<MembershipLevel, any>(level, {
          benefits: (l) =>
            (l.Benefits || []).map(
              (b: any): MembershipLevelBenefit =>
                dtoToModel<MembershipLevelBenefit, any>(b, {
                  image: (benefitDto) =>
                    !!benefitDto.Image?.trim()
                      ? `${environment.serverUrl}/${benefitDto.Image}`
                      : '',
                }),
            ),
        }),
    ),
};
