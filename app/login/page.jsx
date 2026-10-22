import { Suspense } from 'react';
import AuthForm from '@/components/auth/AuthForm';

export const metadata = { title: 'Sign in · Schedule For You' };
export default function Page() {
  return <Suspense><AuthForm mode="login" /></Suspense>;
}
