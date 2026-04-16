import { MapperMap } from 'src/app/shared/utils/dto-to-model';
import { environment } from 'src/environments/environment';

export interface Notification {
  content: string;
  deviceId: string;
  id: number;
  image: string;
  imageByte: string;
  isUnread: boolean;
  notificationId: string;
  notificationType: string;
  oneSingalNotificationId: string;
  pushTime: string;
  receiverPhone: string;
  status: string;
  targetId: string;
  title: string;
  type: string;
}

export const notificationMapper: MapperMap<any, Notification> = {
  isUnread: (dto) => dto.IsUnread,
  title: (dto) => dto.Title,
  content: (dto) => dto.Content,
  pushTime: (dto) => dto.PushTime,
};
