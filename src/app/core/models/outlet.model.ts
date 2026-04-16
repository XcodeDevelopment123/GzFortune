import { MapperMap } from 'src/app/shared/utils/dto-to-model';
import { environment } from 'src/environments/environment';

export interface Outlet {
  id: number;
  outletsId: string;
  status: string;
  latitude: number;
  longitude: number;
  name: string;
  phoneNumber: string;
  address: string;
  tagge: string;
  imageByte: string;
  onlineOrder: boolean;
  imageUrl: string;
  image: string;
}

export const outletMapper: MapperMap<any, Outlet> = {
  name: (dto) => dto.Name,
  outletsId: (dto) => dto.OutletsId,
  image: (dto) => (dto.Image ?? '').trim(),
};
