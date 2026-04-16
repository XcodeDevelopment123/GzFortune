import { MapperMap } from 'src/app/shared/utils/dto-to-model';
import { environment } from 'src/environments/environment';

export interface Menu {
  id: number;
  category: string;
  image: string;
  imageByte: string;
  isDeliveryAllow: boolean;
  isFarvourite: boolean;
  isSpicy: boolean;
  itemDescription: string;
  itemName: string;
  menuId: string;
  price: number;
  qty: number;
  status: string;
}

export interface MenuCategory {
  id: number;
  categoryId: string;
  createDate: string;
  image: string;
  image2: string;
  name: string;
}

export interface MenuGroup {
  categoryName: string;
  items: Menu[];
}

export const menuMapper: MapperMap<any, Menu> = {
  image: (dto) => (!!dto.Image?.trim() ? `${environment.serverUrl}/${dto.Image}` : ''),
  isFarvourite: (dto) => dto.IsFarvourite,
};

export const menuCategoryMapper: MapperMap<any, MenuCategory> = {
  image: (dto) => (!!dto.Image?.trim() ? `${environment.serverUrl}/${dto.Image}` : ''),
  image2: (dto) => (!!dto.Image2?.trim() ? `${environment.serverUrl}/${dto.Image2}` : ''),
};
