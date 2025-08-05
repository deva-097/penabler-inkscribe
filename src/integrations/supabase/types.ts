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
      inking_events: {
        Row: {
          created_at: string
          date: string
          event_type: string
          id: string
          ink_id: string | null
          notes: string | null
          pen_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          event_type: string
          id?: string
          ink_id?: string | null
          notes?: string | null
          pen_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          event_type?: string
          id?: string
          ink_id?: string | null
          notes?: string | null
          pen_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inking_events_ink_id_fkey"
            columns: ["ink_id"]
            isOneToOne: false
            referencedRelation: "inks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inking_events_pen_id_fkey"
            columns: ["pen_id"]
            isOneToOne: false
            referencedRelation: "pens"
            referencedColumns: ["id"]
          },
        ]
      }
      inks: {
        Row: {
          brand: string
          color: string
          created_at: string
          id: string
          name: string
          notes: string | null
          price: string
          primary_color: string | null
          purchase_date: string
          shading: boolean
          sheen: boolean
          shimmer: boolean
          type: string
          updated_at: string
          user_id: string
          volume: string
          waterproof: boolean
        }
        Insert: {
          brand: string
          color: string
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          price: string
          primary_color?: string | null
          purchase_date: string
          shading?: boolean
          sheen?: boolean
          shimmer?: boolean
          type: string
          updated_at?: string
          user_id: string
          volume: string
          waterproof?: boolean
        }
        Update: {
          brand?: string
          color?: string
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          price?: string
          primary_color?: string | null
          purchase_date?: string
          shading?: boolean
          sheen?: boolean
          shimmer?: boolean
          type?: string
          updated_at?: string
          user_id?: string
          volume?: string
          waterproof?: boolean
        }
        Relationships: []
      }
      pens: {
        Row: {
          brand: string
          color: string
          country_of_origin: string | null
          created_at: string
          era: string
          filling_mechanism: string | null
          id: string
          model: string
          name: string
          nib_material: string
          nib_size: string
          notes: string | null
          price: string
          purchase_date: string
          type: string
          updated_at: string
          user_id: string
          year_of_make: string | null
        }
        Insert: {
          brand: string
          color: string
          country_of_origin?: string | null
          created_at?: string
          era: string
          filling_mechanism?: string | null
          id?: string
          model: string
          name: string
          nib_material: string
          nib_size: string
          notes?: string | null
          price: string
          purchase_date: string
          type: string
          updated_at?: string
          user_id: string
          year_of_make?: string | null
        }
        Update: {
          brand?: string
          color?: string
          country_of_origin?: string | null
          created_at?: string
          era?: string
          filling_mechanism?: string | null
          id?: string
          model?: string
          name?: string
          nib_material?: string
          nib_size?: string
          notes?: string | null
          price?: string
          purchase_date?: string
          type?: string
          updated_at?: string
          user_id?: string
          year_of_make?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
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
