-- Fas 1.1: Lägg till heat_cycle_id i mating_dates
ALTER TABLE mating_dates 
ADD COLUMN heat_cycle_id uuid REFERENCES heat_cycles(id) ON DELETE SET NULL;

-- Fas 1.2: Lägg till externa hane-fält i pregnancies
ALTER TABLE pregnancies 
ADD COLUMN external_male_breed text,
ADD COLUMN external_male_registration text,
ADD COLUMN external_male_image_url text;