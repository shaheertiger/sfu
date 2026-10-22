'use client';
import dynamic from 'next/dynamic';

// The dashboard with sample data. Nothing here is saved.
const Dashboard = dynamic(() => import('../../components/Dashboard'), { ssr: false });

export default function Page() {
  return <Dashboard />;
}
