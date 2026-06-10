import { Antic_Didone, Poppins, Jost, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QueryProvider from "@/shared/providers/QueryProvider";
const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});
const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const anticDidone = Antic_Didone({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-antic-didone",
  display: "swap",
});
const jost = Jost({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://target-tours.vercel.app"),
  title: {
    default: "Target Tours",
    template: "%s | Target Tours",
  },
  description:
    "Plan and book flights, hotels, holiday packages, and travel insurance with Target Tours.",
  applicationName: "Target Tours",
  keywords: [
    "Target Tours",
    "travel booking",
    "flights",
    "hotels",
    "holiday packages",
    "travel insurance",
  ],
  authors: [{ name: "Target Tours" }],
  creator: "Target Tours",
  publisher: "Target Tours",
  openGraph: {
    title: "Target Tours",
    description:
      "Plan and book flights, hotels, holiday packages, and travel insurance with Target Tours.",
    url: "https://target-tours.vercel.app",
    siteName: "Target Tours",
    images: [
      {
        url: "/Logo.svg",
        width: 57,
        height: 48,
        alt: "Target Tours",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Target Tours",
    description:
      "Plan and book flights, hotels, holiday packages, and travel insurance with Target Tours.",
    images: ["/Logo.svg"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/Logo.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/Logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" as="image" href="/images/signup-hero.webp" />
      </head>
      <body
        className={`${anticDidone.variable} ${jost.variable} ${inter.variable} antialiased`}
        style={{ fontFamily: "var(--font-inter)" }}
      >
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>

          <ToastContainer
            position="top-right"
            style={{ zIndex: 1000000 }}
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="light"
            toastStyle={{
              borderRadius: "0px",
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
