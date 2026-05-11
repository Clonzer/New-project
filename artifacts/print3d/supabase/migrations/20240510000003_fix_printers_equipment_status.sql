-- Fix missing equipment_status column in printers table
-- This migration adds the missing equipment_status column that's causing API errors

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'printers' 
        AND column_name = 'equipment_status'
    ) THEN
        ALTER TABLE printers ADD COLUMN equipment_status TEXT DEFAULT 'active';
        RAISE NOTICE 'Added equipment_status column to printers table';
    END IF;
END $$;

-- Also ensure status column exists as fallback
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'printers' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE printers ADD COLUMN status TEXT DEFAULT 'active';
        RAISE NOTICE 'Added status column to printers table';
    END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_printers_equipment_status ON printers(equipment_status);
CREATE INDEX IF NOT EXISTS idx_printers_status ON printers(status);

RAISE NOTICE 'Printers table equipment_status column migration completed successfully';
