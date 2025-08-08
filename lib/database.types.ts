export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      cluster_articles: {
        Row: {
          added_at: string | null
          article_id: string
          cluster_id: string
          is_primary: boolean | null
          relevance_score: number | null
        }
        Insert: {
          added_at?: string | null
          article_id: string
          cluster_id: string
          is_primary?: boolean | null
          relevance_score?: number | null
        }
        Update: {
          added_at?: string | null
          article_id?: string
          cluster_id?: string
          is_primary?: boolean | null
          relevance_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cluster_articles_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "raw_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cluster_articles_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "topic_clusters"
            referencedColumns: ["id"]
          },
        ]
      }
      news_sources: {
        Row: {
          category: string | null
          country_code: string | null
          created_at: string | null
          credibility_score: number | null
          fetch_error_count: number | null
          id: string
          is_active: boolean | null
          language_code: string | null
          last_fetched_at: string | null
          metadata: Json | null
          name: string
          political_leaning: string | null
          rss_feed_url: string
          update_frequency_minutes: number | null
          updated_at: string | null
          url: string
        }
        Insert: {
          category?: string | null
          country_code?: string | null
          created_at?: string | null
          credibility_score?: number | null
          fetch_error_count?: number | null
          id?: string
          is_active?: boolean | null
          language_code?: string | null
          last_fetched_at?: string | null
          metadata?: Json | null
          name: string
          political_leaning?: string | null
          rss_feed_url: string
          update_frequency_minutes?: number | null
          updated_at?: string | null
          url: string
        }
        Update: {
          category?: string | null
          country_code?: string | null
          created_at?: string | null
          credibility_score?: number | null
          fetch_error_count?: number | null
          id?: string
          is_active?: boolean | null
          language_code?: string | null
          last_fetched_at?: string | null
          metadata?: Json | null
          name?: string
          political_leaning?: string | null
          rss_feed_url?: string
          update_frequency_minutes?: number | null
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      raw_articles: {
        Row: {
          author: string | null
          categories: string[] | null
          content: string | null
          created_at: string | null
          description: string | null
          duplicate_of: string | null
          guid: string | null
          id: string
          image_url: string | null
          is_duplicate: boolean | null
          language_detected: string | null
          metadata: Json | null
          processing_status: string | null
          published_at: string
          quality_score: number | null
          reading_time_minutes: number | null
          sentiment_score: number | null
          source_id: string
          tags: string[] | null
          title: string
          updated_at: string | null
          url: string
          word_count: number | null
        }
        Insert: {
          author?: string | null
          categories?: string[] | null
          content?: string | null
          created_at?: string | null
          description?: string | null
          duplicate_of?: string | null
          guid?: string | null
          id?: string
          image_url?: string | null
          is_duplicate?: boolean | null
          language_detected?: string | null
          metadata?: Json | null
          processing_status?: string | null
          published_at: string
          quality_score?: number | null
          reading_time_minutes?: number | null
          sentiment_score?: number | null
          source_id: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          url: string
          word_count?: number | null
        }
        Update: {
          author?: string | null
          categories?: string[] | null
          content?: string | null
          created_at?: string | null
          description?: string | null
          duplicate_of?: string | null
          guid?: string | null
          id?: string
          image_url?: string | null
          is_duplicate?: boolean | null
          language_detected?: string | null
          metadata?: Json | null
          processing_status?: string | null
          published_at?: string
          quality_score?: number | null
          reading_time_minutes?: number | null
          sentiment_score?: number | null
          source_id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          url?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "raw_articles_duplicate_of_fkey"
            columns: ["duplicate_of"]
            isOneToOne: false
            referencedRelation: "raw_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raw_articles_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "news_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      related_clusters: {
        Row: {
          cluster_id: string
          created_at: string | null
          related_cluster_id: string
          relationship_type: string | null
          strength: number | null
        }
        Insert: {
          cluster_id: string
          created_at?: string | null
          related_cluster_id: string
          relationship_type?: string | null
          strength?: number | null
        }
        Update: {
          cluster_id?: string
          created_at?: string | null
          related_cluster_id?: string
          relationship_type?: string | null
          strength?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "related_clusters_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "topic_clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "related_clusters_related_cluster_id_fkey"
            columns: ["related_cluster_id"]
            isOneToOne: false
            referencedRelation: "topic_clusters"
            referencedColumns: ["id"]
          },
        ]
      }
      source_perspectives: {
        Row: {
          article_id: string
          bias_indicators: Json | null
          cluster_id: string
          created_at: string | null
          emphasis_topics: string[] | null
          factual_claims: string[] | null
          id: string
          key_quotes: string[] | null
          metadata: Json | null
          opinion_elements: string[] | null
          perspective_novelty_score: number | null
          perspective_summary: string
          relevance_score: number | null
          source_credibility_weight: number | null
          source_id: string
          stance: string | null
          unique_angles: string[] | null
          updated_at: string | null
        }
        Insert: {
          article_id: string
          bias_indicators?: Json | null
          cluster_id: string
          created_at?: string | null
          emphasis_topics?: string[] | null
          factual_claims?: string[] | null
          id?: string
          key_quotes?: string[] | null
          metadata?: Json | null
          opinion_elements?: string[] | null
          perspective_novelty_score?: number | null
          perspective_summary: string
          relevance_score?: number | null
          source_credibility_weight?: number | null
          source_id: string
          stance?: string | null
          unique_angles?: string[] | null
          updated_at?: string | null
        }
        Update: {
          article_id?: string
          bias_indicators?: Json | null
          cluster_id?: string
          created_at?: string | null
          emphasis_topics?: string[] | null
          factual_claims?: string[] | null
          id?: string
          key_quotes?: string[] | null
          metadata?: Json | null
          opinion_elements?: string[] | null
          perspective_novelty_score?: number | null
          perspective_summary?: string
          relevance_score?: number | null
          source_credibility_weight?: number | null
          source_id?: string
          stance?: string | null
          unique_angles?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "source_perspectives_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "raw_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_perspectives_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "topic_clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_perspectives_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "news_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      synthesized_articles: {
        Row: {
          cluster_id: string
          created_at: string | null
          credibility_score: number | null
          different_perspectives: string[] | null
          fact_check_status: string | null
          full_content: string | null
          geographic_coverage: string[] | null
          id: string
          key_points: string[] | null
          main_image_url: string | null
          metadata: Json | null
          political_balance: Json | null
          publish_status: string | null
          published_at: string | null
          quality_indicators: Json | null
          reading_time_minutes: number | null
          share_count: number | null
          source_count: number
          summary: string
          synthesis_method: string | null
          title: string
          total_source_articles: number
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          cluster_id: string
          created_at?: string | null
          credibility_score?: number | null
          different_perspectives?: string[] | null
          fact_check_status?: string | null
          full_content?: string | null
          geographic_coverage?: string[] | null
          id?: string
          key_points?: string[] | null
          main_image_url?: string | null
          metadata?: Json | null
          political_balance?: Json | null
          publish_status?: string | null
          published_at?: string | null
          quality_indicators?: Json | null
          reading_time_minutes?: number | null
          share_count?: number | null
          source_count: number
          summary: string
          synthesis_method?: string | null
          title: string
          total_source_articles: number
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          cluster_id?: string
          created_at?: string | null
          credibility_score?: number | null
          different_perspectives?: string[] | null
          fact_check_status?: string | null
          full_content?: string | null
          geographic_coverage?: string[] | null
          id?: string
          key_points?: string[] | null
          main_image_url?: string | null
          metadata?: Json | null
          political_balance?: Json | null
          publish_status?: string | null
          published_at?: string | null
          quality_indicators?: Json | null
          reading_time_minutes?: number | null
          share_count?: number | null
          source_count?: number
          summary?: string
          synthesis_method?: string | null
          title?: string
          total_source_articles?: number
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "synthesized_articles_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "topic_clusters"
            referencedColumns: ["id"]
          },
        ]
      }
      topic_clusters: {
        Row: {
          article_count: number | null
          average_sentiment: number | null
          cluster_method: string | null
          confidence_score: number | null
          created_at: string | null
          description: string | null
          geographic_focus: string | null
          id: string
          keywords: string[]
          main_topic: string | null
          merged_into: string | null
          metadata: Json | null
          status: string | null
          sub_topics: string[] | null
          time_period_end: string
          time_period_start: string
          title: string
          total_engagement: number | null
          trending_score: number | null
          updated_at: string | null
        }
        Insert: {
          article_count?: number | null
          average_sentiment?: number | null
          cluster_method?: string | null
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          geographic_focus?: string | null
          id?: string
          keywords: string[]
          main_topic?: string | null
          merged_into?: string | null
          metadata?: Json | null
          status?: string | null
          sub_topics?: string[] | null
          time_period_end: string
          time_period_start: string
          title: string
          total_engagement?: number | null
          trending_score?: number | null
          updated_at?: string | null
        }
        Update: {
          article_count?: number | null
          average_sentiment?: number | null
          cluster_method?: string | null
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          geographic_focus?: string | null
          id?: string
          keywords?: string[]
          main_topic?: string | null
          merged_into?: string | null
          metadata?: Json | null
          status?: string | null
          sub_topics?: string[] | null
          time_period_end?: string
          time_period_start?: string
          title?: string
          total_engagement?: number | null
          trending_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "topic_clusters_merged_into_fkey"
            columns: ["merged_into"]
            isOneToOne: false
            referencedRelation: "topic_clusters"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_old_clusters: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      calculate_trending_score: {
        Args: { cluster_id_param: string }
        Returns: number
      }
      get_similar_articles: {
        Args: {
          input_title: string
          input_content: string
          similarity_threshold?: number
          max_results?: number
        }
        Returns: {
          article_id: string
          title: string
          similarity_score: number
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
