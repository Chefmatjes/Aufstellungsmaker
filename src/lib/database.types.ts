export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      candidate_lists: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string | null;
          requires_substitutes: boolean;
          requires_trainer: boolean;
          allow_player_adds: boolean;
          share_slug: string;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description?: string | null;
          requires_substitutes?: boolean;
          requires_trainer?: boolean;
          allow_player_adds?: boolean;
          share_slug: string;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          description?: string | null;
          requires_substitutes?: boolean;
          requires_trainer?: boolean;
          allow_player_adds?: boolean;
          share_slug?: string;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      candidates: {
        Row: {
          id: string;
          list_id: string;
          name: string;
          category: string | null;
          added_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          name: string;
          category?: string | null;
          added_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          list_id?: string;
          name?: string;
          category?: string | null;
          added_by?: string | null;
          created_at?: string;
        };
      };
      lineups: {
        Row: {
          id: string;
          list_id: string;
          creator_id: string | null;
          trainer_id: string | null;
          team_name: string;
          share_slug: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          creator_id?: string | null;
          trainer_id?: string | null;
          team_name: string;
          share_slug: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          list_id?: string;
          creator_id?: string | null;
          trainer_id?: string | null;
          team_name?: string;
          share_slug?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      lineup_positions: {
        Row: {
          id: string;
          lineup_id: string;
          candidate_id: string;
          x_percent: number;
          y_percent: number;
          is_substitute: boolean;
          order_index: number;
        };
        Insert: {
          id?: string;
          lineup_id: string;
          candidate_id: string;
          x_percent: number;
          y_percent: number;
          is_substitute?: boolean;
          order_index?: number;
        };
        Update: {
          id?: string;
          lineup_id?: string;
          candidate_id?: string;
          x_percent?: number;
          y_percent?: number;
          is_substitute?: boolean;
          order_index?: number;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Helper types for easier usage
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type CandidateList = Database["public"]["Tables"]["candidate_lists"]["Row"];
export type Candidate = Database["public"]["Tables"]["candidates"]["Row"];
export type Lineup = Database["public"]["Tables"]["lineups"]["Row"];
export type LineupPosition = Database["public"]["Tables"]["lineup_positions"]["Row"];

// Extended types with relations
export type CandidateListWithCandidates = CandidateList & {
  candidates: Candidate[];
};

export type LineupWithPositions = Lineup & {
  lineup_positions: (LineupPosition & {
    candidate: Candidate;
  })[];
};
