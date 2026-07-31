/**
 * Schéma de la base, décrit à la main pour rester lisible et versionné avec le
 * code. Il correspond exactement à `supabase/migrations/0001_schema.sql`.
 *
 * Toute modification du SQL doit se refléter ici : c'est ce contrat que
 * `createClient<Database>()` utilise pour typer requêtes et réponses.
 *
 * Tout est déclaré en alias de type, jamais en interface : postgrest-js exige
 * que chaque ligne satisfasse `Record<string, unknown>`, ce qui suppose une
 * index signature implicite. Les interfaces n'en produisent pas, et le typage
 * des requêtes retomberait silencieusement sur `never`.
 */

export type ContentStatus = 'visible' | 'hidden';
export type UserRole = 'admin' | 'editor';

export type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type CollectionRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string | null;
  category: string;
  status: ContentStatus;
  position: number;
  created_at: string;
  updated_at: string;
};

export type CollectionImageRow = {
  id: string;
  collection_id: string;
  storage_path: string;
  alt: string;
  width: number;
  height: number;
  position: number;
  is_primary: boolean;
  created_at: string;
};

export type GalleryImageRow = {
  id: string;
  storage_path: string;
  alt: string;
  caption: string | null;
  width: number;
  height: number;
  col_span: 1 | 2;
  row_span: 2 | 3;
  status: ContentStatus;
  position: number;
  created_at: string;
  updated_at: string;
};

export type ServiceRow = {
  id: string;
  icon: string;
  title: string;
  description: string;
  price: string;
  status: ContentStatus;
  position: number;
  created_at: string;
  updated_at: string;
};

export type TestimonialRow = {
  id: string;
  quote: string;
  author: string;
  context: string;
  rating: number;
  is_featured: boolean;
  status: ContentStatus;
  position: number;
  created_at: string;
  updated_at: string;
};

export type FaqRow = {
  id: string;
  question: string;
  answer: string;
  status: ContentStatus;
  position: number;
  created_at: string;
  updated_at: string;
};

export type SettingRow = {
  key: string;
  value: unknown;
  updated_at: string;
};

/** Colonnes générées par la base, jamais fournies à l'insertion. */
type Generated = 'id' | 'created_at' | 'updated_at';

type Insert<T, K extends keyof T = never> = Omit<T, Extract<keyof T, Generated> | K> &
  Partial<Pick<T, Extract<keyof T, Generated>>>;

type Update<T> = Partial<Omit<T, 'id' | 'created_at'>>;

/**
 * Déclaré en alias de type, et non en interface : `postgrest-js` exige que le
 * schéma satisfasse `Record<string, GenericTable>`, ce qui suppose une index
 * signature implicite. Les interfaces n'en produisent pas — le typage des
 * requêtes retomberait alors silencieusement sur `never`.
 */
type Table<Row, Ins, Upd> = {
  Row: Row;
  Insert: Ins;
  Update: Upd;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      users: Table<UserRow, Insert<UserRow>, Update<UserRow>>;
      collections: Table<CollectionRow, Insert<CollectionRow>, Update<CollectionRow>>;
      collection_images: Table<
        CollectionImageRow,
        Insert<CollectionImageRow>,
        Update<CollectionImageRow>
      >;
      gallery_images: Table<GalleryImageRow, Insert<GalleryImageRow>, Update<GalleryImageRow>>;
      services: Table<ServiceRow, Insert<ServiceRow>, Update<ServiceRow>>;
      testimonials: Table<TestimonialRow, Insert<TestimonialRow>, Update<TestimonialRow>>;
      faq: Table<FaqRow, Insert<FaqRow>, Update<FaqRow>>;
      settings: Table<
        SettingRow,
        Omit<SettingRow, 'updated_at'> & Partial<Pick<SettingRow, 'updated_at'>>,
        Partial<Omit<SettingRow, 'key'>>
      >;
    };
    Views: { [_ in never]: never };
    Functions: {
      is_staff: { Args: Record<string, never>; Returns: boolean };
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      content_status: ContentStatus;
      user_role: UserRole;
    };
    CompositeTypes: { [_ in never]: never };
  };
};

/** Table du schéma public, par son nom. */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
