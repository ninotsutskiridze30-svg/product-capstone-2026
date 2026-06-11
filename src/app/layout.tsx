import { JetBrains_Mono, Noto_Sans_Georgian, Noto_Serif_Georgian } from "next/font/google";
import type { ReactNode } from "react";
import { dehydrate } from "@tanstack/react-query";

import "./globals.css";
import { routing } from "@/shared/i18n/routing";
import { getQueryClient } from "@/shared/lib/query-client";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import { ThemeProvider } from "@/shared/providers/ThemeProvider";
import { PostHogProvider } from "@/shared/providers/PostHogProvider";

// Display face — Noto Serif Georgian. Covers Latin + Mkhedruli at equal quality
// so EN headings and KA headings share the same visual identity.
const notoSerifGeorgian = Noto_Serif_Georgian({
  variable: "--font-noto-serif-georgian",
  subsets: ["latin", "georgian"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Body / UI face. FiraGO (the brand book's first choice) isn't on Google Fonts,
// so we use Noto Sans Georgian — also a humanist sans with full Mkhedruli +
// Latin coverage, designed by the same team to pair with Noto Serif Georgian.
const notoSansGeorgian = Noto_Sans_Georgian({
  variable: "--font-noto-sans-georgian",
  subsets: ["latin", "georgian"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export default async function RootLayout({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <html
      lang={routing.defaultLocale}
      suppressHydrationWarning
      className={`${notoSerifGeorgian.variable} ${notoSansGeorgian.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="bg-background text-text-body font-body flex min-h-full flex-col antialiased"
      >
        <PostHogProvider>
          <ThemeProvider>
            <QueryProvider dehydratedState={dehydrate(queryClient)}>
              {children}
            </QueryProvider>
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
