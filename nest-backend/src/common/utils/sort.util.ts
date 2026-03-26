import { BadRequestException } from '@nestjs/common';

export function resolveSortField(
  sortBy: string | undefined,
  allowedFields: readonly string[],
  defaultField: string,
): string {
  const field = sortBy ?? defaultField;

  if (!allowedFields.includes(field)) {
    throw new BadRequestException(
      `Invalid sort field. Allowed values: ${allowedFields.join(', ')}`,
    );
  }

  return field;
}
