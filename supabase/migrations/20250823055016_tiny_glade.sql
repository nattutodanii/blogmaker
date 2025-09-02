/*
  # Create Blog Tables for Exams and Courses

  1. New Tables
    - `exam_blog`
      - Complete blog content for exams with all components
      - Links to existing exams table
      - Includes detailed sections like rankings, infrastructure, placements, etc.
    - `course_blog` 
      - Complete blog content for courses with all components
      - Links to existing courses and exams tables
      - Includes course-specific details like curriculum, projects, etc.

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
    - Add policies for authenticated users to manage content
*/

-- Create exam_blog table
CREATE TABLE IF NOT EXISTS exam_blog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid REFERENCES exams(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  short_description text,
  location text,
  established_year integer,
  detailed_description text,
  introduction text,
  history text,
  recognition text,
  campuses text,
  rankings text,
  infrastructure text,
  placements text,
  global_collaborations text,
  fees_scholarships text,
  preparation_tips text,
  why_choose text,
  syllabus text,
  campus text,
  admission_procedure text,
  exam_pattern text,
  pyqs text,
  cutoff_trends text,
  short_notes text,
  important_dates text,
  eligibility_criteria text,
  exam_centers text,
  scholarships_stipends text,
  recommended_books text
);

-- Create course_blog table
CREATE TABLE IF NOT EXISTS course_blog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  exam_id uuid REFERENCES exams(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  is_calculator boolean DEFAULT false,
  is_parts boolean DEFAULT false,
  test_parts text,
  freemium_group text,
  premium_group text,
  duration text,
  intake_capacity text,
  average_package text,
  degree_type text,
  placement_statistics text,
  course_overview text,
  entrance_exam_details text,
  exam_pattern text,
  skills_learning_outcomes text,
  admission_procedure text,
  preparation_strategy text,
  syllabus text,
  notes text,
  short_notes text,
  chapter_wise_questions text,
  full_length_mocks text,
  course_curriculum text,
  projects_assignments text,
  day_in_life text,
  campus_life text,
  alumni_stories text,
  global_exposure text,
  course_comparison text,
  quick_facts text
);

-- Enable RLS
ALTER TABLE exam_blog ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_blog ENABLE ROW LEVEL SECURITY;

-- Create policies for exam_blog
CREATE POLICY "Public can read exam blogs"
  ON exam_blog
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage exam blogs"
  ON exam_blog
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for course_blog
CREATE POLICY "Public can read course blogs"
  ON course_blog
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage course blogs"
  ON course_blog
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exam_blog_exam_id ON exam_blog(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_blog_created_at ON exam_blog(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_course_blog_course_id ON course_blog(course_id);
CREATE INDEX IF NOT EXISTS idx_course_blog_exam_id ON course_blog(exam_id);
CREATE INDEX IF NOT EXISTS idx_course_blog_created_at ON course_blog(created_at DESC);