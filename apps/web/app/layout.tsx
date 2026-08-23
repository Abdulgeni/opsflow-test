import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "OpsFlow",
  description: "GoldenAge institutional operations platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-ivory">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}