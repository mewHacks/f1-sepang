import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Anton } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Heavy condensed grotesk for titles. Skewed in CSS rather than loading a
// second italic face — one weight, one file, all the attitude.
const anton = Anton({
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
      className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
