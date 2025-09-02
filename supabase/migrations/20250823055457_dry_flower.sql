/*
  # Fix RLS policies for blog tables

  1. Security Updates
    - Update RLS policies to allow public insert access for blog generation
    - Maintain read access for public users
    - Allow authenticated users full access for management

  2. Policy Changes
    - Enable insert access for anonymous users on exam_blog table
    - Enable insert access for anonymous users on course_blog table
    - Keep existing read policies intact
*/

-- Update exam_blog policies
DROP POLICY IF EXISTS "Public can read exam blogs" ON exam_blog;
DROP POLICY IF EXISTS "Authenticated users can manage exam blogs" ON exam_blog;

CREATE POLICY "Public can read exam blogs"
  ON exam_blog
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert exam blogs"
  ON exam_blog
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage exam blogs"
  ON exam_blog
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Update course_blog policies
DROP POLICY IF EXISTS "Public can read course blogs" ON course_blog;
DROP POLICY IF EXISTS "Authenticated users can manage course blogs" ON course_blog;

CREATE POLICY "Public can read course blogs"
  ON course_blog
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert course blogs"
  ON course_blog
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage course blogs"
  ON course_blog
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);