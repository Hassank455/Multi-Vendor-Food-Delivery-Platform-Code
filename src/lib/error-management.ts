import { AppError } from './app-error'

export const commonErrors = {
  unauthenticated: 'Authentication Required',
  unauthorized: 'Unauthorized',
  notFound: 'Not Found',
  badRequest: 'Bad Request',

  internalError: 'Internal Server Error',
  serviceUnavailable: 'Service Unavailable',
  databaseError: 'Database Error',
  networkError: 'Network Error',

  somethingWrong: 'Something Went Wrong',
  invalidCredentials: 'Invalid credentials',
  alreadyLoggedIn: 'You are already logged in',
} as const

class ErrorHandler {
  public async handleError(_err: Error): Promise<void> {
    // await logger.logError(err)
    // await sendMailToAdminIfCritical()
    // await saveInOpsQueueIfCritical()
    // await determineIfOperationalError()
  }

  public isTrustedError(error: Error) {
    if (error instanceof AppError) return error.isOperational
    return false
  }
}

const errorHandler = new ErrorHandler()

process.on('unhandledRejection', (reason) => {
  // I just caught an unhandled promise rejection,
  // since we already have fallback handler for unhandled errors (see below),
  // let throw and let him handle that
  throw reason
})

process.on('uncaughtException', (error) => {
  // I just received an error that was never handled, time to handle it and then decide whether a restart is needed
  errorHandler.handleError(error)
  if (!errorHandler.isTrustedError(error)) process.exit(1)
})
