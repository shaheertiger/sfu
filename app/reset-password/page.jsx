import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/auth/PasswordReset';

export const metadata = {
  title: 'Choose a new password',
  robots: { index: false, follow: false },
  // The token is in the URL: don't send it to other sites as a referrer.
  referrer: 'no-referrer',
};
export default function Page() {
  return <Suspense><ResetPasswordForm /></Suspense>;
}
