import type { Metadata } from "next";
import { Montserrat, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";
import BackToTop from "@/components/BackToTop";
import CookieBanner from '@/components/CookieBanner';
import { Toaster } from 'sonner';

const montserrat = Montserrat({
    subsets: ["latin"],
    variable: "--font-montserrat",
});

const cormorant = Cormorant_Garamond({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-cormorant",
});

export const metadata: Metadata = {
    title: "Galleria d'Arte",
    description: "Portfolio artista e galleria opere",
    openGraph: {
        url: process.env.NEXT_PUBLIC_SITE_URL,
    }
};

export default function RootLayout({
    children,
    modal,
}: Readonly<{
    children: React.ReactNode;
    modal: React.ReactNode;
}>) {
    return (
        <html lang="it" suppressHydrationWarning>
            <body className={`${montserrat.variable} ${cormorant.variable} font-sans antialiased bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-50 transition-colors duration-300 flex flex-col min-h-screen`}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    <Navbar />
                    <main className="flex-grow">
                        {children}
                        {modal}
                    </main>
                    <Footer />
                    <BackToTop />
                    <CookieBanner />
                    <Toaster richColors position="top-center" />
                </ThemeProvider>
                <Script
                    src={`${process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}`}
                    data-website-id={`${process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}`}
                    strategy="afterInteractive"
                />
            </body>
        </html>
    );
}
