
-- This SQL file will enable realtime functionality for critical tables
-- It will be run manually by the user in the Supabase SQL editor

-- Enable REPLICA IDENTITY FULL for the dogs table
ALTER TABLE dogs REPLICA IDENTITY FULL;

-- Enable REPLICA IDENTITY FULL for the litters table
ALTER TABLE litters REPLICA IDENTITY FULL;

-- Enable REPLICA IDENTITY FULL for the puppies table
ALTER TABLE puppies REPLICA IDENTITY FULL;

-- Enable REPLICA IDENTITY FULL for the planned_litters table
ALTER TABLE planned_litters REPLICA IDENTITY FULL;

-- Enable REPLICA IDENTITY FULL for the pregnancies table
ALTER TABLE pregnancies REPLICA IDENTITY FULL;

-- Add these tables to the supabase_realtime publication
-- (the publication is created by Supabase automatically)
ALTER PUBLICATION supabase_realtime ADD TABLE dogs;
ALTER PUBLICATION supabase_realtime ADD TABLE litters; 
ALTER PUBLICATION supabase_realtime ADD TABLE puppies;
ALTER PUBLICATION supabase_realtime ADD TABLE planned_litters;
ALTER PUBLICATION supabase_realtime ADD TABLE pregnancies;

-- Ensure the mating_dates table is also added for realtime functionality
ALTER TABLE mating_dates REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE mating_dates;

-- Enable REPLICA IDENTITY FULL for the heat_cycles table
ALTER TABLE heat_cycles REPLICA IDENTITY FULL;

-- Enable REPLICA IDENTITY FULL for the heat_logs table  
ALTER TABLE heat_logs REPLICA IDENTITY FULL;

-- Add heat tables to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE heat_cycles;
ALTER PUBLICATION supabase_realtime ADD TABLE heat_logs;

-- Note: Run this SQL in the Supabase SQL Editor to enable realtime functionality
-- This will allow the React app to receive real-time updates when data changes
