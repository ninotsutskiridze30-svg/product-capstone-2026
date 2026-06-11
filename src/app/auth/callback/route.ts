import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { routing } from "@/shared/i18n/routing";
import type { Database } from "@/shared/types/database.types";

function withLocalePrefix(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const first = normalized.split("/").filter(Boolean)[0];
  if (first && (routing.locales as readonly string[]).includes(first)) {
    return normalized;
  }
  return `/${routing.defaultLocale}${normalized === "/" ? "" : normalized}`;
}

function getLocaleFromPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const first = normalized.split("/").filter(Boolean)[0];
  if (first && (routing.locales as readonly string[]).includes(first)) {
    return first;
  }
  return routing.defaultLocale;
}

function loginUrl(origin: string, locale: string, error?: string) {
  const u = new URL(`/${locale}/login`, origin);
  if (error) u.searchParams.set("error", error);
  return u;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const next = withLocalePrefix(searchParams.get("next") ?? "/dashboard");
  const locale = getLocaleFromPath(next);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.redirect(loginUrl(origin, locale, "config"));
  }

  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(loginUrl(origin, locale, "auth"));
  }

  const response = NextResponse.redirect(new URL(next, origin));

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(loginUrl(origin, locale, "auth"));
  }

  return response;
}
