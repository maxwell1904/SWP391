/*
  Rename Discount domain to Voucher for SQL Server.

  Run this once on each local Unleashed database after pulling code that expects
  voucher_* tables/columns. Back up the database before running.
*/

USE [Unleashed];
GO

SET XACT_ABORT ON;
GO

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID(N'dbo.discount', N'U') IS NOT NULL AND OBJECT_ID(N'dbo.voucher', N'U') IS NOT NULL
        THROW 52000, 'Both dbo.discount and dbo.voucher exist. Resolve duplicate tables before running migration.', 1;

    IF OBJECT_ID(N'dbo.discount_status', N'U') IS NOT NULL AND OBJECT_ID(N'dbo.voucher_status', N'U') IS NOT NULL
        THROW 52001, 'Both dbo.discount_status and dbo.voucher_status exist. Resolve duplicate tables before running migration.', 1;

    IF OBJECT_ID(N'dbo.discount_type', N'U') IS NOT NULL AND OBJECT_ID(N'dbo.voucher_type', N'U') IS NOT NULL
        THROW 52002, 'Both dbo.discount_type and dbo.voucher_type exist. Resolve duplicate tables before running migration.', 1;

    IF OBJECT_ID(N'dbo.user_discount', N'U') IS NOT NULL AND OBJECT_ID(N'dbo.user_voucher', N'U') IS NOT NULL
        THROW 52003, 'Both dbo.user_discount and dbo.user_voucher exist. Resolve duplicate tables before running migration.', 1;

    IF OBJECT_ID(N'dbo.discount', N'U') IS NOT NULL
        EXEC sp_rename N'dbo.discount', N'voucher';

    IF OBJECT_ID(N'dbo.discount_status', N'U') IS NOT NULL
        EXEC sp_rename N'dbo.discount_status', N'voucher_status';

    IF OBJECT_ID(N'dbo.discount_type', N'U') IS NOT NULL
        EXEC sp_rename N'dbo.discount_type', N'voucher_type';

    IF OBJECT_ID(N'dbo.user_discount', N'U') IS NOT NULL
        EXEC sp_rename N'dbo.user_discount', N'user_voucher';

    IF COL_LENGTH(N'dbo.voucher', N'discount_id') IS NOT NULL AND COL_LENGTH(N'dbo.voucher', N'voucher_id') IS NULL
        EXEC sp_rename N'dbo.voucher.discount_id', N'voucher_id', N'COLUMN';

    IF COL_LENGTH(N'dbo.voucher', N'discount_status_id') IS NOT NULL AND COL_LENGTH(N'dbo.voucher', N'voucher_status_id') IS NULL
        EXEC sp_rename N'dbo.voucher.discount_status_id', N'voucher_status_id', N'COLUMN';

    IF COL_LENGTH(N'dbo.voucher', N'discount_type_id') IS NOT NULL AND COL_LENGTH(N'dbo.voucher', N'voucher_type_id') IS NULL
        EXEC sp_rename N'dbo.voucher.discount_type_id', N'voucher_type_id', N'COLUMN';

    IF COL_LENGTH(N'dbo.voucher', N'discount_code') IS NOT NULL AND COL_LENGTH(N'dbo.voucher', N'voucher_code') IS NULL
        EXEC sp_rename N'dbo.voucher.discount_code', N'voucher_code', N'COLUMN';

    IF COL_LENGTH(N'dbo.voucher', N'discount_value') IS NOT NULL AND COL_LENGTH(N'dbo.voucher', N'voucher_value') IS NULL
        EXEC sp_rename N'dbo.voucher.discount_value', N'voucher_value', N'COLUMN';

    IF COL_LENGTH(N'dbo.voucher', N'discount_description') IS NOT NULL AND COL_LENGTH(N'dbo.voucher', N'voucher_description') IS NULL
        EXEC sp_rename N'dbo.voucher.discount_description', N'voucher_description', N'COLUMN';

    IF COL_LENGTH(N'dbo.voucher', N'discount_rank_requirement') IS NOT NULL AND COL_LENGTH(N'dbo.voucher', N'voucher_rank_requirement') IS NULL
        EXEC sp_rename N'dbo.voucher.discount_rank_requirement', N'voucher_rank_requirement', N'COLUMN';

    IF COL_LENGTH(N'dbo.voucher', N'discount_minimum_order_value') IS NOT NULL AND COL_LENGTH(N'dbo.voucher', N'voucher_minimum_order_value') IS NULL
        EXEC sp_rename N'dbo.voucher.discount_minimum_order_value', N'voucher_minimum_order_value', N'COLUMN';

    IF COL_LENGTH(N'dbo.voucher', N'discount_maximum_value') IS NOT NULL AND COL_LENGTH(N'dbo.voucher', N'voucher_maximum_value') IS NULL
        EXEC sp_rename N'dbo.voucher.discount_maximum_value', N'voucher_maximum_value', N'COLUMN';

    IF COL_LENGTH(N'dbo.voucher', N'discount_usage_limit') IS NOT NULL AND COL_LENGTH(N'dbo.voucher', N'voucher_usage_limit') IS NULL
        EXEC sp_rename N'dbo.voucher.discount_usage_limit', N'voucher_usage_limit', N'COLUMN';

    IF COL_LENGTH(N'dbo.voucher', N'discount_start_date') IS NOT NULL AND COL_LENGTH(N'dbo.voucher', N'voucher_start_date') IS NULL
        EXEC sp_rename N'dbo.voucher.discount_start_date', N'voucher_start_date', N'COLUMN';

    IF COL_LENGTH(N'dbo.voucher', N'discount_end_date') IS NOT NULL AND COL_LENGTH(N'dbo.voucher', N'voucher_end_date') IS NULL
        EXEC sp_rename N'dbo.voucher.discount_end_date', N'voucher_end_date', N'COLUMN';

    IF COL_LENGTH(N'dbo.voucher', N'discount_created_at') IS NOT NULL AND COL_LENGTH(N'dbo.voucher', N'voucher_created_at') IS NULL
        EXEC sp_rename N'dbo.voucher.discount_created_at', N'voucher_created_at', N'COLUMN';

    IF COL_LENGTH(N'dbo.voucher', N'discount_updated_at') IS NOT NULL AND COL_LENGTH(N'dbo.voucher', N'voucher_updated_at') IS NULL
        EXEC sp_rename N'dbo.voucher.discount_updated_at', N'voucher_updated_at', N'COLUMN';

    IF COL_LENGTH(N'dbo.voucher', N'discount_usage_count') IS NOT NULL AND COL_LENGTH(N'dbo.voucher', N'voucher_usage_count') IS NULL
        EXEC sp_rename N'dbo.voucher.discount_usage_count', N'voucher_usage_count', N'COLUMN';

    IF COL_LENGTH(N'dbo.voucher_status', N'discount_status_id') IS NOT NULL AND COL_LENGTH(N'dbo.voucher_status', N'voucher_status_id') IS NULL
        EXEC sp_rename N'dbo.voucher_status.discount_status_id', N'voucher_status_id', N'COLUMN';

    IF COL_LENGTH(N'dbo.voucher_status', N'discount_status_name') IS NOT NULL AND COL_LENGTH(N'dbo.voucher_status', N'voucher_status_name') IS NULL
        EXEC sp_rename N'dbo.voucher_status.discount_status_name', N'voucher_status_name', N'COLUMN';

    IF COL_LENGTH(N'dbo.voucher_type', N'discount_type_id') IS NOT NULL AND COL_LENGTH(N'dbo.voucher_type', N'voucher_type_id') IS NULL
        EXEC sp_rename N'dbo.voucher_type.discount_type_id', N'voucher_type_id', N'COLUMN';

    IF COL_LENGTH(N'dbo.voucher_type', N'discount_type_name') IS NOT NULL AND COL_LENGTH(N'dbo.voucher_type', N'voucher_type_name') IS NULL
        EXEC sp_rename N'dbo.voucher_type.discount_type_name', N'voucher_type_name', N'COLUMN';

    IF COL_LENGTH(N'dbo.[order]', N'discount_id') IS NOT NULL AND COL_LENGTH(N'dbo.[order]', N'voucher_id') IS NULL
        EXEC sp_rename N'dbo.[order].discount_id', N'voucher_id', N'COLUMN';

    IF COL_LENGTH(N'dbo.user_voucher', N'discount_id') IS NOT NULL AND COL_LENGTH(N'dbo.user_voucher', N'voucher_id') IS NULL
        EXEC sp_rename N'dbo.user_voucher.discount_id', N'voucher_id', N'COLUMN';

    IF COL_LENGTH(N'dbo.user_voucher', N'is_discount_used') IS NOT NULL AND COL_LENGTH(N'dbo.user_voucher', N'is_voucher_used') IS NULL
        EXEC sp_rename N'dbo.user_voucher.is_discount_used', N'is_voucher_used', N'COLUMN';

    IF COL_LENGTH(N'dbo.user_voucher', N'discount_used_at') IS NOT NULL AND COL_LENGTH(N'dbo.user_voucher', N'voucher_used_at') IS NULL
        EXEC sp_rename N'dbo.user_voucher.discount_used_at', N'voucher_used_at', N'COLUMN';

    IF OBJECT_ID(N'dbo.discount_pkey') IS NOT NULL AND OBJECT_ID(N'dbo.voucher_pkey') IS NULL
        EXEC sp_rename N'dbo.discount_pkey', N'voucher_pkey', N'OBJECT';

    IF OBJECT_ID(N'dbo.discount_status_pkey') IS NOT NULL AND OBJECT_ID(N'dbo.voucher_status_pkey') IS NULL
        EXEC sp_rename N'dbo.discount_status_pkey', N'voucher_status_pkey', N'OBJECT';

    IF OBJECT_ID(N'dbo.discount_type_pkey') IS NOT NULL AND OBJECT_ID(N'dbo.voucher_type_pkey') IS NULL
        EXEC sp_rename N'dbo.discount_type_pkey', N'voucher_type_pkey', N'OBJECT';

    IF OBJECT_ID(N'dbo.user_discount_pkey') IS NOT NULL AND OBJECT_ID(N'dbo.user_voucher_pkey') IS NULL
        EXEC sp_rename N'dbo.user_discount_pkey', N'user_voucher_pkey', N'OBJECT';

    IF OBJECT_ID(N'dbo.discount_discount_rank_requirement_fkey') IS NOT NULL AND OBJECT_ID(N'dbo.voucher_voucher_rank_requirement_fkey') IS NULL
        EXEC sp_rename N'dbo.discount_discount_rank_requirement_fkey', N'voucher_voucher_rank_requirement_fkey', N'OBJECT';

    IF OBJECT_ID(N'dbo.discount_discount_status_id_fkey') IS NOT NULL AND OBJECT_ID(N'dbo.voucher_voucher_status_id_fkey') IS NULL
        EXEC sp_rename N'dbo.discount_discount_status_id_fkey', N'voucher_voucher_status_id_fkey', N'OBJECT';

    IF OBJECT_ID(N'dbo.discount_discount_type_id_fkey') IS NOT NULL AND OBJECT_ID(N'dbo.voucher_voucher_type_id_fkey') IS NULL
        EXEC sp_rename N'dbo.discount_discount_type_id_fkey', N'voucher_voucher_type_id_fkey', N'OBJECT';

    IF OBJECT_ID(N'dbo.order_discount_id_fkey') IS NOT NULL AND OBJECT_ID(N'dbo.order_voucher_id_fkey') IS NULL
        EXEC sp_rename N'dbo.order_discount_id_fkey', N'order_voucher_id_fkey', N'OBJECT';

    IF OBJECT_ID(N'dbo.user_discount_discount_id_fkey') IS NOT NULL AND OBJECT_ID(N'dbo.user_voucher_voucher_id_fkey') IS NULL
        EXEC sp_rename N'dbo.user_discount_discount_id_fkey', N'user_voucher_voucher_id_fkey', N'OBJECT';

    IF OBJECT_ID(N'dbo.user_discount_user_id_fkey') IS NOT NULL AND OBJECT_ID(N'dbo.user_voucher_user_id_fkey') IS NULL
        EXEC sp_rename N'dbo.user_discount_user_id_fkey', N'user_voucher_user_id_fkey', N'OBJECT';

    IF EXISTS (
        SELECT 1
        FROM sys.tables
        WHERE name IN (N'discount', N'discount_status', N'discount_type', N'user_discount')
    )
        THROW 52004, 'Old discount tables still exist after migration.', 1;

    IF EXISTS (
        SELECT 1
        FROM sys.columns
        WHERE name IN (
            N'discount_id',
            N'discount_status_id',
            N'discount_type_id',
            N'discount_code',
            N'discount_value',
            N'discount_description',
            N'discount_rank_requirement',
            N'discount_minimum_order_value',
            N'discount_maximum_value',
            N'discount_usage_limit',
            N'discount_start_date',
            N'discount_end_date',
            N'discount_created_at',
            N'discount_updated_at',
            N'discount_usage_count',
            N'discount_status_name',
            N'discount_type_name',
            N'is_discount_used',
            N'discount_used_at'
        )
    )
        THROW 52005, 'Old discount columns still exist after migration.', 1;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
GO

SELECT name AS voucher_table
FROM sys.tables
WHERE name IN (N'voucher', N'voucher_status', N'voucher_type', N'user_voucher')
ORDER BY name;

SELECT OBJECT_NAME(object_id) AS table_name, name AS voucher_column
FROM sys.columns
WHERE name LIKE N'%voucher%'
ORDER BY table_name, voucher_column;
GO
