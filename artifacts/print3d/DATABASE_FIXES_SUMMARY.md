# Database Fixes Summary

## Issues Fixed

### 1. UUID Type Casting Errors ✅
**Problem**: `operator does not exist: integer = uuid` and `cannot cast type integer to uuid`
**Solution**: 
- Added explicit `::uuid` casts in all RLS policies
- Fixed foreign key references to use correct tables
- Standardized UUID generation functions

### 2. Table Reference Issues ✅
**Problem**: References to non-existent or incorrectly typed tables
**Solution**:
- Changed `shop_id` to reference `public.users(id)` instead of `public.sellers(id)`
- Created missing `listings` table with proper UUID structure
- Ensured all foreign keys reference correct tables

### 3. UUID Generation Inconsistency ✅
**Problem**: Mixed use of `uuid_generate_v4()` and `gen_random_uuid()`
**Solution**:
- Standardized all new tables to use `gen_random_uuid()`
- Added database extensions migration to ensure functions exist
- Created standardized `update_updated_at_column` function

### 4. Missing Database Extensions ✅
**Problem**: UUID generation functions may not be available
**Solution**:
- Added `uuid-ossp` extension
- Ensured `gen_random_uuid()` function exists
- Added proper function definitions

## Files to Run (in order)

1. `20240508_fix_database_extensions.sql` - Database extensions
2. `20240508_ensure_listings_table.sql` - Listings table
3. `20240508_add_favorites_table.sql` - Favorites table
4. `20240508_add_orders_table.sql` - Orders table

## Remaining Issues to Check

### 1. Table Existence
- Verify `public.users` vs `auth.users` table exists
- Check if `profiles` table exists and structure
- Ensure `sellers` table exists with correct structure

### 2. Data Migration
- Existing integer IDs may need manual migration to UUID
- Profile data may need to be synced with users table
- Existing listings/sellers data may need updating

### 3. RLS Policy Consistency
- All policies should use consistent UUID casting
- Ensure proper security boundaries
- Test policy permissions work correctly

## Testing Checklist

After running migrations, test:

- [ ] Favorites table creation
- [ ] Orders table creation  
- [ ] Listings table creation
- [ ] RLS policies work correctly
- [ ] UUID generation works
- [ ] Foreign key constraints work
- [ ] No type casting errors
- [ ] Frontend can create/read/update favorites
- [ ] Frontend can create/read/update orders

## Notes

The main issues were:
1. **Type mismatches** between integer and UUID columns
2. **Missing tables** causing foreign key failures
3. **Inconsistent UUID generation** across migrations
4. **Missing database extensions** for UUID functions

All these have been addressed in the fixes above.
