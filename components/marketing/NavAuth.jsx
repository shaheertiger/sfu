'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { hasSignedInHint } from '@/lib/signed-in-hint';

/** "Sign in" and "Start free trial", or "Open dashboard" for people who are already signed in. */
export default function NavAuth({ className, hideClass, ctaClass }) {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => setSignedIn(hasSignedInHint()), []);
  if (signedIn) return <Link href="/app" className={ctaClass}>Open dashboard</Link>;
  return (
    <>
      <Link href="/login" className={hideClass}>Sign in</Link>
      <Link href="/signup" className={ctaClass}>Start free trial</Link>
    </>
  );
}
