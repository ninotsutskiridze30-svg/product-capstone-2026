export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "tutor" | "student";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          bio: string | null;
          city: string | null;
          country: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: UserRole;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          bio?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          bio?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tutor_profiles: {
        Row: {
          id: string;
          headline: string | null;
          hourly_rate_min: number | null;
          hourly_rate_max: number | null;
          currency: string;
          experience_years: number | null;
          education: Json;
          certifications: Json;
          languages: string[];
          rating: number;
          review_count: number;
          is_verified: boolean;
          is_active: boolean;
          response_time_hours: number | null;
          website_url: string | null;
          linkedin_url: string | null;
          search_document: string;
          search_vector: unknown;
        };
        Insert: {
          id: string;
          headline?: string | null;
          hourly_rate_min?: number | null;
          hourly_rate_max?: number | null;
          currency?: string;
          experience_years?: number | null;
          education?: Json;
          certifications?: Json;
          languages?: string[];
          rating?: number;
          review_count?: number;
          is_verified?: boolean;
          is_active?: boolean;
          response_time_hours?: number | null;
          website_url?: string | null;
          linkedin_url?: string | null;
          search_document?: string;
        };
        Update: {
          id?: string;
          headline?: string | null;
          hourly_rate_min?: number | null;
          hourly_rate_max?: number | null;
          currency?: string;
          experience_years?: number | null;
          education?: Json;
          certifications?: Json;
          languages?: string[];
          rating?: number;
          review_count?: number;
          is_verified?: boolean;
          is_active?: boolean;
          response_time_hours?: number | null;
          website_url?: string | null;
          linkedin_url?: string | null;
          search_document?: string;
        };
        Relationships: [];
      };
      field_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          icon?: string | null;
        };
        Relationships: [];
      };
      fields: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category_id: string;
          icon: string | null;
          is_predefined: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category_id: string;
          icon?: string | null;
          is_predefined?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          category_id?: string;
          icon?: string | null;
          is_predefined?: boolean;
        };
        Relationships: [];
      };
      tutor_fields: {
        Row: {
          id: string;
          tutor_id: string;
          field_id: string;
          custom_field_name: string | null;
          proficiency_level:
            | "beginner"
            | "intermediate"
            | "advanced"
            | "expert"
            | null;
          years_of_experience: number | null;
        };
        Insert: {
          id?: string;
          tutor_id: string;
          field_id: string;
          custom_field_name?: string | null;
          proficiency_level?:
            | "beginner"
            | "intermediate"
            | "advanced"
            | "expert"
            | null;
          years_of_experience?: number | null;
        };
        Update: {
          id?: string;
          tutor_id?: string;
          field_id?: string;
          custom_field_name?: string | null;
          proficiency_level?:
            | "beginner"
            | "intermediate"
            | "advanced"
            | "expert"
            | null;
          years_of_experience?: number | null;
        };
        Relationships: [];
      };
      tutor_images: {
        Row: {
          id: string;
          tutor_id: string;
          url: string;
          type: "cover" | "gallery" | "certificate";
          sort_order: number;
        };
        Insert: {
          id?: string;
          tutor_id: string;
          url: string;
          type: "cover" | "gallery" | "certificate";
          sort_order?: number;
        };
        Update: {
          id?: string;
          tutor_id?: string;
          url?: string;
          type?: "cover" | "gallery" | "certificate";
          sort_order?: number;
        };
        Relationships: [];
      };
      calendar_events: {
        Row: {
          id: string;
          tutor_id: string;
          booking_request_id: string | null;
          student_id: string | null;
          title: string | null;
          description: string | null;
          topic: string | null;
          notes: string | null;
          start_time: string;
          end_time: string;
          type:
            | "available"
            | "booked"
            | "blocked"
            | "lesson"
            | "pending"
            | "confirmed"
            | "invite_pending";
          is_recurring: boolean;
          recurrence_rule: Json | null;
          recurrence_until: string | null;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tutor_id: string;
          booking_request_id?: string | null;
          student_id?: string | null;
          title?: string | null;
          description?: string | null;
          topic?: string | null;
          notes?: string | null;
          start_time: string;
          end_time: string;
          type:
            | "available"
            | "booked"
            | "blocked"
            | "lesson"
            | "pending"
            | "confirmed"
            | "invite_pending";
          is_recurring?: boolean;
          recurrence_rule?: Json | null;
          recurrence_until?: string | null;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tutor_id?: string;
          booking_request_id?: string | null;
          student_id?: string | null;
          title?: string | null;
          description?: string | null;
          topic?: string | null;
          notes?: string | null;
          start_time?: string;
          end_time?: string;
          type?:
            | "available"
            | "booked"
            | "blocked"
            | "lesson"
            | "pending"
            | "confirmed"
            | "invite_pending";
          is_recurring?: boolean;
          recurrence_rule?: Json | null;
          recurrence_until?: string | null;
          color?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      student_groups: {
        Row: {
          id: string;
          tutor_id: string;
          name: string;
          field_id: string;
          max_students: number;
          current_count: number;
          description: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          tutor_id: string;
          name: string;
          field_id: string;
          max_students: number;
          current_count?: number;
          description?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          tutor_id?: string;
          name?: string;
          field_id?: string;
          max_students?: number;
          current_count?: number;
          description?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      group_members: {
        Row: {
          id: string;
          group_id: string;
          student_id: string;
          joined_at: string;
          status: "active" | "dropped" | "completed";
        };
        Insert: {
          id?: string;
          group_id: string;
          student_id: string;
          joined_at?: string;
          status: "active" | "dropped" | "completed";
        };
        Update: {
          id?: string;
          group_id?: string;
          student_id?: string;
          joined_at?: string;
          status?: "active" | "dropped" | "completed";
        };
        Relationships: [];
      };
      lesson_sessions: {
        Row: {
          id: string;
          calendar_event_id: string | null;
          tutor_id: string;
          group_id: string | null;
          student_id: string;
          field_id: string | null;
          type: "online" | "onsite";
          location: string | null;
          price: number | null;
          currency: string | null;
          status: "pending" | "confirmed" | "cancelled" | "completed";
          notes: string | null;
          meeting_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          calendar_event_id?: string | null;
          tutor_id: string;
          group_id?: string | null;
          student_id: string;
          field_id?: string | null;
          type: "online" | "onsite";
          location?: string | null;
          price?: number | null;
          currency?: string | null;
          status: "pending" | "confirmed" | "cancelled" | "completed";
          notes?: string | null;
          meeting_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          calendar_event_id?: string | null;
          tutor_id?: string;
          group_id?: string | null;
          student_id?: string;
          field_id?: string | null;
          type?: "online" | "onsite";
          location?: string | null;
          price?: number | null;
          currency?: string | null;
          status?: "pending" | "confirmed" | "cancelled" | "completed";
          notes?: string | null;
          meeting_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      booking_requests: {
        Row: {
          id: string;
          tutor_id: string;
          student_id: string;
          calendar_event_id: string | null;
          proposed_start: string | null;
          proposed_end: string | null;
          requested_slots: Json;
          recurrence_type: "once" | "weekly" | "biweekly" | "custom";
          initiated_by: "student" | "tutor";
          expires_at: string;
          updated_at: string;
          late_cancellation: boolean;
          cancelled_at: string | null;
          cancellation_reason: string | null;
          cancellation_actor_id: string | null;
          message: string | null;
          field_id: string | null;
          type: "online" | "onsite";
          status: "pending" | "accepted" | "declined" | "expired" | "cancelled";
          created_at: string;
        };
        Insert: {
          id?: string;
          tutor_id: string;
          student_id: string;
          calendar_event_id?: string | null;
          proposed_start?: string | null;
          proposed_end?: string | null;
          requested_slots?: Json;
          recurrence_type?: "once" | "weekly" | "biweekly" | "custom";
          initiated_by?: "student" | "tutor";
          expires_at?: string;
          updated_at?: string;
          late_cancellation?: boolean;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          cancellation_actor_id?: string | null;
          message?: string | null;
          field_id?: string | null;
          type: "online" | "onsite";
          status?: "pending" | "accepted" | "declined" | "expired" | "cancelled";
          created_at?: string;
        };
        Update: {
          id?: string;
          tutor_id?: string;
          student_id?: string;
          calendar_event_id?: string | null;
          proposed_start?: string | null;
          proposed_end?: string | null;
          requested_slots?: Json;
          recurrence_type?: "once" | "weekly" | "biweekly" | "custom";
          initiated_by?: "student" | "tutor";
          expires_at?: string;
          updated_at?: string;
          late_cancellation?: boolean;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          cancellation_actor_id?: string | null;
          message?: string | null;
          field_id?: string | null;
          type?: "online" | "onsite";
          status?: "pending" | "accepted" | "declined" | "expired" | "cancelled";
          created_at?: string;
        };
        Relationships: [];
      };
      booking_request_audit_logs: {
        Row: {
          id: string;
          booking_request_id: string;
          from_status: string | null;
          to_status: string;
          actor_id: string | null;
          actor_role: "student" | "tutor" | "system" | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_request_id: string;
          from_status?: string | null;
          to_status: string;
          actor_id?: string | null;
          actor_role?: "student" | "tutor" | "system" | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_request_id?: string;
          from_status?: string | null;
          to_status?: string;
          actor_id?: string | null;
          actor_role?: "student" | "tutor" | "system" | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          tutor_id: string;
          student_id: string;
          booking_request_id: string | null;
          last_message_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tutor_id: string;
          student_id: string;
          booking_request_id?: string | null;
          last_message_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tutor_id?: string;
          student_id?: string;
          booking_request_id?: string | null;
          last_message_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      connections: {
        Row: {
          id: string;
          student_id: string;
          tutor_id: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          tutor_id: string;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          tutor_id?: string;
          created_by?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          booking_request_id: string | null;
          content: string;
          attachment_url: string | null;
          attachment_type: string | null;
          attachment_ref: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          booking_request_id?: string | null;
          content: string;
          attachment_url?: string | null;
          attachment_type?: string | null;
          attachment_ref?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          booking_request_id?: string | null;
          content?: string;
          attachment_url?: string | null;
          attachment_type?: string | null;
          attachment_ref?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      call_sessions: {
        Row: {
          id: string;
          conversation_id: string;
          initiated_by: string;
          livekit_room: string;
          status: "ringing" | "active" | "ended" | "declined" | "missed";
          started_at: string | null;
          ended_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          initiated_by: string;
          livekit_room: string;
          status?: "ringing" | "active" | "ended" | "declined" | "missed";
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          initiated_by?: string;
          livekit_room?: string;
          status?: "ringing" | "active" | "ended" | "declined" | "missed";
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      whiteboard_snapshots: {
        Row: {
          id: string;
          call_session_id: string | null;
          conversation_id: string;
          saved_by: string;
          image_path: string;
          snapshot_path: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          call_session_id?: string | null;
          conversation_id: string;
          saved_by: string;
          image_path: string;
          snapshot_path: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          call_session_id?: string | null;
          conversation_id?: string;
          saved_by?: string;
          image_path?: string;
          snapshot_path?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          tutor_id: string;
          student_id: string;
          session_id: string;
          rating: number;
          content: string | null;
          is_visible: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tutor_id: string;
          student_id: string;
          session_id: string;
          rating: number;
          content?: string | null;
          is_visible?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          tutor_id?: string;
          student_id?: string;
          session_id?: string;
          rating?: number;
          content?: string | null;
          is_visible?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type:
            | "booking_request"
            | "message"
            | "review"
            | "session_reminder"
            | "booking_accepted"
            | "booking_declined"
            | "booking_expired"
            | "booking_cancelled"
            | "booking_invite"
            | "booking_invite_declined"
            | "homework_assigned"
            | "homework_submitted"
            | "homework_graded"
            | "homework_revision_requested"
            | "homework_ai_review_ready";
          title: string;
          body: string | null;
          payload: Json;
          actor_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type:
            | "booking_request"
            | "message"
            | "review"
            | "session_reminder"
            | "booking_accepted"
            | "booking_declined"
            | "booking_expired"
            | "booking_cancelled"
            | "booking_invite"
            | "booking_invite_declined"
            | "homework_assigned"
            | "homework_submitted"
            | "homework_graded"
            | "homework_revision_requested"
            | "homework_ai_review_ready";
          title: string;
          body?: string | null;
          payload?: Json;
          actor_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?:
            | "booking_request"
            | "message"
            | "review"
            | "session_reminder"
            | "booking_accepted"
            | "booking_declined"
            | "booking_expired"
            | "booking_cancelled"
            | "booking_invite"
            | "booking_invite_declined"
            | "homework_assigned"
            | "homework_submitted"
            | "homework_graded"
            | "homework_revision_requested"
            | "homework_ai_review_ready";
          title?: string;
          body?: string | null;
          payload?: Json;
          actor_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      tutor_favorites: {
        Row: {
          id: string;
          student_id: string;
          tutor_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          tutor_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          tutor_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      notification_preferences: {
        Row: {
          user_id: string;
          email_booking: boolean;
          email_message: boolean;
          push_booking: boolean;
          push_message: boolean;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          email_booking?: boolean;
          email_message?: boolean;
          push_booking?: boolean;
          push_message?: boolean;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          email_booking?: boolean;
          email_message?: boolean;
          push_booking?: boolean;
          push_message?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      homework_assignments: {
        Row: {
          id: string;
          tutor_id: string;
          student_id: string;
          title: string;
          description: string | null;
          due_at: string | null;
          attachment_url: string | null;
          attachment_name: string | null;
          attachment_size: number | null;
          max_score: number | null;
          allow_late: boolean;
          late_penalty_pct: number | null;
          status:
            | "assigned"
            | "submitted"
            | "revision_requested"
            | "graded";
          batch_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tutor_id: string;
          student_id: string;
          title: string;
          description?: string | null;
          due_at?: string | null;
          attachment_url?: string | null;
          attachment_name?: string | null;
          attachment_size?: number | null;
          max_score?: number | null;
          allow_late?: boolean;
          late_penalty_pct?: number | null;
          status?:
            | "assigned"
            | "submitted"
            | "revision_requested"
            | "graded";
          batch_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tutor_id?: string;
          student_id?: string;
          title?: string;
          description?: string | null;
          due_at?: string | null;
          attachment_url?: string | null;
          attachment_name?: string | null;
          attachment_size?: number | null;
          max_score?: number | null;
          allow_late?: boolean;
          late_penalty_pct?: number | null;
          status?:
            | "assigned"
            | "submitted"
            | "revision_requested"
            | "graded";
          batch_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      homework_submissions: {
        Row: {
          id: string;
          assignment_id: string;
          student_id: string;
          content: string | null;
          attachment_url: string | null;
          attachment_name: string | null;
          attachment_size: number | null;
          attempt_no: number;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          student_id: string;
          content?: string | null;
          attachment_url?: string | null;
          attachment_name?: string | null;
          attachment_size?: number | null;
          attempt_no: number;
          submitted_at?: string;
        };
        Update: {
          id?: string;
          assignment_id?: string;
          student_id?: string;
          content?: string | null;
          attachment_url?: string | null;
          attachment_name?: string | null;
          attachment_size?: number | null;
          attempt_no?: number;
          submitted_at?: string;
        };
        Relationships: [];
      };
      homework_grades: {
        Row: {
          id: string;
          submission_id: string;
          tutor_id: string;
          score: number | null;
          max_score: number | null;
          feedback: string | null;
          outcome: "graded" | "revision_requested";
          per_criterion: Json | null;
          ai_review_id: string | null;
          graded_at: string;
        };
        Insert: {
          id?: string;
          submission_id: string;
          tutor_id: string;
          score?: number | null;
          max_score?: number | null;
          feedback?: string | null;
          outcome: "graded" | "revision_requested";
          per_criterion?: Json | null;
          ai_review_id?: string | null;
          graded_at?: string;
        };
        Update: {
          id?: string;
          submission_id?: string;
          tutor_id?: string;
          score?: number | null;
          max_score?: number | null;
          feedback?: string | null;
          outcome?: "graded" | "revision_requested";
          per_criterion?: Json | null;
          ai_review_id?: string | null;
          graded_at?: string;
        };
        Relationships: [];
      };
      homework_assignment_grading: {
        Row: {
          assignment_id: string;
          tutor_id: string;
          answer_key: string | null;
          grading_notes: string | null;
          ai_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          assignment_id: string;
          tutor_id: string;
          answer_key?: string | null;
          grading_notes?: string | null;
          ai_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          assignment_id?: string;
          tutor_id?: string;
          answer_key?: string | null;
          grading_notes?: string | null;
          ai_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      homework_rubric_criteria: {
        Row: {
          id: string;
          assignment_id: string;
          label: string;
          description: string | null;
          max_points: number;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          label: string;
          description?: string | null;
          max_points: number;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          assignment_id?: string;
          label?: string;
          description?: string | null;
          max_points?: number;
          position?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      homework_ai_reviews: {
        Row: {
          id: string;
          submission_id: string;
          assignment_id: string;
          tutor_id: string;
          run_no: number;
          status: "pending" | "running" | "complete" | "failed" | "skipped";
          model: string | null;
          originality: Json | null;
          suggested_score: number | null;
          max_score: number | null;
          per_criterion: Json | null;
          strengths: Json | null;
          issues: Json | null;
          draft_feedback: string | null;
          summary: string | null;
          attachment_mode: string | null;
          input_tokens: number | null;
          output_tokens: number | null;
          cache_read_tokens: number | null;
          cache_write_tokens: number | null;
          cost_usd: number | null;
          error: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          submission_id: string;
          assignment_id: string;
          tutor_id: string;
          run_no?: number;
          status?: "pending" | "running" | "complete" | "failed" | "skipped";
          model?: string | null;
          originality?: Json | null;
          suggested_score?: number | null;
          max_score?: number | null;
          per_criterion?: Json | null;
          strengths?: Json | null;
          issues?: Json | null;
          draft_feedback?: string | null;
          summary?: string | null;
          attachment_mode?: string | null;
          input_tokens?: number | null;
          output_tokens?: number | null;
          cache_read_tokens?: number | null;
          cache_write_tokens?: number | null;
          cost_usd?: number | null;
          error?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          submission_id?: string;
          assignment_id?: string;
          tutor_id?: string;
          run_no?: number;
          status?: "pending" | "running" | "complete" | "failed" | "skipped";
          model?: string | null;
          originality?: Json | null;
          suggested_score?: number | null;
          max_score?: number | null;
          per_criterion?: Json | null;
          strengths?: Json | null;
          issues?: Json | null;
          draft_feedback?: string | null;
          summary?: string | null;
          attachment_mode?: string | null;
          input_tokens?: number | null;
          output_tokens?: number | null;
          cache_read_tokens?: number | null;
          cache_write_tokens?: number | null;
          cost_usd?: number | null;
          error?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      homework_comments: {
        Row: {
          id: string;
          assignment_id: string;
          author_id: string;
          author_role: "tutor" | "student";
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          author_id: string;
          author_role: "tutor" | "student";
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          assignment_id?: string;
          author_id?: string;
          author_role?: "tutor" | "student";
          body?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      search_active_tutors: {
        Args: { p_query: string | null };
        Returns: Database["public"]["Tables"]["tutor_profiles"]["Row"][];
      };
      rpc_create_booking_request_atomic: {
        Args: {
          p_tutor_id: string;
          p_student_id: string;
          p_requested_slots: Json;
          p_recurrence_type?: string;
          p_initiated_by?: string;
          p_type?: string;
          p_message?: string | null;
          p_field_id?: string | null;
          p_allow_partial?: boolean;
        };
        Returns: Json;
      };
      rpc_update_booking_request_status: {
        Args: {
          p_booking_request_id: string;
          p_next_status: string;
          p_actor_id: string;
          p_actor_role: string;
          p_metadata?: Json;
        };
        Returns: Json;
      };
      rpc_accept_tutor_lesson_invite: {
        Args: { p_booking_request_id: string };
        Returns: Json;
      };
      rpc_decline_tutor_lesson_invite: {
        Args: { p_booking_request_id: string };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type TutorProfile = Database["public"]["Tables"]["tutor_profiles"]["Row"];
