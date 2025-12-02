-- Enable full-text search on jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create index for full-text search
CREATE INDEX IF NOT EXISTS jobs_search_idx ON jobs USING gin(search_vector);

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_job_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.location, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search vector
DROP TRIGGER IF EXISTS jobs_search_vector_update ON jobs;
CREATE TRIGGER jobs_search_vector_update
  BEFORE INSERT OR UPDATE OF title, description, location
  ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_job_search_vector();

-- Update existing rows
UPDATE jobs SET search_vector = 
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(location, '')), 'C');