-- Add external male image URL column to planned_litters table
ALTER TABLE planned_litters 
ADD COLUMN external_male_image_url TEXT;