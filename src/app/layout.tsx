import { Inter } from 'next/font/google'
import AuthProvider from '../lib/auth/auth-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Next 13 Boilerplate'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
