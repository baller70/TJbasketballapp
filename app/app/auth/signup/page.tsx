
import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SignUpForm from '@/components/auth/signup-form';
import { Play } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign Up - HoopsQuest',
  description: 'Create your HoopsQuest account',
};

export default function SignUpPage() {
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
          <p className="text-gray-600">Start your basketball journey today!</p>
        </div>
        
        <Card className="shadow-lg border-orange-100">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
            <CardDescription>
              Join thousands of young athletes improving their game
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignUpForm />
          </CardContent>
        </Card>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-orange-600 hover:text-orange-700 font-semibold">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
