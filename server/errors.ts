export class ExtractionError extends Error {
  statusCode: number;
  publicMessage: string;

  constructor(publicMessage: string, statusCode = 500, cause?: unknown) {
    super(publicMessage);
    this.name = "ExtractionError";
    this.statusCode = statusCode;
    this.publicMessage = publicMessage;
    this.cause = cause;
  }
}
