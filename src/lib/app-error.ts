/**
 * @example
 * if (user === null)
 *   throw new AppError(
 *     commonErrors.Unauthorized,
 *     'Describe here what happened',
 *     true,
 *   )
 */

export class AppError extends Error {
  // public readonly commonType: string
  public readonly isOperational: boolean

  constructor(
    /* commonType: string, */ description: string,
    isOperational = true,
  ) {
    super(description)

    Object.setPrototypeOf(this, new.target.prototype)

    // this.commonType = commonType
    this.isOperational = isOperational

    Error.captureStackTrace(this)
  }
}
