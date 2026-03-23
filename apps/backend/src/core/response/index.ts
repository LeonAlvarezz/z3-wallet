import { DefaultErrorMessageKey } from "@z3-wallet/types";

export const Success = <T>(data: T) => ({ success: true as const, data });
export const Fail = ({
  message,
  status,
  metadata,
  code,
}: {
  message: string;
  status: number;
  metadata?: Record<string, any>;
  code: DefaultErrorMessageKey;
}) => ({
  success: false as const,
  error: {
    message,
    status,
    metadata,
    code,
  },
});

export const SimpleSuccess = (message?: string) => ({
  success: true,
  message: message ?? "Success",
});
