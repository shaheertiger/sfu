import { Suspense } from 'react';
import { ForgotPasswordForm } from '@/components/auth/PasswordReset';

export const metadata = {
  title: 'Reset your password',
  robots: { index: false, follow: true },
};
export default function Page() {
  return <Suspense><ForgotPasswordForm /></Suspense>;
}
