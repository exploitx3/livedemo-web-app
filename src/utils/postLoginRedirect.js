/**
 * Resolves a safe in-app path to open after login/register.
 * Prevents open redirects and auth-route loops.
 */
export function sanitizeReturnPath(path) {
  if (path == null || typeof path !== 'string') {
    return '/'
  }
  const trimmed = path.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return '/'
  }
  if (/[\r\n]/.test(trimmed) || trimmed.includes('://')) {
    return '/'
  }
  if (trimmed.length > 2000) {
    return '/'
  }
  if (/^\/(login|register|auth)(\/|\?|$)/.test(trimmed)) {
    return '/'
  }
  return trimmed
}

/**
 * @param {import('react-router').Location} location
 */
export function getPostLoginPathFromLocation(location) {
  const params = new URLSearchParams(location.search || '')
  const fromQuery = params.get('returnTo') || params.get('from')
  if (fromQuery) {
    return sanitizeReturnPath(fromQuery)
  }
  const pathname = location.pathname || '/'
  if (pathname === '/login' || pathname === '/register' || pathname.startsWith('/auth')) {
    return '/'
  }
  return sanitizeReturnPath(`${pathname}${location.search || ''}`)
}
