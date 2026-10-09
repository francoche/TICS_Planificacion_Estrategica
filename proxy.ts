import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/jwt';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas o recursos estáticos
  const isLoginPage = pathname === '/login';
  const isPublicApi = pathname.startsWith('/api/auth');

  const token = request.cookies.get('auth_token')?.value;
  let isAuthenticated = false;

  if (token) {
    const payload = await verifyJWT(token);
    if (payload) {
      isAuthenticated = true;
    }
  }

  // Si ya está autenticado e intenta ir al login, redirigir al panel principal
  if (isLoginPage) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (isPublicApi) {
    return NextResponse.next();
  }

  // Si no está autenticado, redirigir a /login
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    const response = NextResponse.redirect(loginUrl);
    // Limpiar cookie residual si el token era inválido
    if (token) {
      response.cookies.delete('auth_token');
    }
    return response;
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    /*
     * Aplica el proxy de autenticación a todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico, archivos con extensión (.svg, .png, .jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
