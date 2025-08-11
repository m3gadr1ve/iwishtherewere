import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'I Wish There Were',
  description: 'Share what you wish existed. Help entrepreneurs build what people actually want.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
