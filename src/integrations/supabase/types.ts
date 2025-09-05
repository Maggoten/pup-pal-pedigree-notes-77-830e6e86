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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      calendar_events: {
        Row: {
          created_at: string | null
          date: string
          dog_id: string | null
          dog_name: string | null
          end_date: string | null
          heat_phase: string | null
          id: string
          notes: string | null
          pregnancy_id: string | null
          status: string | null
          time: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          dog_id?: string | null
          dog_name?: string | null
          end_date?: string | null
          heat_phase?: string | null
          id?: string
          notes?: string | null
          pregnancy_id?: string | null
          status?: string | null
          time?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          dog_id?: string | null
          dog_name?: string | null
          end_date?: string | null
          heat_phase?: string | null
          id?: string
          notes?: string | null
          pregnancy_id?: string | null
          status?: string | null
          time?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_pregnancy_id_fkey"
            columns: ["pregnancy_id"]
            isOneToOne: false
            referencedRelation: "pregnancies"
            referencedColumns: ["id"]
          },
        ]
      }
      development_checklist_items: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          item_id: string
          litter_id: string
          updated_at: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          item_id: string
          litter_id: string
          updated_at?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          item_id?: string
          litter_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "development_checklist_items_litter_id_fkey"
            columns: ["litter_id"]
            isOneToOne: false
            referencedRelation: "litters"
            referencedColumns: ["id"]
          },
        ]
      }
      dogs: {
        Row: {
          birthdate: string | null
          breed: string | null
          breedingHistory: Json | null
          chip_number: string | null
          color: string | null
          created_at: string | null
          deleted_at: string | null
          dewormingDate: string | null
          gender: string | null
          heatHistory: Json | null
          heatInterval: number | null
          id: string
          image_url: string | null
          name: string
          notes: string | null
          owner_id: string | null
          registered_name: string | null
          registration_number: string | null
          sterilization_date: string | null
          updated_at: string | null
          vaccinationDate: string | null
        }
        Insert: {
          birthdate?: string | null
          breed?: string | null
          breedingHistory?: Json | null
          chip_number?: string | null
          color?: string | null
          created_at?: string | null
          deleted_at?: string | null
          dewormingDate?: string | null
          gender?: string | null
          heatHistory?: Json | null
          heatInterval?: number | null
          id?: string
          image_url?: string | null
          name: string
          notes?: string | null
          owner_id?: string | null
          registered_name?: string | null
          registration_number?: string | null
          sterilization_date?: string | null
          updated_at?: string | null
          vaccinationDate?: string | null
        }
        Update: {
          birthdate?: string | null
          breed?: string | null
          breedingHistory?: Json | null
          chip_number?: string | null
          color?: string | null
          created_at?: string | null
          deleted_at?: string | null
          dewormingDate?: string | null
          gender?: string | null
          heatHistory?: Json | null
          heatInterval?: number | null
          id?: string
          image_url?: string | null
          name?: string
          notes?: string | null
          owner_id?: string | null
          registered_name?: string | null
          registration_number?: string | null
          sterilization_date?: string | null
          updated_at?: string | null
          vaccinationDate?: string | null
        }
        Relationships: []
      }
      heat_cycles: {
        Row: {
          created_at: string
          cycle_length: number | null
          dog_id: string
          end_date: string | null
          id: string
          notes: string | null
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          cycle_length?: number | null
          dog_id: string
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          cycle_length?: number | null
          dog_id?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      heat_logs: {
        Row: {
          created_at: string
          date: string
          heat_cycle_id: string
          id: string
          notes: string | null
          observations: string | null
          phase: string | null
          temperature: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          heat_cycle_id: string
          id?: string
          notes?: string | null
          observations?: string | null
          phase?: string | null
          temperature?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          heat_cycle_id?: string
          id?: string
          notes?: string | null
          observations?: string | null
          phase?: string | null
          temperature?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "heat_logs_heat_cycle_id_fkey"
            columns: ["heat_cycle_id"]
            isOneToOne: false
            referencedRelation: "heat_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      litters: {
        Row: {
          archived: boolean | null
          created_at: string | null
          dam_id: string | null
          dam_name: string
          date_of_birth: string
          id: string
          name: string
          sire_id: string | null
          sire_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          archived?: boolean | null
          created_at?: string | null
          dam_id?: string | null
          dam_name: string
          date_of_birth: string
          id?: string
          name: string
          sire_id?: string | null
          sire_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          archived?: boolean | null
          created_at?: string | null
          dam_id?: string | null
          dam_name?: string
          date_of_birth?: string
          id?: string
          name?: string
          sire_id?: string | null
          sire_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mating_dates: {
        Row: {
          created_at: string
          id: string
          mating_date: string
          planned_litter_id: string
          pregnancy_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mating_date: string
          planned_litter_id: string
          pregnancy_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mating_date?: string
          planned_litter_id?: string
          pregnancy_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mating_dates_planned_litter_id_fkey"
            columns: ["planned_litter_id"]
            isOneToOne: false
            referencedRelation: "planned_litters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mating_dates_pregnancy_id_fkey"
            columns: ["pregnancy_id"]
            isOneToOne: false
            referencedRelation: "pregnancies"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_offers: {
        Row: {
          active: boolean
          created_at: string
          end_date: string
          id: string
          image_url: string
          link: string | null
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          end_date: string
          id?: string
          image_url: string
          link?: string | null
          start_date: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          end_date?: string
          id?: string
          image_url?: string
          link?: string | null
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          token: string
          updated_at: string
          used: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          token: string
          updated_at?: string
          used?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          token?: string
          updated_at?: string
          used?: boolean
          user_id?: string
        }
        Relationships: []
      }
      planned_litters: {
        Row: {
          created_at: string
          expected_heat_date: string
          external_male: boolean | null
          external_male_breed: string | null
          external_male_name: string | null
          external_male_registration: string | null
          female_id: string
          female_name: string
          id: string
          male_id: string | null
          male_name: string | null
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expected_heat_date: string
          external_male?: boolean | null
          external_male_breed?: string | null
          external_male_name?: string | null
          external_male_registration?: string | null
          female_id: string
          female_name: string
          id?: string
          male_id?: string | null
          male_name?: string | null
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expected_heat_date?: string
          external_male?: boolean | null
          external_male_breed?: string | null
          external_male_name?: string | null
          external_male_registration?: string | null
          female_id?: string
          female_name?: string
          id?: string
          male_id?: string | null
          male_name?: string | null
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_planned_litters_female_id"
            columns: ["female_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_planned_litters_male_id"
            columns: ["male_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planned_litters_female_id_fkey"
            columns: ["female_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planned_litters_male_id_fkey"
            columns: ["male_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
        ]
      }
      pregnancies: {
        Row: {
          created_at: string
          expected_due_date: string
          external_male_name: string | null
          female_dog_id: string | null
          id: string
          male_dog_id: string | null
          mating_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expected_due_date: string
          external_male_name?: string | null
          female_dog_id?: string | null
          id?: string
          male_dog_id?: string | null
          mating_date: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expected_due_date?: string
          external_male_name?: string | null
          female_dog_id?: string | null
          id?: string
          male_dog_id?: string | null
          mating_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_pregnancies_female_dog_id"
            columns: ["female_dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pregnancies_male_dog_id"
            columns: ["male_dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pregnancies_female_dog_id_fkey"
            columns: ["female_dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pregnancies_male_dog_id_fkey"
            columns: ["male_dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
        ]
      }
      pregnancy_checklists: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          item_id: string
          pregnancy_id: string
          updated_at: string
          user_id: string
          week_number: number
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          item_id: string
          pregnancy_id: string
          updated_at?: string
          user_id: string
          week_number: number
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          item_id?: string
          pregnancy_id?: string
          updated_at?: string
          user_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "pregnancy_checklists_pregnancy_id_fkey"
            columns: ["pregnancy_id"]
            isOneToOne: false
            referencedRelation: "pregnancies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string | null
          email: string
          first_name: string | null
          friend: boolean | null
          has_paid: boolean | null
          id: string
          kennel_name: string | null
          language: string | null
          last_name: string | null
          newsletter_consent: boolean | null
          phone: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          trial_end_date: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          friend?: boolean | null
          has_paid?: boolean | null
          id: string
          kennel_name?: string | null
          language?: string | null
          last_name?: string | null
          newsletter_consent?: boolean | null
          phone?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          trial_end_date?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          friend?: boolean | null
          has_paid?: boolean | null
          id?: string
          kennel_name?: string | null
          language?: string | null
          last_name?: string | null
          newsletter_consent?: boolean | null
          phone?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          trial_end_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      puppies: {
        Row: {
          birth_date_time: string | null
          birth_weight: number | null
          breed: string | null
          buyer_name: string | null
          buyer_phone: string | null
          collar: string | null
          color: string | null
          created_at: string | null
          current_weight: number | null
          gender: string
          id: string
          image_url: string | null
          litter_id: string
          markings: string | null
          microchip: string | null
          name: string
          new_owner: string | null
          registered_name: string | null
          registration_number: string | null
          reserved: boolean | null
          sold: boolean | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          birth_date_time?: string | null
          birth_weight?: number | null
          breed?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          collar?: string | null
          color?: string | null
          created_at?: string | null
          current_weight?: number | null
          gender: string
          id?: string
          image_url?: string | null
          litter_id: string
          markings?: string | null
          microchip?: string | null
          name: string
          new_owner?: string | null
          registered_name?: string | null
          registration_number?: string | null
          reserved?: boolean | null
          sold?: boolean | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          birth_date_time?: string | null
          birth_weight?: number | null
          breed?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          collar?: string | null
          color?: string | null
          created_at?: string | null
          current_weight?: number | null
          gender?: string
          id?: string
          image_url?: string | null
          litter_id?: string
          markings?: string | null
          microchip?: string | null
          name?: string
          new_owner?: string | null
          registered_name?: string | null
          registration_number?: string | null
          reserved?: boolean | null
          sold?: boolean | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "puppies_litter_id_fkey"
            columns: ["litter_id"]
            isOneToOne: false
            referencedRelation: "litters"
            referencedColumns: ["id"]
          },
        ]
      }
      puppy_height_logs: {
        Row: {
          created_at: string | null
          date: string
          height: number
          id: string
          puppy_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          height: number
          id?: string
          puppy_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          height?: number
          id?: string
          puppy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "puppy_height_logs_puppy_id_fkey"
            columns: ["puppy_id"]
            isOneToOne: false
            referencedRelation: "puppies"
            referencedColumns: ["id"]
          },
        ]
      }
      puppy_notes: {
        Row: {
          content: string
          created_at: string | null
          date: string
          id: string
          puppy_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          date: string
          id?: string
          puppy_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          date?: string
          id?: string
          puppy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "puppy_notes_puppy_id_fkey"
            columns: ["puppy_id"]
            isOneToOne: false
            referencedRelation: "puppies"
            referencedColumns: ["id"]
          },
        ]
      }
      puppy_weight_logs: {
        Row: {
          created_at: string | null
          date: string
          id: string
          puppy_id: string
          weight: number
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          puppy_id: string
          weight: number
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          puppy_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "puppy_weight_logs_puppy_id_fkey"
            columns: ["puppy_id"]
            isOneToOne: false
            referencedRelation: "puppies"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          created_at: string | null
          description: string
          due_date: string
          id: string
          is_completed: boolean | null
          is_deleted: boolean | null
          priority: string
          related_id: string | null
          source: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          due_date: string
          id?: string
          is_completed?: boolean | null
          is_deleted?: boolean | null
          priority: string
          related_id?: string | null
          source?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          due_date?: string
          id?: string
          is_completed?: boolean | null
          is_deleted?: boolean | null
          priority?: string
          related_id?: string | null
          source?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      shared_users: {
        Row: {
          created_at: string | null
          id: string
          owner_id: string
          role: string
          shared_with_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          owner_id: string
          role: string
          shared_with_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          owner_id?: string
          role?: string
          shared_with_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      symptom_logs: {
        Row: {
          created_at: string
          date: string
          description: string
          id: string
          pregnancy_id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          description: string
          id?: string
          pregnancy_id: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string
          id?: string
          pregnancy_id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      temperature_logs: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          pregnancy_id: string
          temperature: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          pregnancy_id: string
          temperature: number
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          pregnancy_id?: string
          temperature?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_dog_dependencies: {
        Args: { dog_id: string }
        Returns: Json
      }
      cleanup_old_system_reminders: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_user: {
        Args: Record<PropertyKey, never>
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
