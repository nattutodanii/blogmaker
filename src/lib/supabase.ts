import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      exams: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
      };
      courses: {
        Row: {
          id: string;
          exam_id: string | null;
          name: string;
          description: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
      };
      exam_blog: {
        Row: {
          id: string;
          exam_id: string | null;
          name: string;
          description: string | null;
          created_at: string | null;
          short_description: string | null;
          location: string | null;
          established_year: number | null;
          detailed_description: string | null;
          introduction: string | null;
          history: string | null;
          recognition: string | null;
          campuses: string | null;
          rankings: string | null;
          infrastructure: string | null;
          placements: string | null;
          global_collaborations: string | null;
          fees_scholarships: string | null;
          preparation_tips: string | null;
          why_choose: string | null;
          syllabus: string | null;
          campus: string | null;
          admission_procedure: string | null;
          exam_pattern: string | null;
          pyqs: string | null;
          cutoff_trends: string | null;
          short_notes: string | null;
          important_dates: string | null;
          eligibility_criteria: string | null;
          exam_centers: string | null;
          scholarships_stipends: string | null;
          recommended_books: string | null;
        };
      };
      course_blog: {
        Row: {
          id: string;
          course_id: string | null;
          exam_id: string | null;
          name: string;
          description: string | null;
          created_at: string | null;
          is_calculator: boolean | null;
          is_parts: boolean | null;
          test_parts: string | null;
          freemium_group: string | null;
          premium_group: string | null;
          duration: string | null;
          intake_capacity: string | null;
          average_package: string | null;
          degree_type: string | null;
          placement_statistics: string | null;
          course_overview: string | null;
          entrance_exam_details: string | null;
          exam_pattern: string | null;
          skills_learning_outcomes: string | null;
          admission_procedure: string | null;
          preparation_strategy: string | null;
          syllabus: string | null;
          notes: string | null;
          short_notes: string | null;
          chapter_wise_questions: string | null;
          full_length_mocks: string | null;
          course_curriculum: string | null;
          projects_assignments: string | null;
          day_in_life: string | null;
          campus_life: string | null;
          alumni_stories: string | null;
          global_exposure: string | null;
          course_comparison: string | null;
          quick_facts: string | null;
        };
      };
    };
  };
};