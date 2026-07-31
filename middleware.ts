import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';

const LOGIN_PATH = '/admin/connexion';
const DASHBOARD_PATH = '/admin';

/**
 * Rafraîchit la session Supabase et garde l'espace d'administration.
 *
 * Le contrôle est fait ici, avant tout rendu : sans session valide, aucune
 * page `/admin` n'est jamais produite. Les actions serveur revérifient malgré
 * tout les droits de leur côté — le middleware n'est pas une frontière de
 * sécurité à lui seul.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminArea = pathname.startsWith(DASHBOARD_PATH);

  // Sans configuration Supabase, seule la page d'installation reste accessible.
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }

        response = NextResponse.next({ request });

        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // `getUser()` valide le jeton auprès de Supabase, contrairement à `getSession()`
  // qui se contente de lire le cookie — indispensable dans un middleware.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdminArea) return response;

  if (!user && pathname !== LOGIN_PATH) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = LOGIN_PATH;
    redirect.searchParams.set('suite', pathname);
    return NextResponse.redirect(redirect);
  }

  if (user && pathname === LOGIN_PATH) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = DASHBOARD_PATH;
    redirect.search = '';
    return NextResponse.redirect(redirect);
  }

  return response;
}

export const config = {
  /*
   * Restreint à l'espace d'administration.
   *
   * Le site vitrine est entièrement statique et n'a besoin d'aucune session :
   * le faire passer par le middleware ajoutait un traitement — et, pour un
   * administrateur connecté, un aller-retour vers Supabase — à chaque
   * navigation et à chaque préchargement de lien.
   */
  matcher: ['/admin/:path*'],
};
