import { Suspense } from 'react';
import AuthForm from '@/components/auth/AuthForm';

export const metadata = { title: 'Create your account · Schedule For You' };
export default function Page() {
  return <Suspense><AuthForm mode="signup" /></Suspense>;
}
