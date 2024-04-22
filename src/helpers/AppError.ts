export default class AppError extends Error {
  public status: string;
  constructor(
    public message: string,
    public statusCode: number
  ) {
    super(message);
    this.status = statusCode.toString().startsWith('4') ? 'fail' : 'error';
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
