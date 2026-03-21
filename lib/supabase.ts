import { createClient } from '@supabase/supabase-js';
import { MMKV } from 'react-native-mmkv';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const storage = new MMKV({ id: 'supabase-auth' });

const mmkvStorageAdapter = {
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: mmkvStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      users: { Row: UserRow; Insert: UserInsert; Update: UserUpdate };
      mods: { Row: ModRow; Insert: ModInsert; Update: ModUpdate };
      generations: { Row: GenerationRow; Insert: GenerationInsert; Update: GenerationUpdate };
      credit_transactions: { Row: CreditTransactionRow; Insert: CreditTransactionInsert; Update: CreditTransactionUpdate };
      collections: { Row: CollectionRow; Insert: CollectionInsert; Update: CollectionUpdate };
      collection_items: { Row: CollectionItemRow; Insert: CollectionItemInsert; Update: CollectionItemUpdate };
      likes: { Row: LikeRow; Insert: LikeInsert; Update: LikeUpdate };
      mod_likes: { Row: ModLikeRow; Insert: ModLikeInsert; Update: ModLikeUpdate };
      daily_challenges: { Row: DailyChallengeRow; Insert: DailyChallengeInsert; Update: DailyChallengeUpdate };
      user_challenges: { Row: UserChallengeRow; Insert: UserChallengeInsert; Update: UserChallengeUpdate };
      leaderboard_entries: { Row: LeaderboardEntryRow; Insert: LeaderboardEntryInsert; Update: LeaderboardEntryUpdate };
      app_config: { Row: AppConfigRow; Insert: AppConfigInsert; Update: AppConfigUpdate };
      prompt_library: { Row: PromptLibraryRow; Insert: PromptLibraryInsert; Update: PromptLibraryUpdate };
      prompt_votes: { Row: PromptVoteRow; Insert: PromptVoteInsert; Update: PromptVoteUpdate };
      reports: { Row: ReportRow; Insert: ReportInsert; Update: ReportUpdate };
    };
  };
};

export type UserRow = {
  id: string;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  credit_balance: number;
  current_streak: number;
  longest_streak: number;
  last_generation_date: string | null;
  is_pro: boolean;
  pro_expires_at: string | null;
  revenuecat_customer_id: string | null;
  language_preference: 'tr' | 'en';
  push_token: string | null;
  notification_hour: number;
  onboarding_completed: boolean;
  created_at: string;
};
export type UserInsert = Partial<UserRow> & { id: string };
export type UserUpdate = Partial<UserRow>;

export type ModRow = {
  id: string;
  name: string;
  slug: string;
  prompt: string;
  thumbnail_url: string | null;
  thumbnail_blurhash: string | null;
  category: string;
  type: 'official' | 'community';
  creator_id: string | null;
  is_prompt_public: boolean;
  is_premium: boolean;
  credit_cost: number;
  like_count: number;
  usage_count: number;
  share_count: number;
  created_at: string;
};
export type ModInsert = Omit<ModRow, 'id' | 'created_at' | 'like_count' | 'usage_count' | 'share_count'>;
export type ModUpdate = Partial<ModRow>;

export type GenerationRow = {
  id: string;
  user_id: string;
  mod_id: string;
  source_image_url: string | null;
  result_image_url: string | null;
  blurhash: string | null;
  custom_prompt: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fal_job_id: string | null;
  is_public: boolean;
  created_at: string;
  completed_at: string | null;
};
export type GenerationInsert = Omit<GenerationRow, 'id' | 'created_at'>;
export type GenerationUpdate = Partial<GenerationRow>;

export type CreditTransactionRow = {
  id: string;
  user_id: string;
  amount: number;
  type: 'signup_bonus' | 'daily_login' | 'pro_daily_bonus' | 'share_bonus' | 'purchase' | 'generation' | 'onboarding_free' | 'challenge_bonus' | 'refund';
  description: string | null;
  reference_id: string | null;
  created_at: string;
};
export type CreditTransactionInsert = Omit<CreditTransactionRow, 'id' | 'created_at'>;
export type CreditTransactionUpdate = Partial<CreditTransactionRow>;

export type CollectionRow = { id: string; user_id: string; name: string; cover_image_url: string | null; created_at: string };
export type CollectionInsert = Omit<CollectionRow, 'id' | 'created_at'>;
export type CollectionUpdate = Partial<CollectionRow>;

export type CollectionItemRow = { id: string; collection_id: string; generation_id: string; created_at: string };
export type CollectionItemInsert = Omit<CollectionItemRow, 'id' | 'created_at'>;
export type CollectionItemUpdate = Partial<CollectionItemRow>;

export type LikeRow = { id: string; user_id: string; generation_id: string; created_at: string };
export type LikeInsert = Omit<LikeRow, 'id' | 'created_at'>;
export type LikeUpdate = Partial<LikeRow>;

export type ModLikeRow = { id: string; user_id: string; mod_id: string; created_at: string };
export type ModLikeInsert = Omit<ModLikeRow, 'id' | 'created_at'>;
export type ModLikeUpdate = Partial<ModLikeRow>;

export type DailyChallengeRow = { id: string; title_tr: string; title_en: string; description_tr: string; description_en: string; challenge_type: string; target_mod_id: string | null; bonus_credits: number; active_date: string; created_at: string };
export type DailyChallengeInsert = Omit<DailyChallengeRow, 'id' | 'created_at'>;
export type DailyChallengeUpdate = Partial<DailyChallengeRow>;

export type UserChallengeRow = { id: string; user_id: string; challenge_id: string; completed_at: string };
export type UserChallengeInsert = Omit<UserChallengeRow, 'id'>;
export type UserChallengeUpdate = Partial<UserChallengeRow>;

export type LeaderboardEntryRow = { id: string; user_id: string; period_type: 'daily' | 'weekly' | 'monthly'; period_start: string; score: number; ranking_category: string; created_at: string };
export type LeaderboardEntryInsert = Omit<LeaderboardEntryRow, 'id' | 'created_at'>;
export type LeaderboardEntryUpdate = Partial<LeaderboardEntryRow>;

export type AppConfigRow = { id: string; key: string; value: string; updated_at: string };
export type AppConfigInsert = Omit<AppConfigRow, 'id'>;
export type AppConfigUpdate = Partial<AppConfigRow>;

export type PromptLibraryRow = { id: string; user_id: string; prompt_text: string; vote_count: number; created_at: string };
export type PromptLibraryInsert = Omit<PromptLibraryRow, 'id' | 'created_at' | 'vote_count'>;
export type PromptLibraryUpdate = Partial<PromptLibraryRow>;

export type PromptVoteRow = { id: string; user_id: string; prompt_id: string; created_at: string };
export type PromptVoteInsert = Omit<PromptVoteRow, 'id' | 'created_at'>;
export type PromptVoteUpdate = Partial<PromptVoteRow>;

export type ReportRow = { id: string; reporter_id: string; target_type: 'generation' | 'mod' | 'user'; target_id: string; reason: string; status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'; admin_note: string | null; created_at: string; resolved_at: string | null };
export type ReportInsert = Omit<ReportRow, 'id' | 'created_at' | 'status' | 'admin_note' | 'resolved_at'>;
export type ReportUpdate = Partial<ReportRow>;
