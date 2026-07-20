import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "Sleep has a shape — Sleep Chart";
const description =
  "Explore how sleep duration is associated with 23 biological ageing clocks across organs, imaging and omics.";

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#171218",
};

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const socialImage = `${origin}/og.png`;

  return {
    title,
    description,
    applicationName: "Sleep Chart",
    authors: [{ name: "The MULTI Consortium et al." }],
    keywords: [
      "sleep duration",
      "biological ageing",
      "biological age gap",
      "multi-organ",
      "multi-omics",
      "Nature",
    ],
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      type: "article",
      url: origin,
      siteName: "Sleep Chart",
      title,
      description,
      publishedTime: "2026-05-13",
      images: [
        {
          url: socialImage,
          width: 1536,
          height: 1024,
          alt: "Sleep Chart — Sleep has a shape",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
    other: {
      citation_doi: "10.1038/s41586-026-10524-5",
      citation_title:
        "Sleep chart of biological ageing clocks in middle and late life",
      citation_publication_date: "2026/05/13",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
