import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Titan_One } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Rounded, chunky display face — friendlier and more Gen-Z than a sharp
// condensed grotesk. Ships one weight only, same as its predecessor.
const titanOne = Titan_One({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "JomLap — Sepang Thermal Pit Wall",
  description:
    "Call the strategy from Sepang's pit wall. Three race engineers, one monsoon, zero chill.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  // the app is a fixed single-column flow; zooming just breaks the canvas
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${titanOne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="atmos" aria-hidden />
        {/* Spine label down the right edge — pure decoration, hidden from AT
            and from narrow screens where it would crowd the content. */}
        <span
          aria-hidden
          className="edge-label data pointer-events-none fixed right-1.5 top-1/2 z-10 hidden -translate-y-1/2 text-[9px] text-muted/50 sm:block"
        >
          Sepang International Circuit
        </span>
        <div className="above flex min-h-full flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
