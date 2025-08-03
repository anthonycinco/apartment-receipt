import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cinco Apartments Billing System',
  description: 'Internal billing system for Cinco Apartments',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  )
} 