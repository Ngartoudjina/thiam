'use client';

import { useEffect, useState } from 'react';
import { useSiteContent } from '@/components/providers/site-content-provider';
import { getShopStatus, type ShopStatus } from '@/lib/opening-hours';

const REFRESH_INTERVAL_MS = 60_000;

/**
 * État d'ouverture de la boutique, réévalué chaque minute à partir des horaires
 * saisis dans le tableau de bord.
 *
 * Le premier rendu est volontairement `null` afin que le serveur et le client
 * produisent le même HTML : le badge apparaît juste après l'hydratation.
 */
export function useShopStatus(): ShopStatus | null {
  const { hours } = useSiteContent();
  const [status, setStatus] = useState<ShopStatus | null>(null);

  useEffect(() => {
    const update = (): void => setStatus(getShopStatus(hours.days));
    update();

    const interval = window.setInterval(update, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [hours]);

  return status;
}
