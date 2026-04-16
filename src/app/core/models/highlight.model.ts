import { MapperMap } from 'src/app/shared/utils/dto-to-model';
import { environment } from 'src/environments/environment';

export interface Highlight {
  id: number;
  highlightId: string;
  image: string;
  imageByte: string;
  title: string;
  subTitle: string;
  type: string;
  description: string;
  descriptionIOS: string;
  tnC: string;
  createDate: Date;
  expireDate: Date;
  externalLink: string;
  buttonText: string;
  status: string;
}

export const highlightMapper: MapperMap<any, Highlight> = {
  image: (dto) => (dto.Image ?? '').trim(),
  description: (dto) => dto.Description,
  tnC: (dto) => dto.TnC,
  title: (dto) => dto.Title,
  subTitle: (dto) => dto.SubTitle,
};
