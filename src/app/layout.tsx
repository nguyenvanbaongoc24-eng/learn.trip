import type { Metadata } from "next";
import { Nunito, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Learn.Trip — Learn a language. Explore Vietnam.",
  description: "A language-learning adventure game combining English learning with exploring Vietnam's landmarks, culture, food, and history.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${nunito.variable} ${beVietnamPro.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-200">
        {children}
      </body>
    </html>
  );
}
