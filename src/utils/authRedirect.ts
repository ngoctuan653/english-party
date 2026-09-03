interface StoredLocation {
  pathname?: string;
  search?: string;
  hash?: string;
  state?: unknown;
}

interface AuthRouteState {
  from?: string | StoredLocation;
}

export interface AuthDestination {
  to: string;
  state?: unknown;
}

function isSafeInternalPath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//');
}

export function getPostAuthDestination(routeState: unknown): AuthDestination {
  const from = (routeState as AuthRouteState | null)?.from;

  if (typeof from === 'string' && isSafeInternalPath(from)) {
    return { to: from };
  }

  if (from && typeof from === 'object') {
    const pathname = from.pathname && isSafeInternalPath(from.pathname) ? from.pathname : '/';
    return {
      to: `${pathname}${from.search ?? ''}${from.hash ?? ''}`,
      state: from.state,
    };
  }

  return { to: '/' };
}
