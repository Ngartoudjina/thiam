import { describe, expect, it } from 'vitest';
import { isAllowedImageSource } from '@/lib/media-source';
import { resolveLocalPath } from '@/lib/storage';
import { buildObjectPath, isUploadFolder, safeSegment, sniffImage } from '@/lib/storage/image';

const bytes = (...values: number[]) => new Uint8Array([...values, ...new Array(16).fill(0)]);

describe('nature réelle des fichiers', () => {
  it('reconnaît JPEG, PNG et WebP à leur signature', () => {
    expect(sniffImage(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe('jpeg');
    expect(sniffImage(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe('png');
    expect(sniffImage(bytes(0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50))).toBe(
      'webp',
    );
  });

  it('refuse le reste, même déguisé', () => {
    const html = new TextEncoder().encode('<html><script>alert(1)</script>');
    const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg">');

    expect(sniffImage(html)).toBeNull();
    expect(sniffImage(svg)).toBeNull();
    expect(sniffImage(new Uint8Array())).toBeNull();
    // RIFF d'un autre format (WAV)
    expect(
      sniffImage(bytes(0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x41, 0x56, 0x45)),
    ).toBeNull();
  });
});

describe('chemins des objets', () => {
  it('nettoie les segments', () => {
    expect(safeSegment('Sur Mesure — Été 2026')).toBe('sur-mesure-ete-2026');
    expect(safeSegment('../../etc')).toBe('etc');
    expect(safeSegment('///')).toBe('divers');
  });

  it('construit des chemins uniques, rangés par dossier', () => {
    const first = buildObjectPath('collections', 'Diamant', 'webp');
    const second = buildObjectPath('collections', 'Diamant', 'webp');

    expect(first).toMatch(/^collections\/diamant\/[a-z0-9]+-[0-9a-f]{12}\.webp$/);
    expect(first).not.toBe(second);
  });

  it('n’accepte que les dossiers connus', () => {
    expect(isUploadFolder('pieces')).toBe(true);
    expect(isUploadFolder('../secrets')).toBe(false);
    expect(isUploadFolder(undefined)).toBe(false);
  });

  it('confine le stockage local à son dossier', () => {
    expect(resolveLocalPath('gallery/vitrine/abc.webp')).toMatch(
      /\.data\/media\/gallery\/vitrine\/abc\.webp$/,
    );
    expect(resolveLocalPath('../package.json')).toBeNull();
    expect(resolveLocalPath('gallery/../../.env.local')).toBeNull();
    expect(resolveLocalPath('/etc/passwd')).toBeNull();
    expect(resolveLocalPath('gallery/page.html')).toBeNull();
  });
});

describe('provenance des images', () => {
  it('admet les visuels du site, du disque et de Vercel Blob', () => {
    expect(isAllowedImageSource('/images/parure-or.jpg')).toBe(true);
    expect(isAllowedImageSource('/media/pieces/vitrine/x.webp')).toBe(true);
    expect(
      isAllowedImageSource('https://abcd1234.public.blob.vercel-storage.com/pieces/x-AbC.webp'),
    ).toBe(true);
  });

  it('refuse les autres provenances', () => {
    expect(isAllowedImageSource('https://exemple.com/photo.jpg')).toBe(false);
    expect(isAllowedImageSource('http://abcd.public.blob.vercel-storage.com/x.webp')).toBe(false);
    expect(isAllowedImageSource('https://public.blob.vercel-storage.com.evil.com/x.webp')).toBe(
      false,
    );
    expect(isAllowedImageSource('/images/../.env')).toBe(false);
    expect(isAllowedImageSource('javascript:alert(1)')).toBe(false);
    expect(isAllowedImageSource('collections/ancien-chemin-supabase.webp')).toBe(false);
  });
});
