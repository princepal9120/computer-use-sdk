export const computerUseErrorCodes = [
  "authentication",
  "permission",
  "not_found",
  "timeout",
  "rate_limited",
  "unavailable",
  "unsupported",
  "invalid_input",
  "conflict",
  "terminated",
  "driver_error",
  "internal",
] as const;

export type ComputerUseErrorCode = (typeof computerUseErrorCodes)[number];

const sensitive =
  /((?:token|key|secret|authorization|credential|signature)=?)[^\s&,]+|https?:\/\/[^\s]+(?:token|sig|signature|key)=[^\s&]+/gi;

export function redactSensitive(value: string): string {
  return value.replace(sensitive, "$1[REDACTED]");
}

export class ComputerUseError extends Error {
  readonly code: ComputerUseErrorCode;
  readonly provider: string;
  readonly operation?: string;
  readonly retryable: boolean;
  override readonly cause?: unknown;

  constructor(options: {
    code: ComputerUseErrorCode;
    provider: string;
    message: string;
    operation?: string;
    retryable?: boolean;
    cause?: unknown;
  }) {
    super(redactSensitive(options.message), { cause: options.cause });
    this.name = "ComputerUseError";
    this.code = options.code;
    this.provider = options.provider;
    this.operation = options.operation;
    this.retryable =
      options.retryable ??
      ["rate_limited", "timeout", "unavailable"].includes(options.code);
    this.cause = options.cause;
  }

  override toString(): string {
    return `${this.name} [${this.code}]: ${this.message}`;
  }
}

export function isComputerUseError(error: unknown): error is ComputerUseError {
  return error instanceof ComputerUseError;
}

export function normalizeError(
  provider: string,
  operation: string,
  error: unknown,
  fallback: ComputerUseErrorCode = "internal",
): ComputerUseError {
  if (isComputerUseError(error)) return error;
  const message = error instanceof Error ? error.message : "Unknown provider error";
  const lower = message.toLowerCase();
  const code: ComputerUseErrorCode =
    lower.includes("unauthorized") || lower.includes("api key")
      ? "authentication"
      : lower.includes("forbidden") || lower.includes("permission")
        ? "permission"
        : lower.includes("not found") || lower.includes("enoent")
          ? "not_found"
          : lower.includes("timeout") || lower.includes("timed out")
            ? "timeout"
            : lower.includes("rate limit") || lower.includes("429")
              ? "rate_limited"
              : lower.includes("already exists") || lower.includes("conflict")
                ? "conflict"
                : fallback;
  return new ComputerUseError({ code, provider, operation, message, cause: error });
}

export function unsupported(provider: string, operation: string): never {
  throw new ComputerUseError({
    code: "unsupported",
    provider,
    operation,
    message: `${provider} does not support ${operation}`,
  });
}
