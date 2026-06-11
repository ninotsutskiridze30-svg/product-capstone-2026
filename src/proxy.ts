import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";

import { routing } from "@/shared/i18n/routing";
import type { Database } from "@/shared/types/database.types";

const intlMiddleware = createIntlMiddleware(routing);

function localeAndPath(pathname: string): { locale: string; pathWithoutLocale: string } {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (first && (routing.locales as readonly string[]).includes(first)) {
    const rest = segments.slice(1).join("/");
    return { locale: first, pathWithoutLocale: rest ? `/${rest}` : "/" };
  }
  return { locale: routing.defaultLocale, pathWithoutLocale: pathname };
}

export default async function proxy(request: NextRequest) {
  const { locale, pathWithoutLocale } = localeAndPath(request.nextUrl.pathname);

  const intlResponse = intlMiddleware(request);
  if (intlResponse.status === 307 || intlResponse.status === 308) {
    return intlResponse;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    intlResponse.headers.set("x-pathname-locale", locale);
    return intlResponse;
  }

  let response = intlResponse;

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const needsAuth =
    pathWithoutLocale.startsWith("/dashboard") ||
    pathWithoutLocale === "/register/tutor/complete" ||
    pathWithoutLocale === "/register/student/complete";

  if (!user && needsAuth) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}/login`;
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && pathWithoutLocale.startsWith("/dashboard")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (pathWithoutLocale === "/dashboard") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname =
        profile?.role === "tutor"
          ? `/${locale}/dashboard/tutor`
          : `/${locale}/dashboard/student`;
      return NextResponse.redirect(redirectUrl);
    }

    if (profile?.role === "tutor" && pathWithoutLocale.startsWith("/dashboard/student")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = `/${locale}/dashboard/tutor`;
      return NextResponse.redirect(redirectUrl);
    }

    if (profile?.role === "student" && pathWithoutLocale.startsWith("/dashboard/tutor")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = `/${locale}/dashboard/student`;
      return NextResponse.redirect(redirectUrl);
    }
  }

  response.headers.set("x-pathname-locale", locale);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|auth|.*\\..*).*)"],
};
