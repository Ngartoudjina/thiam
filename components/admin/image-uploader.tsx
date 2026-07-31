'use client';

import { ImagePlus, Loader2, Trash2, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useId, useRef, useState, type DragEvent } from 'react';
import { toast } from 'sonner';
import { AdminButton } from '@/components/admin/ui/primitives';
import { compressImage, validateImageFile } from '@/lib/image-compression';
import { publicStorageUrl } from '@/lib/supabase/env';
import { createUploadUrlAction, type UploadFolder } from '@/services/admin/upload-actions';
import { cn } from '@/lib/utils';

export interface UploadedImage {
  readonly storagePath: string;
  readonly width: number;
  readonly height: number;
}

interface ImageUploaderProps {
  readonly folder: UploadFolder;
  /** Sous-dossier : identifiant de collection, ou nom de bloc. */
  readonly scope: string;
  readonly value: UploadedImage | null;
  readonly onChange: (image: UploadedImage | null) => void;
  readonly label?: string;
  readonly hint?: string;
  readonly className?: string;
  readonly aspect?: 'portrait' | 'landscape' | 'square';
}

const ASPECT: Record<'portrait' | 'landscape' | 'square', string> = {
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[16/10]',
  square: 'aspect-square',
};

/** Envoie le fichier à l'URL signée en suivant la progression réelle. */
function putWithProgress(
  signedUrl: string,
  blob: Blob,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('PUT', signedUrl, true);
    request.setRequestHeader('Content-Type', blob.type);
    request.setRequestHeader('x-upsert', 'true');

    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    request.addEventListener('load', () =>
      request.status >= 200 && request.status < 300
        ? resolve()
        : reject(new Error(`Envoi refusé (${request.status}).`)),
    );
    request.addEventListener('error', () => reject(new Error('Connexion interrompue.')));
    request.send(blob);
  });
}

/**
 * Zone de dépôt d'image.
 *
 * Glisser-déposer ou sélection classique, aperçu immédiat depuis le fichier
 * local, compression avant envoi, barre de progression réelle, remplacement et
 * suppression. Le fichier va directement dans Supabase Storage.
 */
export function ImageUploader({
  folder,
  scope,
  value,
  onChange,
  label = 'Photo',
  hint = 'JPG, PNG ou WEBP — 10 Mo maximum. L’image est compressée avant l’envoi.',
  className,
  aspect = 'landscape',
}: ImageUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      const invalid = validateImageFile(file);
      if (invalid) {
        toast.error(invalid);
        return;
      }

      const localPreview = URL.createObjectURL(file);
      setPreview(localPreview);
      setProgress(0);

      try {
        const compressed = await compressImage(file);
        const signed = await createUploadUrlAction(folder, scope, compressed.extension);

        if (!signed.ok || !signed.data) {
          toast.error(signed.ok ? 'Envoi impossible.' : signed.message);
          setProgress(null);
          return;
        }

        await putWithProgress(signed.data.signedUrl, compressed.blob, setProgress);

        onChange({
          storagePath: signed.data.path,
          width: compressed.width,
          height: compressed.height,
        });

        toast.success('Photo envoyée.');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'L’envoi a échoué.');
        setPreview(null);
      } finally {
        setProgress(null);
        URL.revokeObjectURL(localPreview);
      }
    },
    [folder, onChange, scope],
  );

  const onDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) void handleFile(file);
  };

  const currentSrc = value ? publicStorageUrl(value.storagePath) : preview;
  const isUploading = progress !== null;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <span className="font-sans text-[0.8125rem] font-medium text-panel-ink dark:text-panel-dark-ink">
        {label}
      </span>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'relative overflow-hidden rounded-xl border border-dashed transition-colors duration-150 ease-out',
          ASPECT[aspect],
          dragging
            ? 'border-accent bg-accent-soft/40 dark:bg-accent/10'
            : 'border-panel-border bg-panel-muted dark:border-panel-dark-border dark:bg-panel-dark-sunken',
        )}
      >
        {currentSrc ? (
          <Image
            src={currentSrc}
            alt=""
            fill
            sizes="(min-width: 1024px) 320px, 100vw"
            unoptimized={currentSrc.startsWith('blob:')}
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
            <UploadCloud
              size={22}
              strokeWidth={1.5}
              aria-hidden="true"
              className="text-panel-faint dark:text-panel-dark-faint"
            />
            <p className="px-6 text-[0.8125rem] text-panel-soft dark:text-panel-dark-soft">
              Glissez une photo ici, ou choisissez un fichier
            </p>
          </div>
        )}

        {isUploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-panel/85 backdrop-blur-sm dark:bg-panel-dark/85">
            <Loader2
              size={20}
              aria-hidden="true"
              className="animate-spin text-accent"
              strokeWidth={1.8}
            />
            <div className="h-1 w-40 overflow-hidden rounded-full bg-panel-sunken dark:bg-panel-dark-border">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-150 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p aria-live="polite" className="text-xs text-panel-soft dark:text-panel-dark-soft">
              Envoi… {progress}%
            </p>
          </div>
        ) : null}
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          event.target.value = '';
        }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <AdminButton
          variant="secondary"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          <ImagePlus size={14} strokeWidth={1.7} aria-hidden="true" />
          {value ? 'Remplacer' : 'Choisir une photo'}
        </AdminButton>

        {value ? (
          <AdminButton
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange(null);
              setPreview(null);
            }}
            disabled={isUploading}
          >
            <Trash2 size={14} strokeWidth={1.7} aria-hidden="true" />
            Retirer
          </AdminButton>
        ) : null}
      </div>

      <p className="text-xs text-panel-soft dark:text-panel-dark-soft">{hint}</p>
    </div>
  );
}
