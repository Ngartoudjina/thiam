'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ImageUploader, type UploadedImage } from '@/components/admin/image-uploader';
import { AdminButton, Panel, PanelHeader } from '@/components/admin/ui/primitives';
import { TextArea, TextInput } from '@/components/admin/ui/form-fields';
import {
  saveAboutAction,
  saveContactAction,
  saveHeroAction,
  saveHoursAction,
  saveStatsAction,
} from '@/services/admin/settings-actions';
import type { ActionResult } from '@/services/admin/action-result';
import type {
  AboutContent,
  ContactSettings,
  HeroContent,
  HoursContent,
  StatsContent,
} from '@/lib/schemas/content';

/** Retour commun : toast de succès ou d'échec, erreurs de champ conservées. */
function useSettingsForm(
  action: (previous: ActionResult | null, formData: FormData) => Promise<ActionResult>,
) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(action, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message);
    else if (!state.fieldErrors) toast.error(state.message);
  }, [state]);

  const errors = state && !state.ok ? state.fieldErrors : undefined;
  return { formAction, pending, errors } as const;
}

function SubmitRow({ pending, label = 'Enregistrer' }: { pending: boolean; label?: string }) {
  return (
    <div className="flex justify-end border-t border-panel-border pt-4 dark:border-panel-dark-border">
      <AdminButton type="submit" variant="primary" disabled={pending}>
        {pending ? 'Enregistrement…' : label}
      </AdminButton>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Bandeau d'accueil                                                          */
/* -------------------------------------------------------------------------- */

export function HeroForm({ hero }: { readonly hero: HeroContent }) {
  const { formAction, pending, errors } = useSettingsForm(saveHeroAction);
  const [image, setImage] = useState<UploadedImage | null>(
    hero.imagePath ? { storagePath: hero.imagePath, width: 1200, height: 1600 } : null,
  );

  return (
    <Panel>
      <PanelHeader
        title="Bandeau principal"
        description="Le premier écran du site : sur-titre, titre en deux lignes, paragraphe et boutons."
      />

      <form action={formAction} className="flex flex-col gap-5 p-5" noValidate>
        <input type="hidden" name="previousImagePath" value={hero.imagePath} />
        <input type="hidden" name="imagePath" value={image?.storagePath ?? ''} />

        <TextInput
          id="eyebrow"
          name="eyebrow"
          label="Sur-titre"
          required
          defaultValue={hero.eyebrow}
          error={errors?.eyebrow?.[0]}
          wrapperClassName="sm:max-w-sm"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="titleLine1"
            name="titleLine1"
            label="Titre — première ligne"
            required
            defaultValue={hero.titleLine1}
            error={errors?.titleLine1?.[0]}
          />
          <TextInput
            id="titleLine2"
            name="titleLine2"
            label="Titre — seconde ligne"
            required
            hint="Affichée en italique et en dégradé doré."
            defaultValue={hero.titleLine2}
            error={errors?.titleLine2?.[0]}
          />
        </div>

        <TextArea
          id="description"
          name="description"
          label="Paragraphe (grand écran)"
          rows={3}
          required
          defaultValue={hero.description}
          error={errors?.description?.[0]}
        />

        <TextArea
          id="descriptionMobile"
          name="descriptionMobile"
          label="Paragraphe (mobile)"
          rows={2}
          hint="Version courte affichée sur téléphone. Laissez vide pour reprendre le texte ci-dessus."
          defaultValue={hero.descriptionMobile}
          error={errors?.descriptionMobile?.[0]}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="primaryLabel"
            name="primaryLabel"
            label="Bouton principal — libellé"
            required
            defaultValue={hero.primaryCta.label}
            error={errors?.['primaryCta.label']?.[0]}
          />
          <TextInput
            id="primaryHref"
            name="primaryHref"
            label="Bouton principal — destination"
            required
            hint="Lien WhatsApp, numéro de téléphone ou page du site."
            defaultValue={hero.primaryCta.href}
            error={errors?.['primaryCta.href']?.[0]}
          />
          <TextInput
            id="secondaryLabel"
            name="secondaryLabel"
            label="Bouton secondaire — libellé"
            required
            defaultValue={hero.secondaryCta.label}
            error={errors?.['secondaryCta.label']?.[0]}
          />
          <TextInput
            id="secondaryHref"
            name="secondaryHref"
            label="Bouton secondaire — destination"
            required
            defaultValue={hero.secondaryCta.href}
            error={errors?.['secondaryCta.href']?.[0]}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-[16rem_1fr] sm:items-start">
          <ImageUploader
            folder="content"
            scope="hero"
            value={image}
            onChange={setImage}
            label="Grande image"
            aspect="portrait"
            hint="Format vertical recommandé. Laissez vide pour conserver la photo livrée avec la maquette."
          />
          <TextInput
            id="imageAlt"
            name="imageAlt"
            label="Texte alternatif de l’image"
            defaultValue={hero.imageAlt}
            error={errors?.imageAlt?.[0]}
          />
        </div>

        <SubmitRow pending={pending} />
      </form>
    </Panel>
  );
}

/* -------------------------------------------------------------------------- */
/*  Chiffres clés                                                              */
/* -------------------------------------------------------------------------- */

export function StatsForm({ stats }: { readonly stats: StatsContent }) {
  const { formAction, pending } = useSettingsForm(saveStatsAction);
  const [items, setItems] = useState(stats.items);

  const update = (index: number, patch: Partial<StatsContent['items'][number]>): void =>
    setItems((current) =>
      current.map((item, position) => (position === index ? { ...item, ...patch } : item)),
    );

  return (
    <Panel>
      <PanelHeader
        title="Chiffres clés"
        description="La bande de preuve sociale, sous le bandeau principal. Les chiffres s’animent à l’arrivée."
      />

      <form action={formAction} className="flex flex-col gap-5 p-5" noValidate>
        <input type="hidden" name="items" value={JSON.stringify(items)} />

        <ul className="flex flex-col gap-4">
          {items.map((item, index) => (
            <li
              key={index}
              className="grid gap-3 rounded-lg border border-panel-border p-4 sm:grid-cols-4 dark:border-panel-dark-border"
            >
              <TextInput
                id={`stat-value-${index}`}
                label="Valeur"
                type="number"
                step="0.1"
                value={String(item.value)}
                onChange={(event) => update(index, { value: Number(event.target.value) })}
              />
              <TextInput
                id={`stat-suffix-${index}`}
                label="Suffixe"
                hint="/5, %, …"
                value={item.suffix}
                onChange={(event) => update(index, { suffix: event.target.value })}
              />
              <TextInput
                id={`stat-label-${index}`}
                label="Légende (grand écran)"
                hint="Retour à la ligne autorisé avec \n."
                value={item.label}
                onChange={(event) => update(index, { label: event.target.value })}
              />
              <TextInput
                id={`stat-mobile-${index}`}
                label="Légende (mobile)"
                value={item.mobileLabel}
                onChange={(event) => update(index, { mobileLabel: event.target.value })}
              />
            </li>
          ))}
        </ul>

        <SubmitRow pending={pending} />
      </form>
    </Panel>
  );
}

/* -------------------------------------------------------------------------- */
/*  Histoire de la maison                                                      */
/* -------------------------------------------------------------------------- */

export function AboutForm({ about }: { readonly about: AboutContent }) {
  const { formAction, pending, errors } = useSettingsForm(saveAboutAction);
  const [portrait, setPortrait] = useState<UploadedImage | null>(
    about.portraitPath ? { storagePath: about.portraitPath, width: 1000, height: 1200 } : null,
  );
  const [milestones, setMilestones] = useState(about.milestones);

  const update = (index: number, patch: Partial<AboutContent['milestones'][number]>): void =>
    setMilestones((current) =>
      current.map((item, position) => (position === index ? { ...item, ...patch } : item)),
    );

  return (
    <Panel>
      <PanelHeader
        title="Histoire de la maison"
        description="Le récit et la chronologie de la section « D’un comptoir à une maison »."
      />

      <form action={formAction} className="flex flex-col gap-5 p-5" noValidate>
        <input type="hidden" name="previousPortraitPath" value={about.portraitPath} />
        <input type="hidden" name="portraitPath" value={portrait?.storagePath ?? ''} />
        <input type="hidden" name="milestones" value={JSON.stringify(milestones)} />

        <TextInput
          id="about-eyebrow"
          name="eyebrow"
          label="Sur-titre"
          required
          defaultValue={about.eyebrow}
          error={errors?.eyebrow?.[0]}
          wrapperClassName="sm:max-w-sm"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="about-title1"
            name="titleLine1"
            label="Titre — première ligne"
            required
            defaultValue={about.titleLine1}
            error={errors?.titleLine1?.[0]}
          />
          <TextInput
            id="about-title2"
            name="titleLine2"
            label="Titre — seconde ligne"
            required
            defaultValue={about.titleLine2}
            error={errors?.titleLine2?.[0]}
          />
        </div>

        <TextArea
          id="about-description"
          name="description"
          label="Paragraphe d’introduction"
          rows={3}
          required
          defaultValue={about.description}
          error={errors?.description?.[0]}
        />

        <div className="grid gap-4 sm:grid-cols-[16rem_1fr] sm:items-start">
          <ImageUploader
            folder="content"
            scope="histoire"
            value={portrait}
            onChange={setPortrait}
            label="Portrait"
            aspect="portrait"
            hint="Photo du fondateur ou de l’équipe."
          />
          <TextInput
            id="portraitAlt"
            name="portraitAlt"
            label="Texte alternatif du portrait"
            defaultValue={about.portraitAlt}
            error={errors?.portraitAlt?.[0]}
          />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-sans text-sm font-medium text-panel-ink dark:text-panel-dark-ink">
              Chronologie
            </h3>
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={() =>
                setMilestones((current) => [...current, { year: '', title: '', description: '' }])
              }
            >
              <Plus size={14} strokeWidth={1.8} aria-hidden="true" />
              Ajouter un jalon
            </AdminButton>
          </div>

          <ul className="flex flex-col gap-3">
            {milestones.map((milestone, index) => (
              <li
                key={index}
                className="grid gap-3 rounded-lg border border-panel-border p-4 sm:grid-cols-[6rem_1fr_2.25rem] dark:border-panel-dark-border"
              >
                <TextInput
                  id={`milestone-year-${index}`}
                  label="Année"
                  value={milestone.year}
                  onChange={(event) => update(index, { year: event.target.value })}
                />
                <div className="flex flex-col gap-3">
                  <TextInput
                    id={`milestone-title-${index}`}
                    label="Titre"
                    value={milestone.title}
                    onChange={(event) => update(index, { title: event.target.value })}
                  />
                  <TextArea
                    id={`milestone-desc-${index}`}
                    label="Description"
                    rows={2}
                    value={milestone.description}
                    onChange={(event) => update(index, { description: event.target.value })}
                  />
                </div>
                <AdminButton
                  variant="ghost"
                  size="icon"
                  aria-label="Retirer ce jalon"
                  className="self-end"
                  onClick={() =>
                    setMilestones((current) => current.filter((_, position) => position !== index))
                  }
                >
                  <Trash2 size={15} strokeWidth={1.7} aria-hidden="true" />
                </AdminButton>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextArea
            id="about-quote"
            name="quote"
            label="Citation de clôture"
            rows={3}
            required
            defaultValue={about.quote}
            error={errors?.quote?.[0]}
          />
          <TextInput
            id="about-quote-author"
            name="quoteAuthor"
            label="Auteur de la citation"
            required
            defaultValue={about.quoteAuthor}
            error={errors?.quoteAuthor?.[0]}
          />
        </div>

        <SubmitRow pending={pending} />
      </form>
    </Panel>
  );
}

/* -------------------------------------------------------------------------- */
/*  Coordonnées                                                                */
/* -------------------------------------------------------------------------- */

export function ContactForm({ contact }: { readonly contact: ContactSettings }) {
  const { formAction, pending, errors } = useSettingsForm(saveContactAction);

  return (
    <Panel>
      <PanelHeader
        title="Coordonnées"
        description="Utilisées partout : barre de navigation, boutons WhatsApp, pied de page et balisage pour Google."
      />

      <form action={formAction} className="flex flex-col gap-5 p-5" noValidate>
        <div className="grid gap-4 sm:grid-cols-3">
          <TextInput
            id="phoneDisplay"
            name="phoneDisplay"
            label="Téléphone affiché"
            required
            defaultValue={contact.phoneDisplay}
            error={errors?.phoneDisplay?.[0]}
          />
          <TextInput
            id="phoneE164"
            name="phoneE164"
            label="Téléphone international"
            required
            hint="Format +2290197844022, utilisé par le lien d’appel."
            defaultValue={contact.phoneE164}
            error={errors?.phoneE164?.[0]}
          />
          <TextInput
            id="whatsappNumber"
            name="whatsappNumber"
            label="Numéro WhatsApp"
            required
            hint="Chiffres seuls, sans le +."
            defaultValue={contact.whatsappNumber}
            error={errors?.whatsappNumber?.[0]}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <TextInput
            id="email"
            name="email"
            type="email"
            label="Adresse e-mail"
            required
            defaultValue={contact.email}
            error={errors?.email?.[0]}
          />
          <TextInput
            id="city"
            name="city"
            label="Ville"
            required
            defaultValue={contact.city}
            error={errors?.city?.[0]}
          />
          <TextInput
            id="country"
            name="country"
            label="Pays"
            required
            defaultValue={contact.country}
            error={errors?.country?.[0]}
          />
        </div>

        <TextInput
          id="streetAddress"
          name="streetAddress"
          label="Adresse détaillée"
          hint="Rue et repère. Laissez vide tant qu’elle n’est pas arrêtée."
          defaultValue={contact.streetAddress}
          error={errors?.streetAddress?.[0]}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="mapsQuery"
            name="mapsQuery"
            label="Recherche cartographique"
            hint="Texte utilisé pour le lien « Ouvrir l’itinéraire »."
            defaultValue={contact.mapsQuery}
            error={errors?.mapsQuery?.[0]}
          />
          <TextInput
            id="mapsEmbedSrc"
            name="mapsEmbedSrc"
            label="Plan intégré (URL)"
            hint="URL d’intégration Google Maps. Vide : un cadre sobre est affiché, sans requête tierce."
            defaultValue={contact.mapsEmbedSrc}
            error={errors?.mapsEmbedSrc?.[0]}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="instagram"
            name="instagram"
            label="Instagram"
            hint="URL complète. Vide : l’icône n’apparaît pas."
            defaultValue={contact.instagram}
            error={errors?.instagram?.[0]}
          />
          <TextInput
            id="facebook"
            name="facebook"
            label="Facebook"
            hint="URL complète. Vide : l’icône n’apparaît pas."
            defaultValue={contact.facebook}
            error={errors?.facebook?.[0]}
          />
        </div>

        <SubmitRow pending={pending} />
      </form>
    </Panel>
  );
}

/* -------------------------------------------------------------------------- */
/*  Horaires                                                                   */
/* -------------------------------------------------------------------------- */

export function HoursForm({ hours }: { readonly hours: HoursContent }) {
  const { formAction, pending, errors } = useSettingsForm(saveHoursAction);
  const [days, setDays] = useState(hours.days);

  const update = (index: number, patch: Partial<HoursContent['days'][number]>): void =>
    setDays((current) =>
      current.map((day, position) => (position === index ? { ...day, ...patch } : day)),
    );

  return (
    <Panel>
      <PanelHeader
        title="Horaires"
        description="Ils pilotent le tableau affiché, la pastille « Ouvert maintenant » — calculée à l’heure de Cotonou — et le balisage pour Google."
      />

      <form action={formAction} className="flex flex-col gap-5 p-5" noValidate>
        <input type="hidden" name="days" value={JSON.stringify(days)} />

        <TextInput
          id="summary"
          name="summary"
          label="Résumé"
          required
          hint="Affiché dans le pied de page : « Lun — Sam · 09h — 21h »."
          defaultValue={hours.summary}
          error={errors?.summary?.[0]}
          wrapperClassName="sm:max-w-sm"
        />

        <ul className="flex flex-col gap-3">
          {days.map((day, index) => (
            <li
              key={index}
              className="grid gap-3 rounded-lg border border-panel-border p-4 sm:grid-cols-2 dark:border-panel-dark-border"
            >
              <TextInput
                id={`day-label-${index}`}
                label="Jour"
                value={day.label}
                onChange={(event) => update(index, { label: event.target.value })}
              />
              <TextInput
                id={`day-display-${index}`}
                label="Horaire affiché"
                hint="Texte libre, tel qu’il apparaît sur le site."
                value={day.display}
                onChange={(event) => update(index, { display: event.target.value })}
              />
            </li>
          ))}
        </ul>

        <p className="text-xs text-panel-soft dark:text-panel-dark-soft">
          Les créneaux horaires précis, qui déterminent l’état « ouvert / fermé », se modifient dans
          le fichier de configuration : ils changent rarement et une erreur de saisie fausserait la
          pastille affichée en vitrine.
        </p>

        <SubmitRow pending={pending} />
      </form>
    </Panel>
  );
}
