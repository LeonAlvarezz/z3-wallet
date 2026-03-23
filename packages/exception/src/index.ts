import {
  DefaultErrorMessage,
  type DefaultErrorMessageKey,
  ErrorCode,
} from "@z3-wallet/types";
import { getKey } from "@z3-wallet/types/enum";
type ErrorParams = {
  error?: unknown;
  message?: string;
  options?: Record<string, any>;
};

export class ErrorException extends Error {
  constructor(
    public status: number,
    public code: DefaultErrorMessageKey,
    message: string,
    public metadata?: Record<string, string>,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class BadRequestException extends ErrorException {
  constructor(params?: ErrorParams) {
    super(
      ErrorCode.BAD_REQUEST,
      getKey(DefaultErrorMessage, DefaultErrorMessage.BAD_REQUEST),
      params?.message || DefaultErrorMessage.BAD_REQUEST,
      params?.options,
    );
  }
}
export class RateLimitException extends ErrorException {
  constructor(params?: ErrorParams) {
    super(
      ErrorCode.RATE_LIMIT,
      getKey(DefaultErrorMessage, DefaultErrorMessage.RATE_LIMIT),
      params?.message || DefaultErrorMessage.RATE_LIMIT,
      params?.options,
    );
  }
}

export class NotFoundException extends ErrorException {
  constructor(params?: ErrorParams) {
    super(
      ErrorCode.NOT_FOUND,
      getKey(DefaultErrorMessage, DefaultErrorMessage.NOT_FOUND),
      params?.message || DefaultErrorMessage.NOT_FOUND,
      params?.options,
    );
  }
}

export class UnauthorizedException extends ErrorException {
  constructor(params?: ErrorParams) {
    super(
      ErrorCode.UNAUTHORIZED,
      getKey(DefaultErrorMessage, DefaultErrorMessage.UNAUTHORIZED),
      params?.message || DefaultErrorMessage.UNAUTHORIZED,
      params?.options,
    );
  }
}

export class ForbiddenException extends ErrorException {
  constructor(params?: ErrorParams) {
    super(
      ErrorCode.FORBIDDEN,
      getKey(DefaultErrorMessage, DefaultErrorMessage.FORBIDDEN),
      params?.message || DefaultErrorMessage.FORBIDDEN,
      params?.options,
    );
  }
}

export class InternalServerException extends ErrorException {
  constructor(params?: ErrorParams) {
    super(
      ErrorCode.INTERNAL_SERVER,
      getKey(DefaultErrorMessage, DefaultErrorMessage.INTERNAL_SERVER),
      params?.message || DefaultErrorMessage.INTERNAL_SERVER,
      params?.options,
    );
  }
}

export class InvalidCookieException extends ErrorException {
  constructor(params?: ErrorParams) {
    super(
      ErrorCode.INVALID_COOKIE,
      getKey(DefaultErrorMessage, DefaultErrorMessage.INVALID_COOKIE),
      params?.message || DefaultErrorMessage.INVALID_COOKIE,
      params?.options,
    );
  }
}

export class InvalidCredentialException extends ErrorException {
  constructor(params?: ErrorParams) {
    super(
      ErrorCode.INVALID_CREDENTIAL,
      getKey(DefaultErrorMessage, DefaultErrorMessage.INVALID_CREDENTIAL),
      params?.message || DefaultErrorMessage.INVALID_CREDENTIAL,
      params?.options,
    );
  }
}
