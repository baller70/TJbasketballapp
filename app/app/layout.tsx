import type { Metadata } from 'next'
import { Saira } from 'next/font/google'
import './globals.css'
import Providers from '@/components/providers/providers'

const saira = Saira({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HoopsQuest - Basketball Training for Kids',
  description: 'The ultimate basketball accountability app for kids aged 6-13 with parent oversight',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={saira.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}