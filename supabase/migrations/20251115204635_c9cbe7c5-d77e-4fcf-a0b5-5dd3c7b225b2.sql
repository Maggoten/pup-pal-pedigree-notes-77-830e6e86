-- Fix Louie's incorrect weight log date from 2021 to 2022
UPDATE puppy_weight_logs 
SET date = '2022-11-19 20:26:00+00'::timestamptz
WHERE puppy_id = '800e6323-1907-469e-bf0f-0d63d1e89130' 
AND date = '2021-11-19 20:26:00+00'::timestamptz;