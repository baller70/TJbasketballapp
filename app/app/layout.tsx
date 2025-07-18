import type { Metadata } from 'next'
import { Saira } from 'next/font/google'
import './globals.css'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';

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
    <ClerkProvider>
      <html lang="en">
        <body className={saira.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <header className="bg-white border-b border-gray-200 px-4 py-2">
              <div className="max-w-7xl mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold text-blue-600">HoopsQuest</h1>
                                 <div className="flex items-center gap-4">
                   <SignedOut>
                     <SignInButton>
                       <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                         Sign In
                       </button>
                     </SignInButton>
                     <SignUpButton>
                       <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                         Sign Up
                       </button>
                     </SignUpButton>
                   </SignedOut>
                   <SignedIn>
                     <div className="flex items-center gap-3">
                       <a 
                         href="/dashboard?view=parent" 
                         className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
                       >
                         Parent Portal
                       </a>
                       <a 
                         href="/dashboard?view=player" 
                         className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm"
                       >
                         Player Portal
                       </a>
                       <UserButton />
                     </div>
                   </SignedIn>
                 </div>
              </div>
            </header>
            {children}
            <Toaster />
            <Sonner />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}