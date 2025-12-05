import "@blog/styles/globals.scss";

import { type Metadata } from "next";
import { TRPCReactProvider } from "@blog/trpc/react";
import { HydrateClient } from "@blog/trpc/server";
import { DARK_THEME } from "@blog/components/theme/types";
import type { PropsWithChildren } from "react";
import { I18nInit } from "@blog/i18n/ClientInit";

export const metadata: Metadata = {
  title: "GIS Blog",
  description: "GIS Blog by Adorsys - Insightful articles and updates from the GIS team",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    title: "GIS Blog",
    description: "Insightful articles and updates from the GIS team — best practices, real-world geospatial use cases, and deep dives into tools and data workflows.",
    type: "website",
    locale: "en_US",
    siteName: "GIS Blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "GIS Blog",
    description: "Insightful articles and updates from the GIS team",
  },
};

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="en" data-theme={DARK_THEME}>
      <body className="bg-base-100 text-base-content">
        <TRPCReactProvider>
          <HydrateClient>
            <I18nInit>
              {children}
            </I18nInit>
          </HydrateClient>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
