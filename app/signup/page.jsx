import { Suspense } from 'react';
import AuthForm from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Create your free account',
  description: 'Create a free Schedule For You account: 3 social accounts, up to 10 scheduled posts at a time, no card needed. Schedule posts to nine social platforms from one queue.',
  alternates: { canonical: '/signup' },
};
export default function Page() {
  return <Suspense><AuthForm mode="signup" /></Suspense>;
}
