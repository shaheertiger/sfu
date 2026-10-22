import { Suspense } from 'react';
import AuthForm from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Start your free trial',
  description: 'Create your Schedule For You account and start a 7-day free trial. Schedule posts to ten social platforms from one queue. Card required, cancel anytime.',
  alternates: { canonical: '/signup' },
};
export default function Page() {
  return <Suspense><AuthForm mode="signup" /></Suspense>;
}
