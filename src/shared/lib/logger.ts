type LoggerMethod = (...args: unknown[]) => void;

const noop: LoggerMethod = () => {};

export const logger = {
  info:
    process.env.NODE_ENV === "production"
      ? noop
      : (...args: unknown[]) => console.info(...args),
  warn:
    process.env.NODE_ENV === "production"
      ? noop
      : (...args: unknown[]) => console.warn(...args),
  error:
    process.env.NODE_ENV === "production"
      ? noop
      : (...args: unknown[]) => console.error(...args),
};
