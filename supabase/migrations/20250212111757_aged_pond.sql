/*
  # Create Indemnity form submissions table

  1. New Tables
    - `indemnity`
      - `id` (uuid, primary key)
      - `language` (text) - Selected language
      - `full_name` (text) - User's full name
      - `email` (text) - User's email
      - `nationality` (text) - User's nationality
      - `birthday` (date) - User's date of birth
      - `id_number` (text) - ID/Passport number
      - `insurance` (text) - Insurance details
      - `has_children` (boolean) - Whether they have children
      - `children_names` (text) - Names of children (if applicable)
      - `terms_accepted` (boolean) - Terms acceptance
      - `signature` (text) - Base64 signature image
      - `created_at` (timestamptz) - Submission timestamp

  2. Security
    - Enable RLS on `indemnity` table
    - Add policy for inserting records
*/

CREATE TABLE IF NOT EXISTS indemnity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language text NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  nationality text NOT NULL,
  birthday date NOT NULL,
  id_number text NOT NULL,
  insurance text NOT NULL,
  has_children boolean NOT NULL,
  children_names text,
  terms_accepted boolean NOT NULL,
  signature text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE indemnity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for all users" ON indemnity
  FOR INSERT
  TO public
  WITH CHECK (true);