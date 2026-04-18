'use client';
import { usePathname } from 'next/navigation';
import AdminLayout from '@/layouts/AdminLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // The login page must NOT be wrapped by AdminLayout — doing so would cause
  // AdminLayout to run its auth check, find no session, redirect to /admin/login
  // (a no-op since we're already there), and loop in "Loading..." forever.
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }
  return <AdminLayout>{children}</AdminLayout>;
}
