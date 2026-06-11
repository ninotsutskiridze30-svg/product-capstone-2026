import { routing } from "./routing";

export function toPathWithoutLocale(pathname: string): string {
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const parts = p.split("/").filter(Boolean);
  const first = parts[0];
  if (first && (routing.locales as readonly string[]).includes(first)) {
    const rest = parts.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }
  return p;
}

export function withLocalePrefix(locale: string, pathname: string): string {
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (
    routing.locales.some((l) => p === `/${l}` || p.startsWith(`/${l}/`))
  ) {
    return p;
  }
  return `/${locale}${p}`;
}
