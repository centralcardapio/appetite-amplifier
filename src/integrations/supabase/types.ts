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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      credit_purchases: {
        Row: {
          amount: number
          available_amount: number
          created_at: string
          expiration_date: string
          id: string
          order_reference: string | null
          purchase_date: string
          purchase_type: string
          updated_at: string
          used_amount: number
          user_id: string
        }
        Insert: {
          amount: number
          available_amount: number
          created_at?: string
          expiration_date: string
          id?: string
          order_reference?: string | null
          purchase_date?: string
          purchase_type?: string
          updated_at?: string
          used_amount?: number
          user_id: string
        }
        Update: {
          amount?: number
          available_amount?: number
          created_at?: string
          expiration_date?: string
          id?: string
          order_reference?: string | null
          purchase_date?: string
          purchase_type?: string
          updated_at?: string
          used_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      credit_usage_history: {
        Row: {
          amount_used: number
          credit_purchase_id: string
          description: string
          id: string
          photo_transformation_id: string | null
          used_at: string
          user_id: string
        }
        Insert: {
          amount_used: number
          credit_purchase_id: string
          description: string
          id?: string
          photo_transformation_id?: string | null
          used_at?: string
          user_id: string
        }
        Update: {
          amount_used?: number
          credit_purchase_id?: string
          description?: string
          id?: string
          photo_transformation_id?: string | null
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_usage_history_credit_purchase_id_fkey"
            columns: ["credit_purchase_id"]
            isOneToOne: false
            referencedRelation: "credit_purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_usage_history_photo_transformation_id_fkey"
            columns: ["photo_transformation_id"]
            isOneToOne: false
            referencedRelation: "photo_transformations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_queue: {
        Row: {
          created_at: string | null
          dashboard_link: string | null
          email: string
          email_type: string
          error_message: string | null
          id: string
          name: string
          sent_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dashboard_link?: string | null
          email: string
          email_type?: string
          error_message?: string | null
          id?: string
          name: string
          sent_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          dashboard_link?: string | null
          email?: string
          email_type?: string
          error_message?: string | null
          id?: string
          name?: string
          sent_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          billing_type: string | null
          callback_auto_redirect: boolean | null
          callback_success_url: string | null
          charge_type: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          due_date_limit_days: number | null
          external_reference: string | null
          id: string
          max_installment_count: number | null
          notification_enabled: boolean | null
          payment_date: string | null
          payment_id: string
          payment_link: string | null
          plan_name: string
          status: string
          updated_at: string | null
          user_id: string
          value: number
        }
        Insert: {
          billing_type?: string | null
          callback_auto_redirect?: boolean | null
          callback_success_url?: string | null
          charge_type?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          due_date_limit_days?: number | null
          external_reference?: string | null
          id?: string
          max_installment_count?: number | null
          notification_enabled?: boolean | null
          payment_date?: string | null
          payment_id: string
          payment_link?: string | null
          plan_name: string
          status?: string
          updated_at?: string | null
          user_id: string
          value: number
        }
        Update: {
          billing_type?: string | null
          callback_auto_redirect?: boolean | null
          callback_success_url?: string | null
          charge_type?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          due_date_limit_days?: number | null
          external_reference?: string | null
          id?: string
          max_installment_count?: number | null
          notification_enabled?: boolean | null
          payment_date?: string | null
          payment_id?: string
          payment_link?: string | null
          plan_name?: string
          status?: string
          updated_at?: string | null
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      photo_credits: {
        Row: {
          available: number
          created_at: string
          id: string
          total_purchased: number
          total_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          available?: number
          created_at?: string
          id?: string
          total_purchased?: number
          total_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          available?: number
          created_at?: string
          id?: string
          total_purchased?: number
          total_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      photo_transformations: {
        Row: {
          created_at: string
          feedback: Json | null
          id: string
          original_image_name: string
          original_image_url: string
          reprocessing_count: number
          status: string
          transformed_images: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback?: Json | null
          id?: string
          original_image_name: string
          original_image_url: string
          reprocessing_count?: number
          status?: string
          transformed_images?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feedback?: Json | null
          id?: string
          original_image_name?: string
          original_image_url?: string
          reprocessing_count?: number
          status?: string
          transformed_images?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_styles: {
        Row: {
          created_at: string
          id: string
          selected_style: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          selected_style: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          selected_style?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_initial_credits: {
        Args: { user_id_param: string }
        Returns: undefined
      }
      get_user_available_credits: {
        Args: { user_id_param: string }
        Returns: number
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      use_credits: {
        Args: {
          credits_to_use: number
          description_param: string
          photo_transformation_id_param?: string
          user_id_param: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
