import { Request, Response } from 'express';
import { ResponseHelper } from './response.helper';

/**
 * Base Controller class providing common controller functionality
 * Follows DRY principle by centralizing repetitive controller patterns
 */
export abstract class BaseController {
  /**
   * Validates and parses an ID from request parameters
   * @param req Express request object
   * @param res Express response object
   * @param paramName Name of the parameter (defaults to 'id')
   * @returns Parsed ID or null if invalid
   */
  protected validateId(
    req: Request,
    res: Response,
    paramName: string = 'id'
  ): number | null {
    const id = parseInt(req.params[paramName], 10);
    if (isNaN(id)) {
      ResponseHelper.error(res, `Invalid ${paramName}`, 400);
      return null;
    }
    return id;
  }

  /**
   * Wraps async controller methods with try-catch error handling
   * Automatically handles error responses
   */
  protected asyncHandler<T = any>(
    handler: (req: Request, res: Response) => Promise<T>,
    options?: {
      successMessage?: string;
      errorMessage?: string;
      successStatus?: number;
      notFoundErrorCode?: string;
    }
  ) {
    return async (req: Request, res: Response): Promise<void> => {
      try {
        const result = await handler(req, res);

        // Only send response if not already sent by handler
        if (!res.headersSent && options?.successMessage) {
          ResponseHelper.success(
            res,
            result,
            options.successMessage,
            options.successStatus || 200
          );
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : options?.errorMessage || 'An error occurred';

        // Determine status code based on error message
        let statusCode = 500;
        if (
          message.includes('not found') ||
          message === options?.notFoundErrorCode
        ) {
          statusCode = 404;
        } else if (
          message.includes('already exists') ||
          message.includes('Invalid') ||
          message.includes('Validation')
        ) {
          statusCode = 400;
        } else if (message.includes('Unauthorized')) {
          statusCode = 401;
        } else if (message.includes('Forbidden')) {
          statusCode = 403;
        }

        ResponseHelper.error(res, message, statusCode);
      }
    };
  }

  /**
   * Generic handler for getAll operations
   */
  protected handleGetAll = <T>(
    serviceMethod: (query: any) => Promise<T>,
    successMessage: string = 'Items retrieved successfully'
  ) => {
    return this.asyncHandler(
      async (req) => await serviceMethod(req.query),
      { successMessage }
    );
  };

  /**
   * Generic handler for getById operations
   */
  protected handleGetById = <T>(
    serviceMethod: (id: number) => Promise<T>,
    successMessage: string = 'Item retrieved successfully',
    paramName: string = 'id'
  ) => {
    return this.asyncHandler(
      async (req, res) => {
        const id = this.validateId(req, res, paramName);
        if (id === null) throw new Error('Invalid ID');
        return await serviceMethod(id);
      },
      { successMessage }
    );
  };

  /**
   * Generic handler for create operations
   */
  protected handleCreate = <T>(
    serviceMethod: (data: any) => Promise<T>,
    successMessage: string = 'Item created successfully'
  ) => {
    return this.asyncHandler(
      async (req) => await serviceMethod(req.body),
      { successMessage, successStatus: 201 }
    );
  };

  /**
   * Generic handler for update operations
   */
  protected handleUpdate = <T>(
    serviceMethod: (id: number, data: any) => Promise<T>,
    successMessage: string = 'Item updated successfully',
    paramName: string = 'id'
  ) => {
    return this.asyncHandler(
      async (req, res) => {
        const id = this.validateId(req, res, paramName);
        if (id === null) throw new Error('Invalid ID');
        return await serviceMethod(id, req.body);
      },
      { successMessage }
    );
  };

  /**
   * Generic handler for delete operations
   */
  protected handleDelete = (
    serviceMethod: (id: number) => Promise<void>,
    successMessage: string = 'Item deleted successfully',
    paramName: string = 'id'
  ) => {
    return this.asyncHandler(
      async (req, res) => {
        const id = this.validateId(req, res, paramName);
        if (id === null) throw new Error('Invalid ID');
        await serviceMethod(id);
        return null;
      },
      { successMessage }
    );
  };

  /**
   * Generic handler for count operations
   */
  protected handleGetCount = (
    serviceMethod: () => Promise<number>,
    successMessage: string = 'Count retrieved successfully'
  ) => {
    return this.asyncHandler(
      async () => ({ count: await serviceMethod() }),
      { successMessage }
    );
  };
}
