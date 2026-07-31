import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

/**
 * Favicon : le losange or de la maison sur fond obsidienne.
 * Le logotype complet reste illisible à 16 px — on n'en garde que le signe.
 */
export default function Icon(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0B0B0C',
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          transform: 'rotate(45deg)',
          background: 'linear-gradient(135deg, #F2D6BF, #C08A62 58%, #A96F4B)',
        }}
      />
    </div>,
    size,
  );
}
