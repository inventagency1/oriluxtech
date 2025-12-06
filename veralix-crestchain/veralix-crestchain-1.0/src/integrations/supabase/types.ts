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
      airdrop_claims: {
        Row: {
          airdrop_id: string
          claimed_at: string
          id: string
          token_amount: number
          transaction_hash: string | null
          user_id: string
        }
        Insert: {
          airdrop_id: string
          claimed_at?: string
          id?: string
          token_amount: number
          transaction_hash?: string | null
          user_id: string
        }
        Update: {
          airdrop_id?: string
          claimed_at?: string
          id?: string
          token_amount?: number
          transaction_hash?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "airdrop_claims_airdrop_id_fkey"
            columns: ["airdrop_id"]
            isOneToOne: false
            referencedRelation: "airdrops"
            referencedColumns: ["id"]
          },
        ]
      }
      airdrops: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          distributed_count: number
          eligibility_criteria: Json | null
          end_date: string | null
          frequency_hours: number | null
          id: string
          last_distribution_at: string | null
          start_date: string | null
          status: string
          title: string
          token_amount: number
          total_recipients: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          distributed_count?: number
          eligibility_criteria?: Json | null
          end_date?: string | null
          frequency_hours?: number | null
          id?: string
          last_distribution_at?: string | null
          start_date?: string | null
          status?: string
          title: string
          token_amount?: number
          total_recipients?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          distributed_count?: number
          eligibility_criteria?: Json | null
          end_date?: string | null
          frequency_hours?: number | null
          id?: string
          last_distribution_at?: string | null
          start_date?: string | null
          status?: string
          title?: string
          token_amount?: number
          total_recipients?: number
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      certificate_cache: {
        Row: {
          access_count: number | null
          cached_at: string | null
          certificate_id: string
          expires_at: string | null
          html_content: string
          id: string
          ipfs_hash: string
          last_accessed_at: string | null
        }
        Insert: {
          access_count?: number | null
          cached_at?: string | null
          certificate_id: string
          expires_at?: string | null
          html_content: string
          id?: string
          ipfs_hash: string
          last_accessed_at?: string | null
        }
        Update: {
          access_count?: number | null
          cached_at?: string | null
          certificate_id?: string
          expires_at?: string | null
          html_content?: string
          id?: string
          ipfs_hash?: string
          last_accessed_at?: string | null
        }
        Relationships: []
      }
      certificate_packages: {
        Row: {
          base_price: number
          certificates_count: number
          color_scheme: string | null
          created_at: string | null
          currency: string
          description: string | null
          discount_percentage: number | null
          display_order: number | null
          features: Json | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          package_id: string
          package_name: string
          price_per_certificate: number | null
          savings_amount: number | null
          updated_at: string | null
        }
        Insert: {
          base_price: number
          certificates_count: number
          color_scheme?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          discount_percentage?: number | null
          display_order?: number | null
          features?: Json | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          package_id: string
          package_name: string
          price_per_certificate?: number | null
          savings_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          certificates_count?: number
          color_scheme?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          discount_percentage?: number | null
          display_order?: number | null
          features?: Json | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          package_id?: string
          package_name?: string
          price_per_certificate?: number | null
          savings_amount?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      certificate_payments: {
        Row: {
          amount: number
          applied_pricing_id: string | null
          bold_order_id: string | null
          bold_payment_url: string | null
          bold_transaction_id: string | null
          certificate_id: string | null
          client_category_applied: Database["public"]["Enums"]["client_category"]
          created_at: string
          currency: string
          discount_applied: number | null
          id: string
          property_id: string | null
          metadata: Json | null
          paid_at: string | null
          payment_status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          applied_pricing_id?: string | null
          bold_order_id?: string | null
          bold_payment_url?: string | null
          bold_transaction_id?: string | null
          certificate_id?: string | null
          client_category_applied?: Database["public"]["Enums"]["client_category"]
          created_at?: string
          currency?: string
          discount_applied?: number | null
          id?: string
          property_id: string | null
          metadata?: Json | null
          paid_at?: string | null
          payment_status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          applied_pricing_id?: string | null
          bold_order_id?: string | null
          bold_payment_url?: string | null
          bold_transaction_id?: string | null
          certificate_id?: string | null
          client_category_applied?: Database["public"]["Enums"]["client_category"]
          created_at?: string
          currency?: string
          discount_applied?: number | null
          id?: string
          jewelry_item_id?: string
          metadata?: Json | null
          paid_at?: string | null
          payment_status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificate_payments_applied_pricing_id_fkey"
            columns: ["applied_pricing_id"]
            isOneToOne: false
            referencedRelation: "certificate_pricing"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificate_payments_jewelry_item_id_fkey"
            columns: ["jewelry_item_id"]
            isOneToOne: false
            referencedRelation: "jewelry_items"
            referencedColumns: ["id"]
          },
        ]
      }
      certificate_pricing: {
        Row: {
          base_price: number
          client_category: Database["public"]["Enums"]["client_category"]
          created_at: string
          created_by: string | null
          currency: string
          discount_percentage: number | null
          id: string
          is_active: boolean
          jewelry_type: Database["public"]["Enums"]["jewelry_type_pricing"]
          max_quantity: number | null
          min_quantity: number | null
          updated_at: string
        }
        Insert: {
          base_price?: number
          client_category: Database["public"]["Enums"]["client_category"]
          created_at?: string
          created_by?: string | null
          currency?: string
          discount_percentage?: number | null
          id?: string
          is_active?: boolean
          jewelry_type: Database["public"]["Enums"]["jewelry_type_pricing"]
          max_quantity?: number | null
          min_quantity?: number | null
          updated_at?: string
        }
        Update: {
          base_price?: number
          client_category?: Database["public"]["Enums"]["client_category"]
          created_at?: string
          created_by?: string | null
          currency?: string
          discount_percentage?: number | null
          id?: string
          is_active?: boolean
          jewelry_type?: Database["public"]["Enums"]["jewelry_type_pricing"]
          max_quantity?: number | null
          min_quantity?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      certificate_purchases: {
        Row: {
          amount_paid: number
          certificates_purchased: number
          certificates_remaining: number | null
          certificates_used: number
          created_at: string | null
          currency: string
          expires_at: string | null
          id: string
          metadata: Json | null
          package_name: string
          package_type: string
          payment_provider: string | null
          payment_status: string
          purchased_at: string
          transaction_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_paid: number
          certificates_purchased: number
          certificates_remaining?: number | null
          certificates_used?: number
          created_at?: string | null
          currency?: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          package_name: string
          package_type: string
          payment_provider?: string | null
          payment_status?: string
          purchased_at?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number
          certificates_purchased?: number
          certificates_remaining?: number | null
          certificates_used?: number
          created_at?: string | null
          currency?: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          package_name?: string
          package_type?: string
          payment_provider?: string | null
          payment_status?: string
          purchased_at?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      certificate_transfers: {
        Row: {
          certificate_id: string
          created_at: string
          from_user_id: string
          id: string
          status: Database["public"]["Enums"]["transfer_status"]
          to_user_id: string
          transfer_notes: string | null
        }
        Insert: {
          certificate_id: string
          created_at?: string
          from_user_id: string
          id?: string
          status?: Database["public"]["Enums"]["transfer_status"]
          to_user_id: string
          transfer_notes?: string | null
        }
        Update: {
          certificate_id?: string
          created_at?: string
          from_user_id?: string
          id?: string
          status?: Database["public"]["Enums"]["transfer_status"]
          to_user_id?: string
          transfer_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificate_transfers_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "nft_certificates"
            referencedColumns: ["id"]
          },
        ]
      }
      client_categories: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          category: Database["public"]["Enums"]["client_category"]
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          category?: Database["public"]["Enums"]["client_category"]
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          category?: Database["public"]["Enums"]["client_category"]
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings_complete"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_public_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      jewelry_items: {
        Row: {
          certification_info: string | null
          craftsman: string | null
          created_at: string
          currency: string | null
          description: string | null
          dimensions: string | null
          id: string
          image_urls: string[] | null
          images_count: number | null
          main_image_url: string | null
          materials: string[] | null
          name: string
          origin: string | null
          purchase_date: string | null
          sale_price: number | null
          serial_number: string | null
          status: Database["public"]["Enums"]["jewelry_status"] | null
          type: Database["public"]["Enums"]["jewelry_type"]
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          certification_info?: string | null
          craftsman?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          dimensions?: string | null
          id?: string
          image_urls?: string[] | null
          images_count?: number | null
          main_image_url?: string | null
          materials?: string[] | null
          name: string
          origin?: string | null
          purchase_date?: string | null
          sale_price?: number | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["jewelry_status"] | null
          type: Database["public"]["Enums"]["jewelry_type"]
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          certification_info?: string | null
          craftsman?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          dimensions?: string | null
          id?: string
          image_urls?: string[] | null
          images_count?: number | null
          main_image_url?: string | null
          materials?: string[] | null
          name?: string
          origin?: string | null
          purchase_date?: string | null
          sale_price?: number | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["jewelry_status"] | null
          type?: Database["public"]["Enums"]["jewelry_type"]
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      marketplace_listings: {
        Row: {
          average_rating: number | null
          created_at: string
          currency: string
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          featured: boolean
          id: string
          property_id: string | null
          likes: number
          price: number
          review_count: number | null
          seller_id: string
          status: string
          updated_at: string
          views: number
        }
        Insert: {
          average_rating?: number | null
          created_at?: string
          currency?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          featured?: boolean
          id?: string
          property_id: string | null
          likes?: number
          price: number
          review_count?: number | null
          seller_id: string
          status?: string
          updated_at?: string
          views?: number
        }
        Update: {
          average_rating?: number | null
          created_at?: string
          currency?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          featured?: boolean
          id?: string
          jewelry_item_id?: string
          likes?: number
          price?: number
          review_count?: number | null
          seller_id?: string
          status?: string
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_jewelry_item_id_fkey"
            columns: ["jewelry_item_id"]
            isOneToOne: false
            referencedRelation: "jewelry_items"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_reviews: {
        Row: {
          comment: string
          created_at: string
          id: string
          is_visible: boolean
          listing_id: string
          order_id: string
          rating: number
          reviewer_id: string
          seller_response: string | null
          seller_response_date: string | null
          title: string | null
          updated_at: string
          verified_purchase: boolean
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          is_visible?: boolean
          listing_id: string
          order_id: string
          rating: number
          reviewer_id: string
          seller_response?: string | null
          seller_response_date?: string | null
          title?: string | null
          updated_at?: string
          verified_purchase?: boolean
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          is_visible?: boolean
          listing_id?: string
          order_id?: string
          rating?: number
          reviewer_id?: string
          seller_response?: string | null
          seller_response_date?: string | null
          title?: string | null
          updated_at?: string
          verified_purchase?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings_complete"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_public_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      nft_certificates: {
        Row: {
          block_number: string | null
          blockchain_network: Database["public"]["Enums"]["blockchain_network"]
          blockchain_verification_url: string | null
          certificate_id: string
          certificate_pdf_url: string | null
          certificate_view_url: string | null
          contract_address: string | null
          created_at: string
          id: string
          is_verified: boolean | null
          property_id: string | null
          memorable_message: string | null
          metadata_uri: string | null
          orilux_block_number: number | null
          orilux_blockchain_hash: string | null
          orilux_blockchain_status: string | null
          orilux_timestamp: number | null
          orilux_tx_hash: string | null
          orilux_verification_url: string | null
          owner_id: string
          qr_code_url: string | null
          social_image_url: string | null
          token_id: string | null
          transaction_hash: string | null
          transfer_notes: string | null
          transferred_at: string | null
          updated_at: string
          user_id: string
          verification_date: string | null
          verification_url: string | null
        }
        Insert: {
          block_number?: string | null
          blockchain_network?: Database["public"]["Enums"]["blockchain_network"]
          blockchain_verification_url?: string | null
          certificate_id: string
          certificate_pdf_url?: string | null
          certificate_view_url?: string | null
          contract_address?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean | null
          property_id: string | null
          memorable_message?: string | null
          metadata_uri?: string | null
          orilux_block_number?: number | null
          orilux_blockchain_hash?: string | null
          orilux_blockchain_status?: string | null
          orilux_timestamp?: number | null
          orilux_tx_hash?: string | null
          orilux_verification_url?: string | null
          owner_id: string
          qr_code_url?: string | null
          social_image_url?: string | null
          token_id?: string | null
          transaction_hash?: string | null
          transfer_notes?: string | null
          transferred_at?: string | null
          updated_at?: string
          user_id: string
          verification_date?: string | null
          verification_url?: string | null
        }
        Update: {
          block_number?: string | null
          blockchain_network?: Database["public"]["Enums"]["blockchain_network"]
          blockchain_verification_url?: string | null
          certificate_id?: string
          certificate_pdf_url?: string | null
          certificate_view_url?: string | null
          contract_address?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean | null
          jewelry_item_id?: string
          memorable_message?: string | null
          metadata_uri?: string | null
          orilux_block_number?: number | null
          orilux_blockchain_hash?: string | null
          orilux_blockchain_status?: string | null
          orilux_timestamp?: number | null
          orilux_tx_hash?: string | null
          orilux_verification_url?: string | null
          owner_id?: string
          qr_code_url?: string | null
          social_image_url?: string | null
          token_id?: string | null
          transaction_hash?: string | null
          transfer_notes?: string | null
          transferred_at?: string | null
          updated_at?: string
          user_id?: string
          verification_date?: string | null
          verification_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nft_certificates_jewelry_item_id_fkey"
            columns: ["jewelry_item_id"]
            isOneToOne: false
            referencedRelation: "jewelry_items"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read: boolean | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          skipped: boolean | null
          task_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          skipped?: boolean | null
          task_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          skipped?: boolean | null
          task_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      order_communications: {
        Row: {
          created_at: string
          id: string
          message: string
          message_type: string
          metadata: Json | null
          order_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          message_type?: string
          metadata?: Json | null
          order_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          message_type?: string
          metadata?: Json | null
          order_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_communications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          property_id: string | null
          marketplace_listing_id: string
          order_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string | null
          marketplace_listing_id: string
          order_id: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          jewelry_item_id?: string
          marketplace_listing_id?: string
          order_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_jewelry_item_id_fkey"
            columns: ["jewelry_item_id"]
            isOneToOne: false
            referencedRelation: "jewelry_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_marketplace_listing_id_fkey"
            columns: ["marketplace_listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_marketplace_listing_id_fkey"
            columns: ["marketplace_listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings_complete"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_marketplace_listing_id_fkey"
            columns: ["marketplace_listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_public_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          bold_payment_id: string | null
          bold_transaction_id: string | null
          buyer_id: string
          cancelled_at: string | null
          completed_at: string | null
          created_at: string
          currency: string
          id: string
          marketplace_listing_id: string
          notes: string | null
          order_number: string
          order_status: string
          payment_method: string | null
          payment_reference: string | null
          payment_status: string
          seller_id: string
          shipping_address: Json | null
          total_amount: number
          updated_at: string
          wompi_status: string | null
          wompi_transaction_id: string | null
        }
        Insert: {
          billing_address?: Json | null
          bold_payment_id?: string | null
          bold_transaction_id?: string | null
          buyer_id: string
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          marketplace_listing_id: string
          notes?: string | null
          order_number: string
          order_status?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string
          seller_id: string
          shipping_address?: Json | null
          total_amount: number
          updated_at?: string
          wompi_status?: string | null
          wompi_transaction_id?: string | null
        }
        Update: {
          billing_address?: Json | null
          bold_payment_id?: string | null
          bold_transaction_id?: string | null
          buyer_id?: string
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          marketplace_listing_id?: string
          notes?: string | null
          order_number?: string
          order_status?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string
          seller_id?: string
          shipping_address?: Json | null
          total_amount?: number
          updated_at?: string
          wompi_status?: string | null
          wompi_transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_marketplace_listing_id_fkey"
            columns: ["marketplace_listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_marketplace_listing_id_fkey"
            columns: ["marketplace_listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings_complete"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_marketplace_listing_id_fkey"
            columns: ["marketplace_listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_public_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      package_category_pricing: {
        Row: {
          adjusted_price: number
          client_category: Database["public"]["Enums"]["client_category"]
          created_at: string | null
          created_by: string | null
          discount_percentage: number | null
          id: string
          is_active: boolean | null
          package_id: string
          updated_at: string | null
        }
        Insert: {
          adjusted_price: number
          client_category: Database["public"]["Enums"]["client_category"]
          created_at?: string | null
          created_by?: string | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          package_id: string
          updated_at?: string | null
        }
        Update: {
          adjusted_price?: number
          client_category?: Database["public"]["Enums"]["client_category"]
          created_at?: string | null
          created_by?: string | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          package_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "package_category_pricing_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "certificate_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          expires_at: string
          id: string
          metadata: Json | null
          order_id: string
          payment_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          expires_at?: string
          id?: string
          metadata?: Json | null
          order_id: string
          payment_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          expires_at?: string
          id?: string
          metadata?: Json | null
          order_id?: string
          payment_type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string | null
          address: string | null
          avatar_url: string | null
          business_name: string | null
          business_type: string | null
          city: string | null
          country: string | null
          created_at: string
          description: string | null
          email: string | null
          fiscal_address: Json | null
          fiscal_data_verified: boolean | null
          full_name: string | null
          id: string
          phone: string | null
          tax_id: string | null
          tax_regime: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          account_status?: string | null
          address?: string | null
          avatar_url?: string | null
          business_name?: string | null
          business_type?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          fiscal_address?: Json | null
          fiscal_data_verified?: boolean | null
          full_name?: string | null
          id?: string
          phone?: string | null
          tax_id?: string | null
          tax_regime?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          account_status?: string | null
          address?: string | null
          avatar_url?: string | null
          business_name?: string | null
          business_type?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          fiscal_address?: Json | null
          fiscal_data_verified?: boolean | null
          full_name?: string | null
          id?: string
          phone?: string | null
          tax_id?: string | null
          tax_regime?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      recently_viewed: {
        Row: {
          id: string
          listing_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recently_viewed_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recently_viewed_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings_complete"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recently_viewed_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_public_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      role_change_requests: {
        Row: {
          created_at: string | null
          id: string
          prev_role: Database["public"]["Enums"]["app_role"]
          reason: string | null
          rejection_reason: string | null
          requested_role: Database["public"]["Enums"]["app_role"]
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          prev_role: Database["public"]["Enums"]["app_role"]
          reason?: string | null
          rejection_reason?: string | null
          requested_role: Database["public"]["Enums"]["app_role"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          prev_role?: Database["public"]["Enums"]["app_role"]
          reason?: string | null
          rejection_reason?: string | null
          requested_role?: Database["public"]["Enums"]["app_role"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      search_analytics: {
        Row: {
          clicked_result_id: string | null
          created_at: string | null
          filters_applied: Json | null
          id: string
          results_count: number | null
          search_query: string
          user_id: string | null
        }
        Insert: {
          clicked_result_id?: string | null
          created_at?: string | null
          filters_applied?: Json | null
          id?: string
          results_count?: number | null
          search_query: string
          user_id?: string | null
        }
        Update: {
          clicked_result_id?: string | null
          created_at?: string | null
          filters_applied?: Json | null
          id?: string
          results_count?: number | null
          search_query?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_analytics_clicked_result_id_fkey"
            columns: ["clicked_result_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "search_analytics_clicked_result_id_fkey"
            columns: ["clicked_result_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings_complete"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "search_analytics_clicked_result_id_fkey"
            columns: ["clicked_result_id"]
            isOneToOne: false
            referencedRelation: "marketplace_public_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          canceled_at: string | null
          certificates_limit: number
          certificates_used: number | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          price_per_month: number
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          canceled_at?: string | null
          certificates_limit: number
          certificates_used?: number | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          price_per_month: number
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          canceled_at?: string | null
          certificates_limit?: number
          certificates_used?: number | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          price_per_month?: number
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number | null
          created_at: string
          cufe: string | null
          currency: string | null
          customer_tax_id: string | null
          dian_status: string | null
          id: string
          invoice_issued_at: string | null
          invoice_number: string | null
          invoice_pdf_url: string | null
          invoice_xml_url: string | null
          property_id: string | null | null
          metadata: Json | null
          nft_certificate_id: string | null
          status: string
          stripe_payment_intent_id: string | null
          subscription_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          cufe?: string | null
          currency?: string | null
          customer_tax_id?: string | null
          dian_status?: string | null
          id?: string
          invoice_issued_at?: string | null
          invoice_number?: string | null
          invoice_pdf_url?: string | null
          invoice_xml_url?: string | null
          jewelry_item_id?: string | null
          metadata?: Json | null
          nft_certificate_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          cufe?: string | null
          currency?: string | null
          customer_tax_id?: string | null
          dian_status?: string | null
          id?: string
          invoice_issued_at?: string | null
          invoice_number?: string | null
          invoice_pdf_url?: string | null
          invoice_xml_url?: string | null
          jewelry_item_id?: string | null
          metadata?: Json | null
          nft_certificate_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_jewelry_item_id_fkey"
            columns: ["jewelry_item_id"]
            isOneToOne: false
            referencedRelation: "jewelry_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_nft_certificate_id_fkey"
            columns: ["nft_certificate_id"]
            isOneToOne: false
            referencedRelation: "nft_certificates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
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
      user_tokens: {
        Row: {
          id: string
          last_updated: string
          token_balance: number
          total_earned: number
          total_spent: number
          user_id: string
        }
        Insert: {
          id?: string
          last_updated?: string
          token_balance?: number
          total_earned?: number
          total_spent?: number
          user_id: string
        }
        Update: {
          id?: string
          last_updated?: string
          token_balance?: number
          total_earned?: number
          total_spent?: number
          user_id?: string
        }
        Relationships: []
      }
      waitlist_entries: {
        Row: {
          company_name: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          interest_reason: string | null
          metadata: Json | null
          notified: boolean | null
          phone: string | null
          status: string | null
          updated_at: string | null
          user_type: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          interest_reason?: string | null
          metadata?: Json | null
          notified?: boolean | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          user_type?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          interest_reason?: string | null
          metadata?: Json | null
          notified?: boolean | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
      wompi_webhook_logs: {
        Row: {
          amount_in_cents: number | null
          created_at: string
          currency: string | null
          event_type: string
          id: string
          order_id: string | null
          processed: boolean
          processing_error: string | null
          raw_payload: Json
          reference: string | null
          signature_valid: boolean | null
          status: string | null
          transaction_id: string | null
          user_id: string | null
        }
        Insert: {
          amount_in_cents?: number | null
          created_at?: string
          currency?: string | null
          event_type: string
          id?: string
          order_id?: string | null
          processed?: boolean
          processing_error?: string | null
          raw_payload: Json
          reference?: string | null
          signature_valid?: boolean | null
          status?: string | null
          transaction_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount_in_cents?: number | null
          created_at?: string
          currency?: string | null
          event_type?: string
          id?: string
          order_id?: string | null
          processed?: boolean
          processing_error?: string | null
          raw_payload?: Json
          reference?: string | null
          signature_valid?: boolean | null
          status?: string | null
          transaction_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      certificate_verification: {
        Row: {
          certificate_id: string | null
          created_at: string | null
          is_verified: boolean | null
          jewelry_image: string | null
          property_id: string | null | null
          jewelry_name: string | null
          jewelry_type: Database["public"]["Enums"]["jewelry_type"] | null
          qr_code_url: string | null
          verification_date: string | null
          verification_url: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nft_certificates_jewelry_item_id_fkey"
            columns: ["jewelry_item_id"]
            isOneToOne: false
            referencedRelation: "jewelry_items"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings_complete: {
        Row: {
          average_rating: number | null
          certificate_id: string | null
          certificate_is_verified: boolean | null
          created_at: string | null
          currency: string | null
          description: string | null
          featured: boolean | null
          id: string | null
          jewelry_craftsman: string | null
          jewelry_description: string | null
          jewelry_dimensions: string | null
          jewelry_image_urls: string[] | null
          jewelry_images_count: number | null
          property_id: string | null | null
          jewelry_main_image_url: string | null
          jewelry_materials: string[] | null
          jewelry_name: string | null
          jewelry_origin: string | null
          jewelry_type: Database["public"]["Enums"]["jewelry_type"] | null
          jewelry_user_id: string | null
          jewelry_weight: number | null
          likes: number | null
          price: number | null
          review_count: number | null
          seller_avatar_url: string | null
          seller_business_name: string | null
          seller_city: string | null
          seller_country: string | null
          seller_full_name: string | null
          seller_id: string | null
          status: string | null
          updated_at: string | null
          views: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_jewelry_item_id_fkey"
            columns: ["jewelry_item_id"]
            isOneToOne: false
            referencedRelation: "jewelry_items"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_public_listings: {
        Row: {
          average_rating: number | null
          created_at: string | null
          currency: string | null
          description: string | null
          featured: boolean | null
          id: string | null
          property_id: string | null | null
          likes: number | null
          price: number | null
          review_count: number | null
          seller_city: string | null
          seller_country: string | null
          seller_name: string | null
          status: string | null
          updated_at: string | null
          views: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_jewelry_item_id_fkey"
            columns: ["jewelry_item_id"]
            isOneToOne: false
            referencedRelation: "jewelry_items"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_change_user_role: {
        Args: {
          _new_role: Database["public"]["Enums"]["app_role"]
          _request_id?: string
          _target_user_id: string
        }
        Returns: Json
      }
      approve_jewelry_account: {
        Args: { _notes?: string; _user_id: string }
        Returns: Json
      }
      can_distribute_airdrop: {
        Args: { _airdrop_id: string }
        Returns: boolean
      }
      clean_expired_certificate_cache: { Args: never; Returns: number }
      cleanup_old_notifications: { Args: never; Returns: undefined }
      create_subscription_from_payment: {
        Args: {
          _certificates_limit: number
          _current_period_end: string
          _current_period_start: string
          _plan: Database["public"]["Enums"]["subscription_plan"]
          _price_per_month: number
          _status: Database["public"]["Enums"]["subscription_status"]
          _stripe_customer_id?: string
          _stripe_subscription_id?: string
          _user_id: string
        }
        Returns: string
      }
      distribute_airdrop_tokens: {
        Args: { _airdrop_id: string; _recipient_user_ids: string[] }
        Returns: Json
      }
      find_similar_listings: {
        Args: { limit_count?: number; target_listing_id: string }
        Returns: {
          average_rating: number
          created_at: string
          currency: string
          description: string
          featured: boolean
          id: string
          property_id: string | null
          likes: number
          price: number
          review_count: number
          seller_id: string
          similarity_score: number
          status: string
          updated_at: string
          views: number
        }[]
      }
      generate_certificate_id: { Args: never; Returns: string }
      generate_order_number: { Args: never; Returns: string }
      get_certification_price: {
        Args: { p_jewelry_type: string; p_quantity?: number; p_user_id: string }
        Returns: {
          client_category: Database["public"]["Enums"]["client_category"]
          currency: string
          discount_percentage: number
          price: number
          pricing_id: string
        }[]
      }
      get_package_price_for_user: {
        Args: { p_package_id: string; p_user_id: string }
        Returns: {
          adjusted_price: number
          base_price: number
          client_category: Database["public"]["Enums"]["client_category"]
          discount_percentage: number
          has_custom_pricing: boolean
        }[]
      }
      get_public_certificate_price: {
        Args: {
          p_jewelry_type: Database["public"]["Enums"]["jewelry_type_pricing"]
        }
        Returns: {
          currency: string
          min_price: number
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_subscription: {
        Args: { user_uuid: string }
        Returns: {
          can_create_certificate: boolean
          certificates_limit: number
          certificates_used: number
          plan: Database["public"]["Enums"]["subscription_plan"]
          status: Database["public"]["Enums"]["subscription_status"]
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_cache_access: { Args: { cache_id: string }; Returns: undefined }
      increment_certificate_usage: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      log_audit_action: {
        Args: {
          _action: string
          _details?: Json
          _ip_address?: unknown
          _resource_id?: string
          _resource_type: string
          _user_agent?: string
        }
        Returns: string
      }
      mark_all_notifications_as_read: { Args: never; Returns: undefined }
      mark_notification_as_read: {
        Args: { notification_id: string }
        Returns: undefined
      }
      reject_jewelry_account: {
        Args: { _rejection_reason: string; _user_id: string }
        Returns: Json
      }
      reject_role_change_request: {
        Args: { _rejection_reason: string; _request_id: string }
        Returns: Json
      }
      renew_subscription: {
        Args: {
          _new_period_end: string
          _subscription_id: string
          _transaction_id?: string
        }
        Returns: boolean
      }
      request_role_change: {
        Args: {
          _reason?: string
          _requested_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: Json
      }
      search_marketplace_listings: {
        Args: {
          filter_seller_id?: string
          jewelry_types?: string[]
          materials?: string[]
          max_price?: number
          min_price?: number
          min_rating?: number
          search_query?: string
          sort_by?: string
        }
        Returns: {
          average_rating: number
          created_at: string
          currency: string
          description: string
          featured: boolean
          id: string
          property_id: string | null
          likes: number
          price: number
          relevance: number
          review_count: number
          seller_id: string
          status: string
          updated_at: string
          views: number
        }[]
      }
      test_security_policies: {
        Args: never
        Returns: {
          message: string
          passed: boolean
          test_name: string
        }[]
      }
      testing_change_role: {
        Args: {
          _new_role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: Json
      }
      validate_password_strength: {
        Args: { password: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "joyero" | "cliente" | "admin"
      blockchain_network: "ethereum" | "solana" | "polygon" | "crestchain"
      client_category: "regular" | "premium" | "corporativo" | "mayorista"
      jewelry_status:
        | "draft"
        | "pending"
        | "certificated"
        | "failed"
        | "certified"
      jewelry_type:
        | "anillo"
        | "collar"
        | "pulsera"
        | "pendientes"
        | "broche"
        | "reloj"
        | "cadena"
        | "dije"
        | "gemelos"
        | "tiara"
        | "otro"
      jewelry_type_pricing:
        | "anillo"
        | "collar"
        | "pulsera"
        | "aretes"
        | "reloj"
        | "cadena"
        | "dije"
        | "broche"
        | "gemelos"
        | "otro"
        | "pendientes"
      subscription_plan: "starter" | "professional" | "enterprise"
      subscription_status:
        | "active"
        | "canceled"
        | "past_due"
        | "unpaid"
        | "trialing"
      transfer_status: "pending" | "accepted" | "rejected" | "cancelled"
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
      app_role: ["joyero", "cliente", "admin"],
      blockchain_network: ["ethereum", "solana", "polygon", "crestchain"],
      client_category: ["regular", "premium", "corporativo", "mayorista"],
      jewelry_status: [
        "draft",
        "pending",
        "certificated",
        "failed",
        "certified",
      ],
      jewelry_type: [
        "anillo",
        "collar",
        "pulsera",
        "pendientes",
        "broche",
        "reloj",
        "cadena",
        "dije",
        "gemelos",
        "tiara",
        "otro",
      ],
      jewelry_type_pricing: [
        "anillo",
        "collar",
        "pulsera",
        "aretes",
        "reloj",
        "cadena",
        "dije",
        "broche",
        "gemelos",
        "otro",
        "pendientes",
      ],
      subscription_plan: ["starter", "professional", "enterprise"],
      subscription_status: [
        "active",
        "canceled",
        "past_due",
        "unpaid",
        "trialing",
      ],
      transfer_status: ["pending", "accepted", "rejected", "cancelled"],
    },
  },
} as const
