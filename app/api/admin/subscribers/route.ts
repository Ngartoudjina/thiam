import { desc } from 'drizzle-orm';
import { getCurrentStaff } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { newsletterSubscribers } from '@/lib/db/schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Une cellule CSV : guillemets doublés, et neutralisation des formules (=, +, -, @). */
const cell = (value: string): string => {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
};

/** Export de la liste des abonnés, à ouvrir dans un tableur. */
export async function GET(): Promise<Response> {
  const staff = await getCurrentStaff();
  if (!staff) return new Response('Session expirée.', { status: 401 });

  const db = getDb();
  if (!db) return new Response('Base non configurée.', { status: 503 });

  const rows = await db
    .select()
    .from(newsletterSubscribers)
    .orderBy(desc(newsletterSubscribers.created_at));

  const lines = [
    ['email', 'inscription'].map(cell).join(';'),
    ...rows.map((row) => [row.email, row.created_at.toISOString()].map(cell).join(';')),
  ];

  const date = new Date().toISOString().slice(0, 10);

  // BOM UTF-8 : Excel affiche alors correctement les accents.
  return new Response(`﻿${lines.join('\r\n')}\r\n`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="abonnes-thiam-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
