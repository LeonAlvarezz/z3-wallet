import { ErrorException as BaseException } from "@z3-wallet/exception";

export class ErrorException extends BaseException {
  toResponse() {
    return Response.json(
      {
        error: this.message,
        code: this.status,
      },
      {
        status: this.status,
      },
    );
  }
}
