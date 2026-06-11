import type { Locale as DateFnsLocale } from "date-fns";
import { enUS } from "date-fns/locale";
import { ka } from "date-fns/locale/ka";

export function getDateFnsLocale(appLocale: string): DateFnsLocale {
  return appLocale === "ka" ? ka : enUS;
}
