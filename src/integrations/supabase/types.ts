export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      calendar_events: {
        Row: {
          created_at: string
          date: string
          dog_id: string | null
          dog_name: string | null
          id: string
          notes: string | null
          time: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          dog_id?: string | null
          dog_name?: string | null
          id?: string
          notes?: string | null
          time?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          dog_id?: string | null
          dog_name?: string | null
          id?: string
          notes?: string | null
          time?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dogs: {
        Row: {
          breed: string
          color: string
          created_at: string
          date_of_birth: string
          deworming_date: string | null
          gender: string
          heat_interval: number | null
          id: string
          image_url: string | null
          name: string
          notes: string | null
          registration_number: string | null
          updated_at: string
          user_id: string
          vaccination_date: string | null
        }
        Insert: {
          breed: string
          color: string
          created_at?: string
          date_of_birth: string
          deworming_date?: string | null
          gender: string
          heat_interval?: number | null
          id?: string
          image_url?: string | null
          name: string
          notes?: string | null
          registration_number?: string | null
          updated_at?: string
          user_id: string
          vaccination_date?: string | null
        }
        Update: {
          breed?: string
          color?: string
          created_at?: string
          date_of_birth?: string
          deworming_date?: string | null
          gender?: string
          heat_interval?: number | null
          id?: string
          image_url?: string | null
          name?: string
          notes?: string | null
          registration_number?: string | null
          updated_at?: string
          user_id?: string
          vaccination_date?: string | null
        }
        Relationships: []
      }
      heat_records: {
        Row: {
          created_at: string
          date: string
          dog_id: string
          id: string
        }
        Insert: {
          created_at?: string
          date: string
          dog_id: string
          id?: string
        }
        Update: {
          created_at?: string
          date?: string
          dog_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "heat_records_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
        ]
      }
      litters: {
        Row: {
          created_at: string
          dam_id: string
          date: string
          id: string
          notes: string | null
          puppies: number
          sire_id: string | null
        }
        Insert: {
          created_at?: string
          dam_id: string
          date: string
          id?: string
          notes?: string | null
          puppies: number
          sire_id?: string | null
        }
        Update: {
          created_at?: string
          dam_id?: string
          date?: string
          id?: string
          notes?: string | null
          puppies?: number
          sire_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "litters_dam_id_fkey"
            columns: ["dam_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "litters_sire_id_fkey"
            columns: ["sire_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
        ]
      }
      matings: {
        Row: {
          created_at: string
          date: string
          dog_id: string
          id: string
          partner_id: string | null
          partner_name: string | null
          successful: boolean
        }
        Insert: {
          created_at?: string
          date: string
          dog_id: string
          id?: string
          partner_id?: string | null
          partner_name?: string | null
          successful?: boolean
        }
        Update: {
          created_at?: string
          date?: string
          dog_id?: string
          id?: string
          partner_id?: string | null
          partner_name?: string | null
          successful?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "matings_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matings_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_issues: {
        Row: {
          created_at: string
          date: string
          dog_id: string
          id: string
          issue: string
          notes: string | null
        }
        Insert: {
          created_at?: string
          date: string
          dog_id: string
          id?: string
          issue: string
          notes?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          dog_id?: string
          id?: string
          issue?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_issues_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          sharing_enabled: boolean | null
          subscription_end_date: string | null
          subscription_status: string
          subscription_tier: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          sharing_enabled?: boolean | null
          subscription_end_date?: string | null
          subscription_status?: string
          subscription_tier?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          sharing_enabled?: boolean | null
          subscription_end_date?: string | null
          subscription_status?: string
          subscription_tier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reminder_status: {
        Row: {
          created_at: string
          id: string
          is_completed: boolean
          is_deleted: boolean
          reminder_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_completed?: boolean
          is_deleted?: boolean
          reminder_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_completed?: boolean
          is_deleted?: boolean
          reminder_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_status_reminder_id_fkey"
            columns: ["reminder_id"]
            isOneToOne: false
            referencedRelation: "reminders"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          created_at: string
          description: string
          dog_id: string | null
          due_date: string
          id: string
          is_custom: boolean
          priority: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          dog_id?: string | null
          due_date: string
          id?: string
          is_custom?: boolean
          priority: string
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          dog_id?: string | null
          due_date?: string
          id?: string
          is_custom?: boolean
          priority?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shared_users: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          role: string
          shared_email: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id: string
          role: string
          shared_email: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          role?: string
          shared_email?: string
          status?: string
        }
        Relationships: []
      }
      vaccinations: {
        Row: {
          created_at: string
          date: string
          dog_id: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          date: string
          dog_id: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          date?: string
          dog_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaccinations_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_profile: {
        Args: {
          p_first_name: string
          p_last_name: string
          p_kennel_name: string
          p_address: string
          p_website: string
          p_phone: string
        }
        Returns: boolean
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
