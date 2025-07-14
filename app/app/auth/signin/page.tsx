
import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SignInForm from '@/components/auth/signin-form';
import { Play } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign In - HoopsQuest',
  description: 'Sign in to your HoopsQuest account',
};

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-gray-900 mb-2">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
              <Play className="h-6 w-6 text-white" />
            </div>
            HoopsQuest
          </Link>
          <p className="text-gray-600">Welcome back! Ready to continue your basketball journey?</p>
        </div>
        
        <Card className="shadow-lg border-orange-100">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignInForm />
          </CardContent>
        </Card>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            New to HoopsQuest?{' '}
            <Link href="/auth/signup" className="text-orange-600 hover:text-orange-700 font-semibold">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
