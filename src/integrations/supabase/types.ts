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
      approval_history: {
        Row: {
          action: string
          approver_nik: string
          comments: string | null
          created_at: string | null
          id: string
          overtime_id: string | null
        }
        Insert: {
          action: string
          approver_nik: string
          comments?: string | null
          created_at?: string | null
          id?: string
          overtime_id?: string | null
        }
        Update: {
          action?: string
          approver_nik?: string
          comments?: string | null
          created_at?: string | null
          id?: string
          overtime_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_history_overtime_id_fkey"
            columns: ["overtime_id"]
            isOneToOne: false
            referencedRelation: "overtime_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      overtime_categories: {
        Row: {
          created_at: string | null
          description: string | null
          end_time: string
          id: string
          is_active: boolean | null
          name: string
          start_time: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_time: string
          id?: string
          is_active?: boolean | null
          name: string
          start_time: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_time?: string
          id?: string
          is_active?: boolean | null
          name?: string
          start_time?: string
        }
        Relationships: []
      }
      overtime_submissions: {
        Row: {
          approver1_approved_at: string | null
          approver1_nik: string | null
          approver2_approved_at: string | null
          approver2_nik: string | null
          category_id: string | null
          created_at: string | null
          employee_nik: string
          end_time: string
          id: string
          job_description: string
          rejection_reason: string | null
          start_time: string
          status: Database["public"]["Enums"]["overtime_status"] | null
          submission_date: string
          total_hours: number
          updated_at: string | null
        }
        Insert: {
          approver1_approved_at?: string | null
          approver1_nik?: string | null
          approver2_approved_at?: string | null
          approver2_nik?: string | null
          category_id?: string | null
          created_at?: string | null
          employee_nik: string
          end_time: string
          id?: string
          job_description: string
          rejection_reason?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["overtime_status"] | null
          submission_date: string
          total_hours: number
          updated_at?: string | null
        }
        Update: {
          approver1_approved_at?: string | null
          approver1_nik?: string | null
          approver2_approved_at?: string | null
          approver2_nik?: string | null
          category_id?: string | null
          created_at?: string | null
          employee_nik?: string
          end_time?: string
          id?: string
          job_description?: string
          rejection_reason?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["overtime_status"] | null
          submission_date?: string
          total_hours?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "overtime_submissions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "overtime_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overtime_submissions_employee_nik_fkey"
            columns: ["employee_nik"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["nik"]
          },
        ]
      }
      profiles: {
        Row: {
          approver1_nik: string | null
          approver2_nik: string | null
          created_at: string | null
          full_name: string
          id: string
          line_area: string
          nik: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          approver1_nik?: string | null
          approver2_nik?: string | null
          created_at?: string | null
          full_name: string
          id?: string
          line_area: string
          nik: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          approver1_nik?: string | null
          approver2_nik?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          line_area?: string
          nik?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      overtime_status:
        | "pending"
        | "approved_level1"
        | "approved_level2"
        | "rejected"
      user_role: "admin" | "operator" | "leader" | "manager"
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
      overtime_status: [
        "pending",
        "approved_level1",
        "approved_level2",
        "rejected",
      ],
      user_role: ["admin", "operator", "leader", "manager"],
    },
  },
} as const
