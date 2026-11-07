import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, SESSION_TTL_MS, sessionCookieOptions } from '@/lib/auth/cookie';

const LOGIN_PATH = '/admin/connexion';

/**
 * Garde optimiste de l'espace d'administration.
 *
 * Elle ne consulte pas la base : sans cookie de session, elle renvoie vers la
 * connexion avant tout rendu ; avec un cookie, elle laisse passer et prolonge
 * sa durée de vie. La vérification qui fait foi — jeton confronté à la base —
 * a lieu dans la mise en page du tableau de bord et dans chaque action
 * serveur : le middleware n'est pas, à lui seul, une frontière de sécurité.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Sans base configurée, `/admin` affiche sa page d'installation.
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) return NextResponse.next();

  // La page de connexion décide seule : elle redirige un visiteur déjà connecté.
  if (pathname === LOGIN_PATH) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = LOGIN_PATH;
    redirect.search = '';
    redirect.searchParams.set('suite', pathname);
    return NextResponse.redirect(redirect);
  }

  // Le cookie suit la session : tant qu'on travaille, on reste connecté.
  // Seulement sur les navigations : une action serveur (POST) gère elle-même
  // le cookie — la déconnexion l'efface, il ne faut pas le reposer à côté.
  if (request.method !== 'GET') return NextResponse.next();

  const response = NextResponse.next();
  response.cookies.set(
    SESSION_COOKIE,
    token,
    sessionCookieOptions(new Date(Date.now() + SESSION_TTL_MS)),
  );
  return response;
}

export const config = {
  /*
   * Restreint à l'espace d'administration : le site vitrine est statique et
   * n'a besoin d'aucune session.
   */
  matcher: ['/admin/:path*'],
};
