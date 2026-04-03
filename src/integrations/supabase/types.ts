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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      allocation_escalations: {
        Row: {
          created_at: string
          customer_name: string
          escalated_at: string
          event_date: string | null
          guest_count: number | null
          id: string
          notes: string | null
          order_display_id: string
          order_id: string
          reason: string
          refund_amount: number | null
          refund_type: string | null
          rejected_by: string[] | null
          rejection_reasons: Json | null
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          customer_name: string
          escalated_at?: string
          event_date?: string | null
          guest_count?: number | null
          id?: string
          notes?: string | null
          order_display_id: string
          order_id: string
          reason: string
          refund_amount?: number | null
          refund_type?: string | null
          rejected_by?: string[] | null
          rejection_reasons?: Json | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          escalated_at?: string
          event_date?: string | null
          guest_count?: number | null
          id?: string
          notes?: string | null
          order_display_id?: string
          order_id?: string
          reason?: string
          refund_amount?: number | null
          refund_type?: string | null
          rejected_by?: string[] | null
          rejection_reasons?: Json | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: []
      }
      allocation_logs: {
        Row: {
          allocated_at: string
          auto_attempt: number | null
          customer_name: string
          distance: number | null
          id: string
          mode: string
          order_display_id: string
          order_id: string
          partner_id: string | null
          partner_name: string | null
          rejection_reason: string | null
          status: string
        }
        Insert: {
          allocated_at?: string
          auto_attempt?: number | null
          customer_name: string
          distance?: number | null
          id?: string
          mode: string
          order_display_id: string
          order_id: string
          partner_id?: string | null
          partner_name?: string | null
          rejection_reason?: string | null
          status: string
        }
        Update: {
          allocated_at?: string
          auto_attempt?: number | null
          customer_name?: string
          distance?: number | null
          id?: string
          mode?: string
          order_display_id?: string
          order_id?: string
          partner_id?: string | null
          partner_name?: string | null
          rejection_reason?: string | null
          status?: string
        }
        Relationships: []
      }
      app_config: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      cancellations: {
        Row: {
          cancelled_at: string
          customer_name: string
          id: string
          items: Json | null
          order_id: string
          order_total: number
          partner_acknowledged: boolean
          partner_notified: boolean
          reason: string
          reason_detail: string | null
          refund_status: string
        }
        Insert: {
          cancelled_at?: string
          customer_name: string
          id?: string
          items?: Json | null
          order_id: string
          order_total?: number
          partner_acknowledged?: boolean
          partner_notified?: boolean
          reason: string
          reason_detail?: string | null
          refund_status?: string
        }
        Update: {
          cancelled_at?: string
          customer_name?: string
          id?: string
          items?: Json | null
          order_id?: string
          order_total?: number
          partner_acknowledged?: boolean
          partner_notified?: boolean
          reason?: string
          reason_detail?: string | null
          refund_status?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          sender: string
          sender_name: string
          text: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          sender: string
          sender_name: string
          text: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          sender?: string
          sender_name?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "partner_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      class_bookings: {
        Row: {
          amount: number
          attendance_marked: boolean
          booking_code: string
          category_name: string | null
          certificate_issued: boolean
          class_id: string
          class_name: string
          created_at: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          duration: string | null
          gst: number
          id: string
          instructor_id: string | null
          instructor_name: string | null
          meeting_link: string | null
          mode: string
          notes: string | null
          payment_status: string
          rating: number | null
          review: string | null
          scheduled_date: string
          scheduled_time: string | null
          status: string
          total: number
          updated_at: string
          vertical: string
        }
        Insert: {
          amount?: number
          attendance_marked?: boolean
          booking_code: string
          category_name?: string | null
          certificate_issued?: boolean
          class_id: string
          class_name: string
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          duration?: string | null
          gst?: number
          id?: string
          instructor_id?: string | null
          instructor_name?: string | null
          meeting_link?: string | null
          mode: string
          notes?: string | null
          payment_status?: string
          rating?: number | null
          review?: string | null
          scheduled_date: string
          scheduled_time?: string | null
          status?: string
          total?: number
          updated_at?: string
          vertical: string
        }
        Update: {
          amount?: number
          attendance_marked?: boolean
          booking_code?: string
          category_name?: string | null
          certificate_issued?: boolean
          class_id?: string
          class_name?: string
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          duration?: string | null
          gst?: number
          id?: string
          instructor_id?: string | null
          instructor_name?: string | null
          meeting_link?: string | null
          mode?: string
          notes?: string | null
          payment_status?: string
          rating?: number | null
          review?: string | null
          scheduled_date?: string
          scheduled_time?: string | null
          status?: string
          total?: number
          updated_at?: string
          vertical?: string
        }
        Relationships: []
      }
      combo_items: {
        Row: {
          brand: string | null
          category: string
          created_at: string
          description: string | null
          emoji: string | null
          food_type: string
          id: string
          is_active: boolean
          item_code: string
          mrp: number
          name: string
          packing_charge_flat: number | null
          packing_charge_pct: number | null
          photo_url: string | null
          portion: string | null
          ppp: number
          sub_category: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          brand?: string | null
          category: string
          created_at?: string
          description?: string | null
          emoji?: string | null
          food_type: string
          id?: string
          is_active?: boolean
          item_code: string
          mrp?: number
          name: string
          packing_charge_flat?: number | null
          packing_charge_pct?: number | null
          photo_url?: string | null
          portion?: string | null
          ppp?: number
          sub_category?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          brand?: string | null
          category?: string
          created_at?: string
          description?: string | null
          emoji?: string | null
          food_type?: string
          id?: string
          is_active?: boolean
          item_code?: string
          mrp?: number
          name?: string
          packing_charge_flat?: number | null
          packing_charge_pct?: number | null
          photo_url?: string | null
          portion?: string | null
          ppp?: number
          sub_category?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      cookery_categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          image: string | null
          is_active: boolean
          name: string
          region: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id: string
          image?: string | null
          is_active?: boolean
          name: string
          region?: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          image?: string | null
          is_active?: boolean
          name?: string
          region?: string
        }
        Relationships: []
      }
      cookery_classes: {
        Row: {
          class_mode: string
          created_at: string
          cuisine_id: string
          description: string | null
          dishes: string[] | null
          duration: string | null
          id: string
          image: string | null
          includes: string[] | null
          is_active: boolean
          meal_type: string
          name: string
          popular: boolean | null
          price_in: number
          price_us: number
          rating: number
          recorded_price_in: number | null
          recorded_price_us: number | null
          review_count: number
          updated_at: string
          video_hours: number | null
          video_lessons: number | null
        }
        Insert: {
          class_mode?: string
          created_at?: string
          cuisine_id: string
          description?: string | null
          dishes?: string[] | null
          duration?: string | null
          id: string
          image?: string | null
          includes?: string[] | null
          is_active?: boolean
          meal_type: string
          name: string
          popular?: boolean | null
          price_in?: number
          price_us?: number
          rating?: number
          recorded_price_in?: number | null
          recorded_price_us?: number | null
          review_count?: number
          updated_at?: string
          video_hours?: number | null
          video_lessons?: number | null
        }
        Update: {
          class_mode?: string
          created_at?: string
          cuisine_id?: string
          description?: string | null
          dishes?: string[] | null
          duration?: string | null
          id?: string
          image?: string | null
          includes?: string[] | null
          is_active?: boolean
          meal_type?: string
          name?: string
          popular?: boolean | null
          price_in?: number
          price_us?: number
          rating?: number
          recorded_price_in?: number | null
          recorded_price_us?: number | null
          review_count?: number
          updated_at?: string
          video_hours?: number | null
          video_lessons?: number | null
        }
        Relationships: []
      }
      customer_feedback: {
        Row: {
          comment: string | null
          created_at: string
          customer_name: string
          customer_phone: string
          delivered_at: string | null
          event_date: string | null
          feedback_eligible_at: string | null
          guest_count: number | null
          id: string
          message_template: string | null
          occasion: string | null
          order_display_id: string
          order_id: string
          partner_name: string | null
          rating: number | null
          responded_at: string | null
          sent_by: string | null
          status: string
          whatsapp_sent_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_name: string
          customer_phone: string
          delivered_at?: string | null
          event_date?: string | null
          feedback_eligible_at?: string | null
          guest_count?: number | null
          id?: string
          message_template?: string | null
          occasion?: string | null
          order_display_id: string
          order_id: string
          partner_name?: string | null
          rating?: number | null
          responded_at?: string | null
          sent_by?: string | null
          status?: string
          whatsapp_sent_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_name?: string
          customer_phone?: string
          delivered_at?: string | null
          event_date?: string | null
          feedback_eligible_at?: string | null
          guest_count?: number | null
          id?: string
          message_template?: string | null
          occasion?: string | null
          order_display_id?: string
          order_id?: string
          partner_name?: string | null
          rating?: number | null
          responded_at?: string | null
          sent_by?: string | null
          status?: string
          whatsapp_sent_at?: string | null
        }
        Relationships: []
      }
      customer_referrals: {
        Row: {
          created_at: string
          friend_name: string
          friend_phone: string
          id: string
          invited_at: string
          reward_credited: boolean
          spin_amount: number | null
          spin_done: boolean
          status: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          friend_name?: string
          friend_phone?: string
          id?: string
          invited_at?: string
          reward_credited?: boolean
          spin_amount?: number | null
          spin_done?: boolean
          status?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          friend_name?: string
          friend_phone?: string
          id?: string
          invited_at?: string
          reward_credited?: boolean
          spin_amount?: number | null
          spin_done?: boolean
          status?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      delay_complaints: {
        Row: {
          customer_name: string
          customer_phone: string | null
          id: string
          kitchen_name: string | null
          notes: string | null
          order_id: string
          partner_acknowledged: boolean
          partner_name: string | null
          partner_notified: boolean
          reported_at: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          customer_name: string
          customer_phone?: string | null
          id?: string
          kitchen_name?: string | null
          notes?: string | null
          order_id: string
          partner_acknowledged?: boolean
          partner_name?: string | null
          partner_notified?: boolean
          reported_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          customer_name?: string
          customer_phone?: string | null
          id?: string
          kitchen_name?: string | null
          notes?: string | null
          order_id?: string
          partner_acknowledged?: boolean
          partner_name?: string | null
          partner_notified?: boolean
          reported_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: []
      }
      delivery_tracking: {
        Row: {
          actual_delivery: string | null
          agent_name: string | null
          agent_phone: string | null
          created_at: string
          delivery_partner: string
          estimated_arrival: string | null
          id: string
          notes: string | null
          order_id: string
          status: string
          tracking_id: string | null
          updated_at: string
        }
        Insert: {
          actual_delivery?: string | null
          agent_name?: string | null
          agent_phone?: string | null
          created_at?: string
          delivery_partner: string
          estimated_arrival?: string | null
          id?: string
          notes?: string | null
          order_id: string
          status?: string
          tracking_id?: string | null
          updated_at?: string
        }
        Update: {
          actual_delivery?: string | null
          agent_name?: string | null
          agent_phone?: string | null
          created_at?: string
          delivery_partner?: string
          estimated_arrival?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          status?: string
          tracking_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      incomplete_orders: {
        Row: {
          address: string | null
          cart_snapshot: Json | null
          created_at: string
          customer_id: string | null
          customer_name: string
          customer_phone: string
          delivery_type: string | null
          id: string
          payment_method: string | null
          payment_status: string
          region: string | null
          selected_slot: string | null
          total_amount: number
          type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          cart_snapshot?: Json | null
          created_at?: string
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          delivery_type?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string
          region?: string | null
          selected_slot?: string | null
          total_amount?: number
          type: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          cart_snapshot?: Json | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_type?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string
          region?: string | null
          selected_slot?: string | null
          total_amount?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      instant_menu_items: {
        Row: {
          add_ons: Json | null
          allergens: string[] | null
          category: string
          created_at: string
          description: string | null
          id: string
          image: string | null
          ingredients: string[] | null
          is_active: boolean
          is_bestseller: boolean
          is_toggled_on: boolean
          is_veg: boolean
          kitchen_id: string
          major_vegetables: string[] | null
          name: string
          nutrition_info: Json | null
          ppp: number
          preparation_time: string | null
          price: number
          serving_size: string | null
          spice_level: string
          updated_at: string
        }
        Insert: {
          add_ons?: Json | null
          allergens?: string[] | null
          category: string
          created_at?: string
          description?: string | null
          id: string
          image?: string | null
          ingredients?: string[] | null
          is_active?: boolean
          is_bestseller?: boolean
          is_toggled_on?: boolean
          is_veg?: boolean
          kitchen_id: string
          major_vegetables?: string[] | null
          name: string
          nutrition_info?: Json | null
          ppp?: number
          preparation_time?: string | null
          price?: number
          serving_size?: string | null
          spice_level?: string
          updated_at?: string
        }
        Update: {
          add_ons?: Json | null
          allergens?: string[] | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          ingredients?: string[] | null
          is_active?: boolean
          is_bestseller?: boolean
          is_toggled_on?: boolean
          is_veg?: boolean
          kitchen_id?: string
          major_vegetables?: string[] | null
          name?: string
          nutrition_info?: Json | null
          ppp?: number
          preparation_time?: string | null
          price?: number
          serving_size?: string | null
          spice_level?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "instant_menu_items_kitchen_id_fkey"
            columns: ["kitchen_id"]
            isOneToOne: false
            referencedRelation: "kitchen_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      instant_orders: {
        Row: {
          accepted_at: string | null
          allergens: string[] | null
          cooking_instructions: string | null
          created_at: string
          customer_address: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string
          delivered_at: string | null
          delivery_fee: number
          delivery_slot: string | null
          delivery_type: string
          discount: number
          id: string
          items: Json
          kitchen_id: string | null
          kitchen_name: string | null
          note: string | null
          order_code: string
          order_type: string
          partner_id: string | null
          payment_method: string | null
          payment_status: string
          picked_up_at: string | null
          platform_fee: number
          ready_at: string | null
          rejected_at: string | null
          rejection_reason: string | null
          status: string
          subtotal: number
          tax: number
          total: number
          updated_at: string
          wallet_used: number
        }
        Insert: {
          accepted_at?: string | null
          allergens?: string[] | null
          cooking_instructions?: string | null
          created_at?: string
          customer_address?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          delivered_at?: string | null
          delivery_fee?: number
          delivery_slot?: string | null
          delivery_type?: string
          discount?: number
          id?: string
          items?: Json
          kitchen_id?: string | null
          kitchen_name?: string | null
          note?: string | null
          order_code: string
          order_type?: string
          partner_id?: string | null
          payment_method?: string | null
          payment_status?: string
          picked_up_at?: string | null
          platform_fee?: number
          ready_at?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          wallet_used?: number
        }
        Update: {
          accepted_at?: string | null
          allergens?: string[] | null
          cooking_instructions?: string | null
          created_at?: string
          customer_address?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          delivered_at?: string | null
          delivery_fee?: number
          delivery_slot?: string | null
          delivery_type?: string
          discount?: number
          id?: string
          items?: Json
          kitchen_id?: string | null
          kitchen_name?: string | null
          note?: string | null
          order_code?: string
          order_type?: string
          partner_id?: string | null
          payment_method?: string | null
          payment_status?: string
          picked_up_at?: string | null
          platform_fee?: number
          ready_at?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          wallet_used?: number
        }
        Relationships: []
      }
      invoices: {
        Row: {
          company_snapshot: Json
          created_at: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          delivery_fee: number
          discount: number
          generated_at: string
          gstin: string | null
          id: string
          invoice_number: string
          items_snapshot: Json
          order_id: string
          order_type: string
          packing_charges: number
          platform_fee: number
          status: string
          subtotal: number
          tax_amount: number
          tax_rate: string | null
          total: number
        }
        Insert: {
          company_snapshot?: Json
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          delivery_fee?: number
          discount?: number
          generated_at?: string
          gstin?: string | null
          id?: string
          invoice_number: string
          items_snapshot?: Json
          order_id: string
          order_type?: string
          packing_charges?: number
          platform_fee?: number
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: string | null
          total?: number
        }
        Update: {
          company_snapshot?: Json
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          delivery_fee?: number
          discount?: number
          generated_at?: string
          gstin?: string | null
          id?: string
          invoice_number?: string
          items_snapshot?: Json
          order_id?: string
          order_type?: string
          packing_charges?: number
          platform_fee?: number
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: string | null
          total?: number
        }
        Relationships: []
      }
      kitchen_categories: {
        Row: {
          created_at: string
          display_order: number
          icon: string | null
          id: string
          is_active: boolean
          kitchen_id: string
          name: string
          sub_category: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          kitchen_id: string
          name: string
          sub_category?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          kitchen_id?: string
          name?: string
          sub_category?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kitchen_categories_kitchen_id_fkey"
            columns: ["kitchen_id"]
            isOneToOne: false
            referencedRelation: "kitchen_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      kitchen_partner_locations: {
        Row: {
          attendance_slot: string | null
          created_at: string
          id: string
          is_active: boolean
          is_attendance_marked: boolean
          kitchen_id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          partner_name: string
          partner_phone: string | null
          pincode: string
          updated_at: string
        }
        Insert: {
          attendance_slot?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_attendance_marked?: boolean
          kitchen_id: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          partner_name: string
          partner_phone?: string | null
          pincode: string
          updated_at?: string
        }
        Update: {
          attendance_slot?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_attendance_marked?: boolean
          kitchen_id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          partner_name?: string
          partner_phone?: string | null
          pincode?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_kitchen"
            columns: ["kitchen_id"]
            isOneToOne: false
            referencedRelation: "kitchen_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      kitchen_partners: {
        Row: {
          attendance_slot: string | null
          created_at: string
          cuisine: string[]
          delivery_time: string | null
          food_preference: string
          id: string
          image: string | null
          is_active: boolean
          is_attendance_marked: boolean
          is_branded: boolean
          is_veg: boolean
          latitude: number | null
          location: string | null
          longitude: number | null
          min_order: number
          name: string
          partner_id: string
          pincode: string | null
          rating: number
          review_count: number
          updated_at: string
        }
        Insert: {
          attendance_slot?: string | null
          created_at?: string
          cuisine?: string[]
          delivery_time?: string | null
          food_preference?: string
          id: string
          image?: string | null
          is_active?: boolean
          is_attendance_marked?: boolean
          is_branded?: boolean
          is_veg?: boolean
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          min_order?: number
          name: string
          partner_id: string
          pincode?: string | null
          rating?: number
          review_count?: number
          updated_at?: string
        }
        Update: {
          attendance_slot?: string | null
          created_at?: string
          cuisine?: string[]
          delivery_time?: string | null
          food_preference?: string
          id?: string
          image?: string | null
          is_active?: boolean
          is_attendance_marked?: boolean
          is_branded?: boolean
          is_veg?: boolean
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          min_order?: number
          name?: string
          partner_id?: string
          pincode?: string | null
          rating?: number
          review_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      ledger_entries: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          approved_by_role: string | null
          created_at: string
          customer_id: string | null
          customer_name: string | null
          entry_type: string
          id: string
          linked_entry_id: string | null
          notes: string | null
          order_id: string | null
          partner_id: string | null
          partner_name: string | null
          raised_by: string
          raised_by_role: string
          reason_code: string
          reason_label: string
          severity: string | null
          status: string
          sub_vertical: string | null
        }
        Insert: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          approved_by_role?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          entry_type: string
          id?: string
          linked_entry_id?: string | null
          notes?: string | null
          order_id?: string | null
          partner_id?: string | null
          partner_name?: string | null
          raised_by: string
          raised_by_role: string
          reason_code: string
          reason_label: string
          severity?: string | null
          status?: string
          sub_vertical?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          approved_by_role?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          entry_type?: string
          id?: string
          linked_entry_id?: string | null
          notes?: string | null
          order_id?: string | null
          partner_id?: string | null
          partner_name?: string | null
          raised_by?: string
          raised_by_role?: string
          reason_code?: string
          reason_label?: string
          severity?: string | null
          status?: string
          sub_vertical?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_linked_entry_id_fkey"
            columns: ["linked_entry_id"]
            isOneToOne: false
            referencedRelation: "ledger_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          brand: string | null
          category: string
          created_at: string
          cuisine: string
          description: string | null
          id: string
          image: string | null
          is_active: boolean
          is_veg: boolean
          item_code: string
          major_vegetables: string[] | null
          name: string
          packing_charge_flat: number | null
          packing_charge_pct: number | null
          state_prices: Json | null
          updated_at: string
          video_url: string | null
          volume: string | null
        }
        Insert: {
          brand?: string | null
          category: string
          created_at?: string
          cuisine: string
          description?: string | null
          id?: string
          image?: string | null
          is_active?: boolean
          is_veg?: boolean
          item_code: string
          major_vegetables?: string[] | null
          name: string
          packing_charge_flat?: number | null
          packing_charge_pct?: number | null
          state_prices?: Json | null
          updated_at?: string
          video_url?: string | null
          volume?: string | null
        }
        Update: {
          brand?: string | null
          category?: string
          created_at?: string
          cuisine?: string
          description?: string | null
          id?: string
          image?: string | null
          is_active?: boolean
          is_veg?: boolean
          item_code?: string
          major_vegetables?: string[] | null
          name?: string
          packing_charge_flat?: number | null
          packing_charge_pct?: number | null
          state_prices?: Json | null
          updated_at?: string
          video_url?: string | null
          volume?: string | null
        }
        Relationships: []
      }
      order_modifications: {
        Row: {
          customer_name: string
          customer_phone: string | null
          description: string
          id: string
          kitchen_name: string | null
          modification_type: string
          notes: string | null
          order_id: string
          partner_name: string | null
          requested_at: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          customer_name: string
          customer_phone?: string | null
          description: string
          id?: string
          kitchen_name?: string | null
          modification_type: string
          notes?: string | null
          order_id: string
          partner_name?: string | null
          requested_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          customer_name?: string
          customer_phone?: string | null
          description?: string
          id?: string
          kitchen_name?: string | null
          modification_type?: string
          notes?: string | null
          order_id?: string
          partner_name?: string | null
          requested_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: []
      }
      partner_chats: {
        Row: {
          admin_email: string
          admin_name: string
          admin_role: string | null
          created_at: string
          id: string
          last_activity: string
          partner_name: string
          partner_rmn: string
          status: string
        }
        Insert: {
          admin_email: string
          admin_name: string
          admin_role?: string | null
          created_at?: string
          id?: string
          last_activity?: string
          partner_name: string
          partner_rmn: string
          status?: string
        }
        Update: {
          admin_email?: string
          admin_name?: string
          admin_role?: string | null
          created_at?: string
          id?: string
          last_activity?: string
          partner_name?: string
          partner_rmn?: string
          status?: string
        }
        Relationships: []
      }
      party_combo_configs: {
        Row: {
          base_price_per_head: number
          created_at: string
          description: string | null
          food_types: string[] | null
          icon: string | null
          id: string
          is_active: boolean
          label: string
          max_pax: number
          min_pax: number
          name: string
        }
        Insert: {
          base_price_per_head?: number
          created_at?: string
          description?: string | null
          food_types?: string[] | null
          icon?: string | null
          id: string
          is_active?: boolean
          label: string
          max_pax?: number
          min_pax?: number
          name: string
        }
        Update: {
          base_price_per_head?: number
          created_at?: string
          description?: string | null
          food_types?: string[] | null
          icon?: string | null
          id?: string
          is_active?: boolean
          label?: string
          max_pax?: number
          min_pax?: number
          name?: string
        }
        Relationships: []
      }
      party_leads: {
        Row: {
          created_at: string
          id: string
          last_visit: string
          location: string
          name: string
          phone: string
          saved_order: Json | null
          source: string
          status: string
          updated_at: string
          visits: number
        }
        Insert: {
          created_at?: string
          id?: string
          last_visit?: string
          location?: string
          name: string
          phone: string
          saved_order?: Json | null
          source?: string
          status?: string
          updated_at?: string
          visits?: number
        }
        Update: {
          created_at?: string
          id?: string
          last_visit?: string
          location?: string
          name?: string
          phone?: string
          saved_order?: Json | null
          source?: string
          status?: string
          updated_at?: string
          visits?: number
        }
        Relationships: []
      }
      party_menu_items: {
        Row: {
          category: string
          created_at: string
          cuisine: string | null
          food_type: string
          id: string
          is_active: boolean
          item_code: string
          mrp: number
          name: string
          portion_size: number | null
          portion_unit: string | null
          ppp: number
          region: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          cuisine?: string | null
          food_type: string
          id?: string
          is_active?: boolean
          item_code: string
          mrp?: number
          name: string
          portion_size?: number | null
          portion_unit?: string | null
          ppp?: number
          region: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          cuisine?: string | null
          food_type?: string
          id?: string
          is_active?: boolean
          item_code?: string
          mrp?: number
          name?: string
          portion_size?: number | null
          portion_unit?: string | null
          ppp?: number
          region?: string
          updated_at?: string
        }
        Relationships: []
      }
      party_orders: {
        Row: {
          allocated_at: string | null
          allocated_partner_id: string | null
          cooking_instructions: string | null
          created_at: string
          customer_address: string | null
          customer_id: string | null
          customer_lat: number | null
          customer_lng: number | null
          customer_name: string
          customer_phone: string
          event_date: string
          event_time: string | null
          food_type: string
          guest_count: number
          id: string
          meals: string[] | null
          occasion: string | null
          order_id: string
          selected_items: string[] | null
          service_type: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          allocated_at?: string | null
          allocated_partner_id?: string | null
          cooking_instructions?: string | null
          created_at?: string
          customer_address?: string | null
          customer_id?: string | null
          customer_lat?: number | null
          customer_lng?: number | null
          customer_name: string
          customer_phone: string
          event_date: string
          event_time?: string | null
          food_type: string
          guest_count: number
          id?: string
          meals?: string[] | null
          occasion?: string | null
          order_id: string
          selected_items?: string[] | null
          service_type?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          allocated_at?: string | null
          allocated_partner_id?: string | null
          cooking_instructions?: string | null
          created_at?: string
          customer_address?: string | null
          customer_id?: string | null
          customer_lat?: number | null
          customer_lng?: number | null
          customer_name?: string
          customer_phone?: string
          event_date?: string
          event_time?: string | null
          food_type?: string
          guest_count?: number
          id?: string
          meals?: string[] | null
          occasion?: string | null
          order_id?: string
          selected_items?: string[] | null
          service_type?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: Json | null
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          preferences: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: Json | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          preferences?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: Json | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          preferences?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          banner_text: string | null
          created_at: string
          discount_type: string | null
          discount_value: number | null
          display_order: number | null
          end_date: string | null
          id: string
          is_active: boolean
          max_discount_amount: number | null
          min_order_amount: number | null
          offer_tag: string | null
          offer_text: string
          promo_code: string | null
          show_in_banner: boolean | null
          start_date: string | null
          target_screen: string | null
          title: string
          updated_at: string
          usage_count: number | null
          usage_limit: number | null
          vertical: string
        }
        Insert: {
          banner_text?: string | null
          created_at?: string
          discount_type?: string | null
          discount_value?: number | null
          display_order?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          min_order_amount?: number | null
          offer_tag?: string | null
          offer_text?: string
          promo_code?: string | null
          show_in_banner?: boolean | null
          start_date?: string | null
          target_screen?: string | null
          title: string
          updated_at?: string
          usage_count?: number | null
          usage_limit?: number | null
          vertical: string
        }
        Update: {
          banner_text?: string | null
          created_at?: string
          discount_type?: string | null
          discount_value?: number | null
          display_order?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          min_order_amount?: number | null
          offer_tag?: string | null
          offer_text?: string
          promo_code?: string | null
          show_in_banner?: boolean | null
          start_date?: string | null
          target_screen?: string | null
          title?: string
          updated_at?: string
          usage_count?: number | null
          usage_limit?: number | null
          vertical?: string
        }
        Relationships: []
      }
      screen_content: {
        Row: {
          content_key: string
          content_type: string
          content_value: string
          created_at: string
          description: string | null
          id: string
          screen_key: string
          updated_at: string
        }
        Insert: {
          content_key: string
          content_type?: string
          content_value?: string
          created_at?: string
          description?: string | null
          id?: string
          screen_key: string
          updated_at?: string
        }
        Update: {
          content_key?: string
          content_type?: string
          content_value?: string
          created_at?: string
          description?: string | null
          id?: string
          screen_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_bookings: {
        Row: {
          address: string | null
          amount: number
          booking_code: string
          category_name: string | null
          created_at: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          duration: string | null
          gst: number
          id: string
          notes: string | null
          payment_status: string
          provider_id: string | null
          provider_name: string | null
          rating: number | null
          review: string | null
          scheduled_date: string
          scheduled_time: string | null
          service_id: string | null
          service_name: string
          status: string
          total: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          amount?: number
          booking_code: string
          category_name?: string | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          duration?: string | null
          gst?: number
          id?: string
          notes?: string | null
          payment_status?: string
          provider_id?: string | null
          provider_name?: string | null
          rating?: number | null
          review?: string | null
          scheduled_date: string
          scheduled_time?: string | null
          service_id?: string | null
          service_name: string
          status?: string
          total?: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          amount?: number
          booking_code?: string
          category_name?: string | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          duration?: string | null
          gst?: number
          id?: string
          notes?: string | null
          payment_status?: string
          provider_id?: string | null
          provider_name?: string | null
          rating?: number | null
          review?: string | null
          scheduled_date?: string
          scheduled_time?: string | null
          service_id?: string | null
          service_name?: string
          status?: string
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          image: string | null
          is_active: boolean
          name: string
          service_count: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id: string
          image?: string | null
          is_active?: boolean
          name: string
          service_count?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image?: string | null
          is_active?: boolean
          name?: string
          service_count?: number
        }
        Relationships: []
      }
      service_items: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          duration: string | null
          id: string
          image: string | null
          includes: string[] | null
          is_active: boolean
          name: string
          popular: boolean | null
          price_in: number
          price_us: number
          rating: number
          review_count: number
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id: string
          image?: string | null
          includes?: string[] | null
          is_active?: boolean
          name: string
          popular?: boolean | null
          price_in?: number
          price_us?: number
          rating?: number
          review_count?: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          image?: string | null
          includes?: string[] | null
          is_active?: boolean
          name?: string
          popular?: boolean | null
          price_in?: number
          price_us?: number
          rating?: number
          review_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      service_providers: {
        Row: {
          avatar: string | null
          category_ids: string[] | null
          created_at: string
          experience: string | null
          id: string
          is_active: boolean
          jobs: number
          name: string
          rating: number
          skills: string[] | null
          verified: boolean | null
        }
        Insert: {
          avatar?: string | null
          category_ids?: string[] | null
          created_at?: string
          experience?: string | null
          id: string
          is_active?: boolean
          jobs?: number
          name: string
          rating?: number
          skills?: string[] | null
          verified?: boolean | null
        }
        Update: {
          avatar?: string | null
          category_ids?: string[] | null
          created_at?: string
          experience?: string | null
          id?: string
          is_active?: boolean
          jobs?: number
          name?: string
          rating?: number
          skills?: string[] | null
          verified?: boolean | null
        }
        Relationships: []
      }
      services: {
        Row: {
          category: string
          created_at: string
          description: string | null
          duration: string | null
          id: string
          image: string | null
          is_active: boolean
          name: string
          price: number
          service_code: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          image?: string | null
          is_active?: boolean
          name: string
          price?: number
          service_code: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          image?: string | null
          is_active?: boolean
          name?: string
          price?: number
          service_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      shero_classes: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          duration: string | null
          highlights: string[] | null
          id: string
          image: string | null
          instructor: string | null
          instructor_image: string | null
          is_active: boolean
          live_price_in: number
          live_price_us: number
          mode: string
          name: string
          popular: boolean | null
          rating: number
          review_count: number
          self_learning_price_in: number
          self_learning_price_us: number
          updated_at: string
          video_hours: string | null
          video_lessons: number | null
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          duration?: string | null
          highlights?: string[] | null
          id: string
          image?: string | null
          instructor?: string | null
          instructor_image?: string | null
          is_active?: boolean
          live_price_in?: number
          live_price_us?: number
          mode?: string
          name: string
          popular?: boolean | null
          rating?: number
          review_count?: number
          self_learning_price_in?: number
          self_learning_price_us?: number
          updated_at?: string
          video_hours?: string | null
          video_lessons?: number | null
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          duration?: string | null
          highlights?: string[] | null
          id?: string
          image?: string | null
          instructor?: string | null
          instructor_image?: string | null
          is_active?: boolean
          live_price_in?: number
          live_price_us?: number
          mode?: string
          name?: string
          popular?: boolean | null
          rating?: number
          review_count?: number
          self_learning_price_in?: number
          self_learning_price_us?: number
          updated_at?: string
          video_hours?: string | null
          video_lessons?: number | null
        }
        Relationships: []
      }
      snack_orders: {
        Row: {
          city: string | null
          created_at: string
          customer_id: string | null
          customer_name: string
          customer_phone: string
          delivery_charge: number
          discount: number
          estimated_delivery: string | null
          gst: number
          id: string
          items: Json
          order_code: string
          packing_charge: number
          partner_id: string | null
          partner_name: string | null
          payment_method: string | null
          payment_status: string
          pincode: string | null
          shipping_address: string | null
          status: string
          subtotal: number
          total: number
          tracking_id: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          delivery_charge?: number
          discount?: number
          estimated_delivery?: string | null
          gst?: number
          id?: string
          items?: Json
          order_code: string
          packing_charge?: number
          partner_id?: string | null
          partner_name?: string | null
          payment_method?: string | null
          payment_status?: string
          pincode?: string | null
          shipping_address?: string | null
          status?: string
          subtotal?: number
          total?: number
          tracking_id?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_charge?: number
          discount?: number
          estimated_delivery?: string | null
          gst?: number
          id?: string
          items?: Json
          order_code?: string
          packing_charge?: number
          partner_id?: string | null
          partner_name?: string | null
          payment_method?: string | null
          payment_status?: string
          pincode?: string | null
          shipping_address?: string | null
          status?: string
          subtotal?: number
          total?: number
          tracking_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      snack_products: {
        Row: {
          badges: string[] | null
          category: string
          city_tag: string | null
          created_at: string
          description: string | null
          id: string
          image: string | null
          ingredients: string | null
          is_active: boolean
          is_bestseller: boolean | null
          is_new_launch: boolean | null
          made_in: string | null
          name: string
          pack_sizes: Json | null
          product_code: string
          rating: number | null
          region_tag: string | null
          review_count: number | null
          shelf_life: string | null
          updated_at: string
          weight_info: string | null
        }
        Insert: {
          badges?: string[] | null
          category: string
          city_tag?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          ingredients?: string | null
          is_active?: boolean
          is_bestseller?: boolean | null
          is_new_launch?: boolean | null
          made_in?: string | null
          name: string
          pack_sizes?: Json | null
          product_code: string
          rating?: number | null
          region_tag?: string | null
          review_count?: number | null
          shelf_life?: string | null
          updated_at?: string
          weight_info?: string | null
        }
        Update: {
          badges?: string[] | null
          category?: string
          city_tag?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          ingredients?: string | null
          is_active?: boolean
          is_bestseller?: boolean | null
          is_new_launch?: boolean | null
          made_in?: string | null
          name?: string
          pack_sizes?: Json | null
          product_code?: string
          rating?: number | null
          region_tag?: string | null
          review_count?: number | null
          shelf_life?: string | null
          updated_at?: string
          weight_info?: string | null
        }
        Relationships: []
      }
      stock_alerts: {
        Row: {
          id: string
          item_name: string
          kitchen_name: string | null
          notes: string | null
          order_id: string
          partner_id: string
          partner_name: string
          reason: string
          reported_at: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          suggested_alternative: string | null
        }
        Insert: {
          id?: string
          item_name: string
          kitchen_name?: string | null
          notes?: string | null
          order_id: string
          partner_id: string
          partner_name: string
          reason: string
          reported_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          suggested_alternative?: string | null
        }
        Update: {
          id?: string
          item_name?: string
          kitchen_name?: string | null
          notes?: string | null
          order_id?: string
          partner_id?: string
          partner_name?: string
          reason?: string
          reported_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          suggested_alternative?: string | null
        }
        Relationships: []
      }
      subscription_customers: {
        Row: {
          address: string | null
          cancel_reason: string | null
          created_at: string
          customer_id: string | null
          duration: string
          email: string | null
          end_date: string
          id: string
          is_custom_plan: boolean
          mobile: string
          name: string
          partner_id: string | null
          partner_name: string | null
          pause_reason: string | null
          persons: number
          plan_id: string | null
          plan_name: string
          price_per_session: number | null
          skipped_sessions: Json | null
          slots: string[] | null
          start_date: string
          status: string
          total_paid: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          cancel_reason?: string | null
          created_at?: string
          customer_id?: string | null
          duration?: string
          email?: string | null
          end_date: string
          id: string
          is_custom_plan?: boolean
          mobile: string
          name: string
          partner_id?: string | null
          partner_name?: string | null
          pause_reason?: string | null
          persons?: number
          plan_id?: string | null
          plan_name: string
          price_per_session?: number | null
          skipped_sessions?: Json | null
          slots?: string[] | null
          start_date: string
          status?: string
          total_paid?: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          cancel_reason?: string | null
          created_at?: string
          customer_id?: string | null
          duration?: string
          email?: string | null
          end_date?: string
          id?: string
          is_custom_plan?: boolean
          mobile?: string
          name?: string
          partner_id?: string | null
          partner_name?: string | null
          pause_reason?: string | null
          persons?: number
          plan_id?: string | null
          plan_name?: string
          price_per_session?: number | null
          skipped_sessions?: Json | null
          slots?: string[] | null
          start_date?: string
          status?: string
          total_paid?: number
          updated_at?: string
        }
        Relationships: []
      }
      subscription_leads: {
        Row: {
          created_at: string
          id: string
          location: string
          name: string
          phone: string
          saved_plan: string | null
          source: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string
          name: string
          phone: string
          saved_plan?: string | null
          source?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string
          name?: string
          phone?: string
          saved_plan?: string | null
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscription_meal_plans: {
        Row: {
          created_at: string
          cuisine: string
          description: string | null
          emoji: string | null
          highlights: string[] | null
          id: string
          image: string | null
          is_active: boolean
          is_veg: boolean
          name: string
          price_per_day: number
          rating: number | null
          slots: string[]
          subscribers: number | null
          updated_at: string
          weekly_menu: Json | null
        }
        Insert: {
          created_at?: string
          cuisine: string
          description?: string | null
          emoji?: string | null
          highlights?: string[] | null
          id: string
          image?: string | null
          is_active?: boolean
          is_veg?: boolean
          name: string
          price_per_day?: number
          rating?: number | null
          slots?: string[]
          subscribers?: number | null
          updated_at?: string
          weekly_menu?: Json | null
        }
        Update: {
          created_at?: string
          cuisine?: string
          description?: string | null
          emoji?: string | null
          highlights?: string[] | null
          id?: string
          image?: string | null
          is_active?: boolean
          is_veg?: boolean
          name?: string
          price_per_day?: number
          rating?: number | null
          slots?: string[]
          subscribers?: number | null
          updated_at?: string
          weekly_menu?: Json | null
        }
        Relationships: []
      }
      subscription_menu_items: {
        Row: {
          category: string
          created_at: string
          cuisine: string
          id: string
          image: string | null
          is_active: boolean
          is_veg: boolean
          name: string
          price_per_serving: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          cuisine: string
          id: string
          image?: string | null
          is_active?: boolean
          is_veg?: boolean
          name: string
          price_per_serving?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          cuisine?: string
          id?: string
          image?: string | null
          is_active?: boolean
          is_veg?: boolean
          name?: string
          price_per_serving?: number
          updated_at?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          duration_days: number
          features: Json | null
          id: string
          is_active: boolean
          meal_slots: Json | null
          name: string
          plan_code: string
          price: number
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_days?: number
          features?: Json | null
          id?: string
          is_active?: boolean
          meal_slots?: Json | null
          name: string
          plan_code: string
          price?: number
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_days?: number
          features?: Json | null
          id?: string
          is_active?: boolean
          meal_slots?: Json | null
          name?: string
          plan_code?: string
          price?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_carts: {
        Row: {
          id: string
          items: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          items?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          items?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_wallets: {
        Row: {
          balance: number
          id: string
          order_count: number
          referral_code: string | null
          total_referral_earnings: number
          transactions: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          id?: string
          order_count?: number
          referral_code?: string | null
          total_referral_earnings?: number
          transactions?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          id?: string
          order_count?: number
          referral_code?: string | null
          total_referral_earnings?: number
          transactions?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wallet_expiry_notifications: {
        Row: {
          id: string
          message: string
          notification_type: string
          read_at: string | null
          sent_at: string
          transaction_id: string
          user_id: string
        }
        Insert: {
          id?: string
          message?: string
          notification_type: string
          read_at?: string | null
          sent_at?: string
          transaction_id: string
          user_id: string
        }
        Update: {
          id?: string
          message?: string
          notification_type?: string
          read_at?: string | null
          sent_at?: string
          transaction_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_expiry_notifications_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "wallet_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          expired: boolean
          expires_at: string | null
          id: string
          referrer_code: string | null
          remaining_amount: number
          type: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string
          expired?: boolean
          expires_at?: string | null
          id?: string
          referrer_code?: string | null
          remaining_amount?: number
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          expired?: boolean
          expires_at?: string | null
          id?: string
          referrer_code?: string | null
          remaining_amount?: number
          type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "customer"
        | "partner"
        | "super_admin"
        | "country_manager"
        | "vertical_head"
        | "regional_manager"
        | "ops_manager"
        | "onboarding_manager"
        | "kobtl"
        | "kob_executive"
        | "sap_onboarding_tl"
        | "shf_manager"
        | "hcf_manager"
        | "spc_manager"
        | "spc_tl"
        | "ssc_manager"
        | "ssc_tl"
        | "ssc_executor"
        | "finance_manager"
        | "ppp_tl"
        | "ppp_executor"
        | "party_manager"
        | "party_tl"
        | "party_executive"
        | "hr_manager"
        | "asst_manager"
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
      app_role: [
        "customer",
        "partner",
        "super_admin",
        "country_manager",
        "vertical_head",
        "regional_manager",
        "ops_manager",
        "onboarding_manager",
        "kobtl",
        "kob_executive",
        "sap_onboarding_tl",
        "shf_manager",
        "hcf_manager",
        "spc_manager",
        "spc_tl",
        "ssc_manager",
        "ssc_tl",
        "ssc_executor",
        "finance_manager",
        "ppp_tl",
        "ppp_executor",
        "party_manager",
        "party_tl",
        "party_executive",
        "hr_manager",
        "asst_manager",
      ],
    },
  },
} as const
