'use client';
import NextLink from 'next/link';
import {
  useRouter,
  useParams as useNextParams,
  usePathname,
  useSearchParams as useNextSearchParams,
} from 'next/navigation';
import { useEffect, type ReactNode, type AnchorHTMLAttributes } from 'react';

// Link: accepts react-router `to` prop or standard `href`
export function Link({
  to,
  href,
  children,
  replace: replaceLink,
  state: _state,
  ...props
}: {
  to?: string;
  href?: string;
  replace?: boolean;
  state?: unknown;
  children?: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  return (
    <NextLink href={(to ?? href ?? '/') as string} replace={replaceLink} {...(props as any)}>
      {children}
    </NextLink>
  );
}

// useNavigate → useRouter
export function useNavigate() {
  const router = useRouter();
  function navigate(to: string | number, options?: { replace?: boolean; state?: unknown }) {
    if (typeof to === 'number') {
      if (to < 0) router.back();
      else if (to > 0) router.forward();
      return;
    }
    if (options?.replace) router.replace(to);
    else router.push(to);
  }
  return navigate;
}

// useParams - next returns Record<string, string | string[]>
export function useParams<T extends Record<string, string>>(): T {
  return useNextParams() as unknown as T;
}

// useLocation - combine pathname + searchParams
export function useLocation() {
  const pathname = usePathname();
  const searchParams = useNextSearchParams();
  return {
    pathname,
    search: searchParams.toString() ? '?' + searchParams.toString() : '',
    hash: '',
    state: null,
    key: 'default',
  };
}

// useSearchParams - match react-router [params, setParams] tuple
export function useSearchParams() {
  const params = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  function setSearchParams(
    newParams: URLSearchParams | Record<string, string> | ((prev: URLSearchParams) => URLSearchParams)
  ) {
    const current = new URLSearchParams(params.toString());
    let updated: URLSearchParams;
    if (typeof newParams === 'function') {
      updated = newParams(current);
    } else if (newParams instanceof URLSearchParams) {
      updated = newParams;
    } else {
      updated = new URLSearchParams(newParams);
    }
    const qs = updated.toString();
    router.push(pathname + (qs ? '?' + qs : ''));
  }

  return [params, setSearchParams] as const;
}

// Navigate component - redirects programmatically
export function Navigate({ to, replace: doReplace }: { to: string; replace?: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (doReplace) router.replace(to);
    else router.push(to);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

// Outlet - Next.js layouts use children prop; this is a no-op shim
export function Outlet({ children }: { children?: ReactNode } = {}) {
  return <>{children ?? null}</>;
}

// Pass-through wrappers (not used in Next.js but kept for import compatibility)
export function BrowserRouter({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
export function Routes({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
export function Route(_props: Record<string, unknown>) {
  return null;
}

// NavLink - active-aware link shim
export type NavLinkProps = {
  to: string;
  children?: ReactNode | ((props: { isActive: boolean; isPending: boolean }) => ReactNode);
  className?: string | ((props: { isActive: boolean; isPending: boolean }) => string);
  end?: boolean;
  replace?: boolean;
  state?: unknown;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className'>;

export const NavLink = ({
  to,
  children,
  className,
  replace: replaceLink,
  state: _state,
  end: _end,
  ...props
}: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === to || (!_end && pathname.startsWith(to + '/'));
  const resolvedClassName =
    typeof className === 'function' ? className({ isActive, isPending: false }) : className;
  const resolvedChildren =
    typeof children === 'function' ? children({ isActive, isPending: false }) : children;
  return (
    <NextLink href={to} replace={replaceLink} className={resolvedClassName} {...(props as any)}>
      {resolvedChildren}
    </NextLink>
  );
};
