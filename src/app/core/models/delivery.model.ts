import { dtoToModel, MapperMap } from 'src/app/shared/utils/dto-to-model';
import { environment } from 'src/environments/environment';
import { CartMenuItem, cartMenuItemMapper } from './cart.model'; // 👈 引入 CartMenuItem

export interface PickUp {
  cartId: string;
  paymentMethod: string;
  stop1AddressName: string;
  outletsId: string;
}

export interface VoucherDelivery {
  createDate: string;
  deliveryVouchersId: string;
  description: string;
  descriptionIOS: string;
  discountAmount: string;
  expireDate: string;
  id: number;
  image: string;
  name: string;
  point: number;
  shortTitle: string;
  status: string;
  subTitle: string;
  title: string;
  tnc: string;
  type: string;
}

export interface OrderHistory {
  cartId: string;
  customerDeliveryAddress: string;
  deliveryFee: number;
  deliveryStatus: string;
  deliveryVoucherTitle: string;
  deliveryVouchersId: string;
  dineInStatus: string;
  driverId: string;
  grandTotal: number;
  id: number;
  lalamoveOrderId: string;
  lalamoveShareLink: string;
  memberPhone: string;
  menuItemList: CartMenuItem[]; // JSON 字符串
  merchantDeliveryAddress: string;
  orderDateTime: string; // ISO 时间字符串
  orderId: string;
  orderStatus: string;
  outletsId: string;
  paymentId: string;
  paymentType: string;
  pickUpStatus: string;
  pointDiscount: number;
  receiverName: string;
  subTotal: number;
  tax: number;
  type: string;
  updateDateTime: string;
  voucherDiscount: number;
}

export type VoucherDeliveryList = VoucherDelivery[];

export const voucherDeliveryMapper: MapperMap<any, VoucherDelivery> = {
  image: (dto) => (!!dto.Image?.trim() ? `${environment.serverUrl}/${dto.Image}` : ''),
};

export const orderHistoryMapper: MapperMap<any, OrderHistory> = {
  orderId: (dto) => dto.OrderId,

  menuItemList: (dto) => {
    try {
      const raw =
        typeof dto.MenuItemList === 'string' ? JSON.parse(dto.MenuItemList) : dto.MenuItemList;

      return raw.map((item: any) => dtoToModel<CartMenuItem, any>(item, cartMenuItemMapper));
    } catch {
      return [];
    }
  },
};

export interface CreatePickUpRequest {
  cartId: string;
  paymentMethod: string;
  stop1AddressName: string;
  outletsId: string;
}
