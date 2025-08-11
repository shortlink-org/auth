import type { Metadata, Viewport } from 'next'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import { Roboto } from 'next/font/google'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

import theme from '../theme'
import './globals.css'

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
})

export const metadata: Metadata = {
  title: {
    default: 'Auth UI',
    template: '%s · Auth UI',
  },
  description: 'Authentication UI built with Next.js, MUI, and Tailwind v4.',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1220' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${roboto.variable} antialiased min-h-dvh bg-background text-foreground`}
        suppressHydrationWarning
      >
        <AppRouterCacheProvider>
          {/* next-themes toggles .dark on <html> to match your Tailwind tokens */}
          <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              {children}
            </ThemeProvider>
          </NextThemesProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
