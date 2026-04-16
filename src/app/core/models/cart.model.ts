import { dtoToModel, MapperMap } from 'src/app/shared/utils/dto-to-model';

export interface AddCart {
  cartId: string;
  menuIdList: string;
  menuItemList: string;
  memberId: string;
  memberPhone: string;
  subTotal: number;
  grandTotal: number;
  deliveryAddress: string;
  merchantRestaurantAddress: string;
}

export interface EditCart {
  cartId: string;
  menuIdList: string;
  menuItemList: string;
  deliveryAddress: string;
  merchantRestaurantAddress: string;
  receiverName: string;
}

export interface CartResponse {
  id: number;
  cartId: string;
  menuIdList: string;
  menuItemList: CartMenuItem[];
  memberId: string;
  memberPhone: string;
  subTotal: number;
  grandTotal: number;
  paymentStatus: string;
  cartCreateTIme: string;
  cartUpdateTime: string;
  deliveryAddress: string;
  receiverName: string;
  merchantRestaurantAddress: string;
}

export interface CartMenuItem {
  addOns: string;
  addOnsTotalPrice: number;
  image: string;
  menuId: string;
  menuUnitPrice: number;
  productId: string;
  qty: number;
  remark: string | null;
  title: string;
}

export const cartResponseMapper: MapperMap<any, CartResponse> = {
  menuItemList: (dto) => {
    try {
      const raw =
        typeof dto.MenuItemList === 'string' ? JSON.parse(dto.MenuItemList) : dto.MenuItemList;

      // 👇 转换成 CartMenuItem[]
      return raw.map((item: any) => dtoToModel<CartMenuItem, any>(item, cartMenuItemMapper));
    } catch {
      return [];
    }
  },
  subTotal: (dto) => dto.SubTotal,
  grandTotal: (dto) => dto.GrandTotal,
};

export const cartMenuItemMapper: MapperMap<any, CartMenuItem> = {
  addOns: (dto) => dto.AddOns,
  addOnsTotalPrice: (dto) => dto.AddOnsTotalPrice,
  menuId: (dto) => dto.MenuId,
  menuUnitPrice: (dto) => dto.MenuUnitPrice,
  productId: (dto) => dto.ProductId,
  qty: (dto) => dto.Qty,
  remark: (dto) => dto.Remark,
  title: (dto) => dto.Title,
};
