import { MapperMap } from 'src/app/shared/utils/dto-to-model';
import { environment } from 'src/environments/environment';

export interface Stamp {
  id: number;
  name: string;
  description: string;
  image: string;
  point: number;
  status: string;
  stampId: string;
  createDate: string;
  expireDate: string;
}

export const stampMapper: MapperMap<any, Stamp> = {
  image: (dto) => (!!dto.Image?.trim() ? `${environment.serverUrl}/${dto.Image}` : ''),
};
