import type { ValidationResult } from "@shared/types/validation.types";
import type { ZodSchema } from "zod";

export async function validateBody<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<ValidationResult<T>> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return {
        data: null,
        error: Response.json(
          {
            code: "VALIDATION_ERROR",
            errors: result.error.flatten().fieldErrors,
          },
          { status: 422 },
        ),
      };
    }

    return { data: result.data, error: null };
  } catch {
    return {
      data: null,
      error: Response.json({ code: "INVALID_JSON" }, { status: 400 }),
    };
  }
}
