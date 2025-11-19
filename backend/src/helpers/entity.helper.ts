/**
 * Entity helper utilities for common entity operations
 * Follows DRY principle by centralizing repetitive patterns
 */

/**
 * Remove sensitive fields from an entity
 * @param entity The entity object
 * @param fieldsToOmit Array of field names to remove
 * @returns Entity without specified fields
 */
export function omitFields<T extends Record<string, any>, K extends keyof T>(
  entity: T,
  fieldsToOmit: K[]
): Omit<T, K> {
  const result = { ...entity };
  fieldsToOmit.forEach((field) => delete result[field]);
  return result;
}

/**
 * Remove passwordHash field from user entity
 * @param user User entity with passwordHash
 * @returns User entity without passwordHash
 */
export function removePasswordHash<T extends { passwordHash?: any }>(
  user: T
): Omit<T, 'passwordHash'> {
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Remove password field from user entity
 * @param user User entity with password
 * @returns User entity without password
 */
export function removePassword<T extends { password?: any }>(
  user: T
): Omit<T, 'password'> {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Generic entity existence validator
 * Throws error if entity is not found
 */
export function validateEntityExists<T>(
  entity: T | null,
  entityName: string,
  identifier?: string | number
): asserts entity is T {
  if (!entity) {
    const idMsg = identifier ? ` with ${identifier}` : '';
    throw new Error(`${entityName} not found${idMsg}`);
  }
}

/**
 * Validate entity uniqueness by name/identifier
 * Throws error if entity with same identifier already exists
 */
export function validateUniqueness<T extends { id?: number }>(
  existingEntity: T | null,
  currentId: number | undefined,
  fieldName: string,
  fieldValue: string | number
): void {
  if (existingEntity && existingEntity.id !== currentId) {
    throw new Error(
      `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} '${fieldValue}' already exists`
    );
  }
}

/**
 * Validate deletion success
 * Throws error if deletion failed
 */
export function validateDeletion(
  deleted: boolean,
  entityName: string,
  customMessage?: string
): void {
  if (!deleted) {
    const errorMessage = customMessage || `Failed to delete ${entityName}`;
    throw new Error(errorMessage);
  }
}
