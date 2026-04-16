import { MapperMap } from 'src/app/shared/utils/dto-to-model';

export interface Feedback {
  title: string;
  description: string;
  rating: string;
  category: string;
  userId: string;
  location: string;
}

export const feedbackMapper: MapperMap<any, Feedback> = {
  title: (dto) => dto.Title,
  description: (dto) => dto.Description,
  rating: (dto) => dto.Rating,
  category: (dto) => dto.Category,
  userId: (dto) => dto.UserId,
  location: (dto) => dto.Location,
};
