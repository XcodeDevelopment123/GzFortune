import camelCase from 'lodash.camelcase';

export type MapperMap<TDto, TModel> = Partial<Record<keyof TModel, (dto: TDto) => any>>;
/**
 * Converts a DTO object (typically from an API response) into a Model object by transforming all property names to camelCase.
 *
 * This function provides two mapping strategies:
 * 1. For fields specified in the `customMap`, it uses the custom transformation logic.
 * 2. For all other fields, it automatically converts the original DTO keys to camelCase and assigns their values directly.
 *
 * ⚠️ **Important Notes:**
 * - This function assumes that the DTO and Model properties are semantically the same after converting DTO property names to camelCase.
 * - It is primarily designed to normalize inconsistent API JSON responses (PascalCase, snake_case, etc.) to a consistent camelCase format on the frontend.
 * - Only properties existing in both DTO and Model will be mapped.
 * - `customMap` should only specify fields where the DTO property name and Model property name are not directly mappable by camelCase.
 *
 * @template TModel - The target Model type with camelCase properties.
 * @template TDto - The source DTO type (raw API response with unknown casing).
 * @param dto - The original DTO object to be transformed.
 * @param customMap - (Optional) A mapping object where specific Model fields can have custom extraction logic from the DTO.
 * @returns The transformed model object with all keys in camelCase format.
 *
 * @example
 * interface UserDto {
 *   UserName: string;
 *   EmailVerified: boolean;
 *   Birthday: string;
 * }
 *
 * interface User {
 *   userName: string;
 *   emailVerified: boolean;
 *   birthDate: string;
 * }
 *
 * const dto: UserDto = {
 *   UserName: "John",
 *   EmailVerified: true,
 *   Birthday: "1990-01-01"
 * };
 *
 * const customMap: MapperMap<UserDto, User> = {
 *   birthDate: (dto) => dto.Birthday // Custom mapping for non-standard field
 * };
 *
 * const model = dtoToModel<User, UserDto>(dto, customMap);
 * // Result:
 * // {
 * //   userName: "John",
 * //   emailVerified: true,
 * //   birthDate: "1990-01-01"
 * // }
 */
export function dtoToModel<TModel, TDto>(
  dto: TDto,
  customMap: MapperMap<TDto, TModel> = {},
): TModel {
  const model: any = {};
  for (const key in dto) {
    if (!Object.prototype.hasOwnProperty.call(dto, key)) continue;
    const camelKey = camelCase(key);
    const customFn = customMap[camelKey as keyof TModel];
    if (typeof customFn === 'function') {
      model[camelKey] = customFn(dto);
    } else {
      model[camelKey] = (dto as any)[key];
    }
  }
  // Ensure customMap-only fields not in dto are filled
  for (const modelKey in customMap) {
    if (!(modelKey in model)) {
      const customFn = customMap[modelKey as keyof TModel];
      if (typeof customFn === 'function') {
        model[modelKey] = customFn(dto);
      }
    }
  }
  return model as TModel;
}
