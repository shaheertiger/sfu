import { Suspense } from 'react';
import AuthForm from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Sign in',
  description: 'Sign in to your Schedule For You workspace.',
  alternates: { canonical: '/login' },
  // A sign-in form has nothing for search results; keep it out of the index.
  robots: { index: false, follow: true },
};
export default function Page() {
  return <Suspense><AuthForm mode="login" /></Suspense>;
}
