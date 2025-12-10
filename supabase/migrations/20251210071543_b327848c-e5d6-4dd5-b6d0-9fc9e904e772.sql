-- Update existing litters with dam_id/sire_id from their linked pregnancies
UPDATE litters l
SET 
  dam_id = p.female_dog_id::text,
  sire_id = p.male_dog_id::text
FROM pregnancies p
WHERE l.pregnancy_id = p.id
  AND (l.dam_id IS NULL OR l.sire_id IS NULL);