export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ab_test_results: {
        Row: {
          id: string
          metric_name: string
          metric_value: number
          recorded_at: string | null
          test_id: string
          variant_id: string
        }
        Insert: {
          id?: string
          metric_name: string
          metric_value: number
          recorded_at?: string | null
          test_id: string
          variant_id: string
        }
        Update: {
          id?: string
          metric_name?: string
          metric_value?: number
          recorded_at?: string | null
          test_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_results_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_results_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "ab_test_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_test_variants: {
        Row: {
          branch_id: string | null
          content: string
          created_at: string | null
          emotional_impact: number | null
          engagement_score: number | null
          hook_strength: number | null
          id: string
          prediction_id: string | null
          shareability_score: number | null
          test_id: string
          trend_alignment: number | null
          user_preference_votes: number | null
          variant_name: string
          version_id: string | null
          viral_score: number | null
        }
        Insert: {
          branch_id?: string | null
          content: string
          created_at?: string | null
          emotional_impact?: number | null
          engagement_score?: number | null
          hook_strength?: number | null
          id?: string
          prediction_id?: string | null
          shareability_score?: number | null
          test_id: string
          trend_alignment?: number | null
          user_preference_votes?: number | null
          variant_name: string
          version_id?: string | null
          viral_score?: number | null
        }
        Update: {
          branch_id?: string | null
          content?: string
          created_at?: string | null
          emotional_impact?: number | null
          engagement_score?: number | null
          hook_strength?: number | null
          id?: string
          prediction_id?: string | null
          shareability_score?: number | null
          test_id?: string
          trend_alignment?: number | null
          user_preference_votes?: number | null
          variant_name?: string
          version_id?: string | null
          viral_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_variants_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "script_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_variants_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "predictions_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_variants_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_variants_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "script_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_tests: {
        Row: {
          completed_at: string | null
          created_at: string | null
          hypothesis: string | null
          id: string
          notes: string | null
          script_id: string
          status: string | null
          test_name: string
          user_id: string
          winner_variant_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          hypothesis?: string | null
          id?: string
          notes?: string | null
          script_id: string
          status?: string | null
          test_name: string
          user_id: string
          winner_variant_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          hypothesis?: string | null
          id?: string
          notes?: string | null
          script_id?: string
          status?: string | null
          test_name?: string
          user_id?: string
          winner_variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ab_tests_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_2fa_attempts: {
        Row: {
          attempt_type: string
          created_at: string | null
          id: string
          ip_address: unknown
          success: boolean
          user_agent: string | null
          user_id: string
        }
        Insert: {
          attempt_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          success: boolean
          user_agent?: string | null
          user_id: string
        }
        Update: {
          attempt_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          success?: boolean
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          reason: string | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          reason?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          reason?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_roles: {
        Row: {
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      admin_totp: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          last_used_at: string | null
          secret_encrypted: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          last_used_at?: string | null
          secret_encrypted: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          last_used_at?: string | null
          secret_encrypted?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      login_activity: {
        Row: {
          browser: string | null
          created_at: string
          device_type: string | null
          failure_reason: string | null
          id: string
          ip_address: unknown
          location: string | null
          success: boolean
          user_agent: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string
          device_type?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: unknown
          location?: string | null
          success?: boolean
          user_agent?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string
          device_type?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: unknown
          location?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      login_rate_limits: {
        Row: {
          blocked_until: string | null
          created_at: string
          failed_attempts: number
          first_failed_at: string | null
          id: string
          ip_address: unknown
          last_attempt_at: string
        }
        Insert: {
          blocked_until?: string | null
          created_at?: string
          failed_attempts?: number
          first_failed_at?: string | null
          id?: string
          ip_address: unknown
          last_attempt_at?: string
        }
        Update: {
          blocked_until?: string | null
          created_at?: string
          failed_attempts?: number
          first_failed_at?: string | null
          id?: string
          ip_address?: unknown
          last_attempt_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_collaboration: boolean
          email_marketing: boolean
          email_product_updates: boolean
          email_script_analysis: boolean
          email_series_reminders: boolean
          email_weekly_digest: boolean
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_collaboration?: boolean
          email_marketing?: boolean
          email_product_updates?: boolean
          email_script_analysis?: boolean
          email_series_reminders?: boolean
          email_weekly_digest?: boolean
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_collaboration?: boolean
          email_marketing?: boolean
          email_product_updates?: boolean
          email_script_analysis?: boolean
          email_series_reminders?: boolean
          email_weekly_digest?: boolean
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      predictions_history: {
        Row: {
          conflict_clarity: number
          content: string
          created_at: string
          dialogue_quality: number
          emotional_impact: number
          engagement_score: number
          hook_strength: number
          id: string
          niche: string | null
          pacing_quality: number
          prediction_type: string
          quotability: number
          recommendations: Json | null
          relatability: number
          script_id: string | null
          shareability_score: number
          strengths: Json | null
          title: string
          user_id: string
          viral_score: number
          weaknesses: Json | null
        }
        Insert: {
          conflict_clarity: number
          content: string
          created_at?: string
          dialogue_quality: number
          emotional_impact: number
          engagement_score: number
          hook_strength: number
          id?: string
          niche?: string | null
          pacing_quality: number
          prediction_type: string
          quotability: number
          recommendations?: Json | null
          relatability: number
          script_id?: string | null
          shareability_score: number
          strengths?: Json | null
          title: string
          user_id: string
          viral_score: number
          weaknesses?: Json | null
        }
        Update: {
          conflict_clarity?: number
          content?: string
          created_at?: string
          dialogue_quality?: number
          emotional_impact?: number
          engagement_score?: number
          hook_strength?: number
          id?: string
          niche?: string | null
          pacing_quality?: number
          prediction_type?: string
          quotability?: number
          recommendations?: Json | null
          relatability?: number
          script_id?: string | null
          shareability_score?: number
          strengths?: Json | null
          title?: string
          user_id?: string
          viral_score?: number
          weaknesses?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_predictions_history_script"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          goals: string[] | null
          id: string
          onboarding_completed: boolean | null
          preferred_niche: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          goals?: string[] | null
          id?: string
          onboarding_completed?: boolean | null
          preferred_niche?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          goals?: string[] | null
          id?: string
          onboarding_completed?: boolean | null
          preferred_niche?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      script_branches: {
        Row: {
          branch_name: string
          created_at: string | null
          created_from_version: number
          current_version_content: string
          id: string
          is_active: boolean | null
          length: string | null
          merged_at: string | null
          merged_by: string | null
          niche: string | null
          parent_branch_id: string | null
          script_id: string
          tone: string | null
          topic: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          branch_name: string
          created_at?: string | null
          created_from_version: number
          current_version_content: string
          id?: string
          is_active?: boolean | null
          length?: string | null
          merged_at?: string | null
          merged_by?: string | null
          niche?: string | null
          parent_branch_id?: string | null
          script_id: string
          tone?: string | null
          topic?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          branch_name?: string
          created_at?: string | null
          created_from_version?: number
          current_version_content?: string
          id?: string
          is_active?: boolean | null
          length?: string | null
          merged_at?: string | null
          merged_by?: string | null
          niche?: string | null
          parent_branch_id?: string | null
          script_id?: string
          tone?: string | null
          topic?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "script_branches_parent_branch_id_fkey"
            columns: ["parent_branch_id"]
            isOneToOne: false
            referencedRelation: "script_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "script_branches_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      script_versions: {
        Row: {
          branch_id: string | null
          branch_name: string | null
          change_description: string | null
          content: string
          created_at: string
          id: string
          length: string | null
          niche: string | null
          prediction_id: string | null
          script_id: string
          title: string
          tone: string | null
          topic: string | null
          user_id: string
          version_number: number
          viral_score: number | null
        }
        Insert: {
          branch_id?: string | null
          branch_name?: string | null
          change_description?: string | null
          content: string
          created_at?: string
          id?: string
          length?: string | null
          niche?: string | null
          prediction_id?: string | null
          script_id: string
          title: string
          tone?: string | null
          topic?: string | null
          user_id: string
          version_number: number
          viral_score?: number | null
        }
        Update: {
          branch_id?: string | null
          branch_name?: string | null
          change_description?: string | null
          content?: string
          created_at?: string
          id?: string
          length?: string | null
          niche?: string | null
          prediction_id?: string | null
          script_id?: string
          title?: string
          tone?: string | null
          topic?: string | null
          user_id?: string
          version_number?: number
          viral_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "script_versions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "script_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "script_versions_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "predictions_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "script_versions_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      scripts: {
        Row: {
          active_branch_id: string | null
          beat_markers: Json | null
          content: string
          content_safety_flags: Json | null
          created_at: string
          current_version: number | null
          episode_number: number | null
          fiction_disclaimer: boolean | null
          hook_variations: Json | null
          id: string
          last_version_at: string | null
          length: string
          niche: string
          script_mode: string | null
          series_id: string | null
          title: string
          tone: string
          topic: string | null
          trend_id: string | null
          tts_optimized: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active_branch_id?: string | null
          beat_markers?: Json | null
          content: string
          content_safety_flags?: Json | null
          created_at?: string
          current_version?: number | null
          episode_number?: number | null
          fiction_disclaimer?: boolean | null
          hook_variations?: Json | null
          id?: string
          last_version_at?: string | null
          length: string
          niche: string
          script_mode?: string | null
          series_id?: string | null
          title: string
          tone: string
          topic?: string | null
          trend_id?: string | null
          tts_optimized?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active_branch_id?: string | null
          beat_markers?: Json | null
          content?: string
          content_safety_flags?: Json | null
          created_at?: string
          current_version?: number | null
          episode_number?: number | null
          fiction_disclaimer?: boolean | null
          hook_variations?: Json | null
          id?: string
          last_version_at?: string | null
          length?: string
          niche?: string
          script_mode?: string | null
          series_id?: string | null
          title?: string
          tone?: string
          topic?: string | null
          trend_id?: string | null
          tts_optimized?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_scripts_series"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scripts_active_branch_id_fkey"
            columns: ["active_branch_id"]
            isOneToOne: false
            referencedRelation: "script_branches"
            referencedColumns: ["id"]
          },
        ]
      }
      series: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          niche: string | null
          premise: string | null
          title: string
          tone: string | null
          total_episodes: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          niche?: string | null
          premise?: string | null
          title: string
          tone?: string | null
          total_episodes?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          niche?: string | null
          premise?: string | null
          title?: string
          tone?: string | null
          total_episodes?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      trending_topics: {
        Row: {
          category: string | null
          engagement_count: string | null
          id: string
          is_active: boolean | null
          last_updated: string | null
          metadata: Json | null
          platform: string | null
          topic: string
          viral_score: number | null
        }
        Insert: {
          category?: string | null
          engagement_count?: string | null
          id: string
          is_active?: boolean | null
          last_updated?: string | null
          metadata?: Json | null
          platform?: string | null
          topic: string
          viral_score?: number | null
        }
        Update: {
          category?: string | null
          engagement_count?: string | null
          id?: string
          is_active?: boolean | null
          last_updated?: string | null
          metadata?: Json | null
          platform?: string | null
          topic?: string
          viral_score?: number | null
        }
        Relationships: []
      }
      user_totp: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          last_used_at: string | null
          secret_encrypted: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          last_used_at?: string | null
          secret_encrypted: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          last_used_at?: string | null
          secret_encrypted?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      video_assets: {
        Row: {
          asset_type: string
          created_at: string
          file_size_bytes: number | null
          id: string
          metadata: Json | null
          mime_type: string | null
          project_id: string
          scene_id: string | null
          url: string
        }
        Insert: {
          asset_type: string
          created_at?: string
          file_size_bytes?: number | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          project_id: string
          scene_id?: string | null
          url: string
        }
        Update: {
          asset_type?: string
          created_at?: string
          file_size_bytes?: number | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          project_id?: string
          scene_id?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "video_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_assets_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "video_scenes"
            referencedColumns: ["id"]
          },
        ]
      }
      video_projects: {
        Row: {
          created_at: string
          description: string | null
          duration_seconds: number | null
          error_message: string | null
          id: string
          script_id: string | null
          settings: Json | null
          status: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          error_message?: string | null
          id?: string
          script_id?: string | null
          settings?: Json | null
          status?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          error_message?: string | null
          id?: string
          script_id?: string | null
          settings?: Json | null
          status?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_projects_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      video_scenes: {
        Row: {
          audio_url: string | null
          created_at: string
          duration_seconds: number
          id: string
          image_url: string | null
          project_id: string
          script_segment: string
          sequence_order: number
          settings: Json | null
          status: string
          transition_type: string | null
          updated_at: string
          visual_prompt: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          duration_seconds?: number
          id?: string
          image_url?: string | null
          project_id: string
          script_segment: string
          sequence_order: number
          settings?: Json | null
          status?: string
          transition_type?: string | null
          updated_at?: string
          visual_prompt: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          duration_seconds?: number
          id?: string
          image_url?: string | null
          project_id?: string
          script_segment?: string
          sequence_order?: number
          settings?: Json | null
          status?: string
          transition_type?: string | null
          updated_at?: string
          visual_prompt?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_scenes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "video_projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ab_test_owner_id: { Args: { p_test: string }; Returns: string }
      cleanup_expired_rate_limits: { Args: never; Returns: undefined }
      has_role:
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
        | { Args: { target_role: string }; Returns: boolean }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      log_admin_action: {
        Args: {
          p_action: string
          p_metadata?: Json
          p_reason?: string
          p_resource_id: string
          p_resource_type: string
        }
        Returns: undefined
      }
      moderator_log: {
        Args: {
          p_action: string
          p_metadata?: Json
          p_reason?: string
          p_resource_id: string
          p_resource_type: string
        }
        Returns: undefined
      }
      project_owner_id: { Args: { p_project: string }; Returns: string }
    }
    Enums: {
      app_role: "super_admin" | "support_admin" | "content_moderator" | "user"
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
    Enums: {
      app_role: ["super_admin", "support_admin", "content_moderator", "user"],
    },
  },
} as const
