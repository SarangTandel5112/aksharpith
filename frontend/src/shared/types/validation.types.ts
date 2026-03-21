export type ValidationSuccess<T> = { data: T; error: null };
export type ValidationFailure = { data: null; error: Response };
export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;
