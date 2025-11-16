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
      badges: {
        Row: {
          created_at: string | null
          description: string | null
          icon_url: string | null
          id: string
          name: string
          points_required: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          name: string
          points_required: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          name?: string
          points_required?: number
        }
        Relationships: []
      }
      business_transactions: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          description: string | null
          id: string
          transaction_date: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          transaction_date?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          transaction_date?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          category: string | null
          comments_count: number | null
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          comments_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          comments_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string
          content: string | null
          created_at: string | null
          description: string | null
          downloadable: boolean | null
          duration_minutes: number | null
          id: string
          thumbnail_url: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          category: string
          content?: string | null
          created_at?: string | null
          description?: string | null
          downloadable?: boolean | null
          duration_minutes?: number | null
          id?: string
          thumbnail_url?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string | null
          description?: string | null
          downloadable?: boolean | null
          duration_minutes?: number | null
          id?: string
          thumbnail_url?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      diagnostic_questions: {
        Row: {
          created_at: string | null
          id: string
          options: Json | null
          order_number: number
          question_text: string
          question_type: string
          weight: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          options?: Json | null
          order_number: number
          question_text: string
          question_type: string
          weight?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          options?: Json | null
          order_number?: number
          question_text?: string
          question_type?: string
          weight?: number | null
        }
        Relationships: []
      }
      diagnostic_responses: {
        Row: {
          created_at: string | null
          id: string
          question_id: string
          response: string
          score: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          question_id: string
          response: string
          score?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          question_id?: string
          response?: string
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnostic_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_modules: {
        Row: {
          content: string | null
          created_at: string | null
          description: string | null
          exercises: Json | null
          id: string
          month_number: number
          order_number: number
          quiz_questions: Json | null
          route_type: string
          title: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          description?: string | null
          exercises?: Json | null
          id?: string
          month_number: number
          order_number: number
          quiz_questions?: Json | null
          route_type: string
          title: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          description?: string | null
          exercises?: Json | null
          id?: string
          month_number?: number
          order_number?: number
          quiz_questions?: Json | null
          route_type?: string
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      mentor_assignments: {
        Row: {
          active: boolean | null
          assigned_date: string | null
          end_date: string | null
          feedback: string | null
          id: string
          mentor_id: string
          rating: number | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          assigned_date?: string | null
          end_date?: string | null
          feedback?: string | null
          id?: string
          mentor_id: string
          rating?: number | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          assigned_date?: string | null
          end_date?: string | null
          feedback?: string | null
          id?: string
          mentor_id?: string
          rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_assignments_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_sessions: {
        Row: {
          assignment_id: string
          completed: boolean | null
          created_at: string | null
          id: string
          notes: string | null
          session_date: string
        }
        Insert: {
          assignment_id: string
          completed?: boolean | null
          created_at?: string | null
          id?: string
          notes?: string | null
          session_date: string
        }
        Update: {
          assignment_id?: string
          completed?: boolean | null
          created_at?: string | null
          id?: string
          notes?: string | null
          session_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_sessions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "mentor_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      mentors: {
        Row: {
          available: boolean | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          id: string
          name: string
          specialty: string
        }
        Insert: {
          available?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          name: string
          specialty: string
        }
        Update: {
          available?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          name?: string
          specialty?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          assigned_route: string | null
          avatar_url: string | null
          business_sector: string
          business_stage: string
          city: string
          created_at: string | null
          current_month: number | null
          full_name: string
          id: string
          level: number | null
          total_points: number | null
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          assigned_route?: string | null
          avatar_url?: string | null
          business_sector: string
          business_stage: string
          city: string
          created_at?: string | null
          current_month?: number | null
          full_name: string
          id: string
          level?: number | null
          total_points?: number | null
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          assigned_route?: string | null
          avatar_url?: string | null
          business_sector?: string
          business_stage?: string
          city?: string
          created_at?: string | null
          current_month?: number | null
          full_name?: string
          id?: string
          level?: number | null
          total_points?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      soft_skills_modules: {
        Row: {
          content: string | null
          created_at: string | null
          description: string | null
          exercise: string | null
          id: string
          order_number: number
          quiz_questions: Json | null
          title: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          description?: string | null
          exercise?: string | null
          id?: string
          order_number: number
          quiz_questions?: Json | null
          title: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          description?: string | null
          exercise?: string | null
          id?: string
          order_number?: number
          quiz_questions?: Json | null
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_course_progress: {
        Row: {
          completed: boolean | null
          course_id: string
          created_at: string | null
          id: string
          last_accessed: string | null
          progress_percentage: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          course_id: string
          created_at?: string | null
          id?: string
          last_accessed?: string | null
          progress_percentage?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          course_id?: string
          created_at?: string | null
          id?: string
          last_accessed?: string | null
          progress_percentage?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_course_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_module_progress: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          last_accessed: string | null
          module_id: string
          progress_percentage: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          last_accessed?: string | null
          module_id: string
          progress_percentage?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          last_accessed?: string | null
          module_id?: string
          progress_percentage?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_module_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_module_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_soft_skills_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          module_id: string
          score: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          module_id: string
          score?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          module_id?: string
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_soft_skills_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "soft_skills_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_soft_skills_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
