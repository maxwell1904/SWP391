/*
  Rename Sale domain to Promotion for SQL Server.

  Run this once on each local Unleashed database after pulling the code that
  expects promotion_* tables/columns. Back up the database before running.
*/

USE [Unleashed];
GO

SET XACT_ABORT ON;
GO

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID(N'dbo.sale', N'U') IS NOT NULL AND OBJECT_ID(N'dbo.promotion', N'U') IS NOT NULL
        THROW 51000, 'Both dbo.sale and dbo.promotion exist. Resolve duplicate tables before running migration.', 1;

    IF OBJECT_ID(N'dbo.sale_product', N'U') IS NOT NULL AND OBJECT_ID(N'dbo.promotion_product', N'U') IS NOT NULL
        THROW 51001, 'Both dbo.sale_product and dbo.promotion_product exist. Resolve duplicate tables before running migration.', 1;

    IF OBJECT_ID(N'dbo.sale_status', N'U') IS NOT NULL AND OBJECT_ID(N'dbo.promotion_status', N'U') IS NOT NULL
        THROW 51002, 'Both dbo.sale_status and dbo.promotion_status exist. Resolve duplicate tables before running migration.', 1;

    IF OBJECT_ID(N'dbo.sale_type', N'U') IS NOT NULL AND OBJECT_ID(N'dbo.promotion_type', N'U') IS NOT NULL
        THROW 51003, 'Both dbo.sale_type and dbo.promotion_type exist. Resolve duplicate tables before running migration.', 1;

    IF OBJECT_ID(N'dbo.sale', N'U') IS NOT NULL
        EXEC sp_rename N'dbo.sale', N'promotion';

    IF OBJECT_ID(N'dbo.sale_product', N'U') IS NOT NULL
        EXEC sp_rename N'dbo.sale_product', N'promotion_product';

    IF OBJECT_ID(N'dbo.sale_status', N'U') IS NOT NULL
        EXEC sp_rename N'dbo.sale_status', N'promotion_status';

    IF OBJECT_ID(N'dbo.sale_type', N'U') IS NOT NULL
        EXEC sp_rename N'dbo.sale_type', N'promotion_type';

    IF COL_LENGTH(N'dbo.promotion', N'sale_id') IS NOT NULL AND COL_LENGTH(N'dbo.promotion', N'promotion_id') IS NULL
        EXEC sp_rename N'dbo.promotion.sale_id', N'promotion_id', N'COLUMN';

    IF COL_LENGTH(N'dbo.promotion', N'sale_type_id') IS NOT NULL AND COL_LENGTH(N'dbo.promotion', N'promotion_type_id') IS NULL
        EXEC sp_rename N'dbo.promotion.sale_type_id', N'promotion_type_id', N'COLUMN';

    IF COL_LENGTH(N'dbo.promotion', N'sale_status_id') IS NOT NULL AND COL_LENGTH(N'dbo.promotion', N'promotion_status_id') IS NULL
        EXEC sp_rename N'dbo.promotion.sale_status_id', N'promotion_status_id', N'COLUMN';

    IF COL_LENGTH(N'dbo.promotion', N'sale_value') IS NOT NULL AND COL_LENGTH(N'dbo.promotion', N'promotion_value') IS NULL
        EXEC sp_rename N'dbo.promotion.sale_value', N'promotion_value', N'COLUMN';

    IF COL_LENGTH(N'dbo.promotion', N'sale_start_date') IS NOT NULL AND COL_LENGTH(N'dbo.promotion', N'promotion_start_date') IS NULL
        EXEC sp_rename N'dbo.promotion.sale_start_date', N'promotion_start_date', N'COLUMN';

    IF COL_LENGTH(N'dbo.promotion', N'sale_end_date') IS NOT NULL AND COL_LENGTH(N'dbo.promotion', N'promotion_end_date') IS NULL
        EXEC sp_rename N'dbo.promotion.sale_end_date', N'promotion_end_date', N'COLUMN';

    IF COL_LENGTH(N'dbo.promotion', N'sale_created_at') IS NOT NULL AND COL_LENGTH(N'dbo.promotion', N'promotion_created_at') IS NULL
        EXEC sp_rename N'dbo.promotion.sale_created_at', N'promotion_created_at', N'COLUMN';

    IF COL_LENGTH(N'dbo.promotion', N'sale_updated_at') IS NOT NULL AND COL_LENGTH(N'dbo.promotion', N'promotion_updated_at') IS NULL
        EXEC sp_rename N'dbo.promotion.sale_updated_at', N'promotion_updated_at', N'COLUMN';

    IF COL_LENGTH(N'dbo.promotion_product', N'sale_id') IS NOT NULL AND COL_LENGTH(N'dbo.promotion_product', N'promotion_id') IS NULL
        EXEC sp_rename N'dbo.promotion_product.sale_id', N'promotion_id', N'COLUMN';

    IF COL_LENGTH(N'dbo.promotion_status', N'sale_status_id') IS NOT NULL AND COL_LENGTH(N'dbo.promotion_status', N'promotion_status_id') IS NULL
        EXEC sp_rename N'dbo.promotion_status.sale_status_id', N'promotion_status_id', N'COLUMN';

    IF COL_LENGTH(N'dbo.promotion_status', N'sale_status_name') IS NOT NULL AND COL_LENGTH(N'dbo.promotion_status', N'promotion_status_name') IS NULL
        EXEC sp_rename N'dbo.promotion_status.sale_status_name', N'promotion_status_name', N'COLUMN';

    IF COL_LENGTH(N'dbo.promotion_type', N'sale_type_id') IS NOT NULL AND COL_LENGTH(N'dbo.promotion_type', N'promotion_type_id') IS NULL
        EXEC sp_rename N'dbo.promotion_type.sale_type_id', N'promotion_type_id', N'COLUMN';

    IF COL_LENGTH(N'dbo.promotion_type', N'sale_type_name') IS NOT NULL AND COL_LENGTH(N'dbo.promotion_type', N'promotion_type_name') IS NULL
        EXEC sp_rename N'dbo.promotion_type.sale_type_name', N'promotion_type_name', N'COLUMN';

    IF COL_LENGTH(N'dbo.order_variation_single', N'sale_id') IS NOT NULL AND COL_LENGTH(N'dbo.order_variation_single', N'promotion_id') IS NULL
        EXEC sp_rename N'dbo.order_variation_single.sale_id', N'promotion_id', N'COLUMN';

    IF OBJECT_ID(N'dbo.sale_pkey') IS NOT NULL AND OBJECT_ID(N'dbo.promotion_pkey') IS NULL
        EXEC sp_rename N'dbo.sale_pkey', N'promotion_pkey', N'OBJECT';

    IF OBJECT_ID(N'dbo.sale_product_pkey') IS NOT NULL AND OBJECT_ID(N'dbo.promotion_product_pkey') IS NULL
        EXEC sp_rename N'dbo.sale_product_pkey', N'promotion_product_pkey', N'OBJECT';

    IF OBJECT_ID(N'dbo.sale_status_pkey') IS NOT NULL AND OBJECT_ID(N'dbo.promotion_status_pkey') IS NULL
        EXEC sp_rename N'dbo.sale_status_pkey', N'promotion_status_pkey', N'OBJECT';

    IF OBJECT_ID(N'dbo.sale_type_pkey') IS NOT NULL AND OBJECT_ID(N'dbo.promotion_type_pkey') IS NULL
        EXEC sp_rename N'dbo.sale_type_pkey', N'promotion_type_pkey', N'OBJECT';

    IF OBJECT_ID(N'dbo.sale_sale_status_id_fkey') IS NOT NULL AND OBJECT_ID(N'dbo.promotion_promotion_status_id_fkey') IS NULL
        EXEC sp_rename N'dbo.sale_sale_status_id_fkey', N'promotion_promotion_status_id_fkey', N'OBJECT';

    IF OBJECT_ID(N'dbo.sale_sale_type_id_fkey') IS NOT NULL AND OBJECT_ID(N'dbo.promotion_promotion_type_id_fkey') IS NULL
        EXEC sp_rename N'dbo.sale_sale_type_id_fkey', N'promotion_promotion_type_id_fkey', N'OBJECT';

    IF OBJECT_ID(N'dbo.sale_product_product_id_fkey') IS NOT NULL AND OBJECT_ID(N'dbo.promotion_product_product_id_fkey') IS NULL
        EXEC sp_rename N'dbo.sale_product_product_id_fkey', N'promotion_product_product_id_fkey', N'OBJECT';

    IF OBJECT_ID(N'dbo.sale_product_sale_id_fkey') IS NOT NULL AND OBJECT_ID(N'dbo.promotion_product_promotion_id_fkey') IS NULL
        EXEC sp_rename N'dbo.sale_product_sale_id_fkey', N'promotion_product_promotion_id_fkey', N'OBJECT';

    IF EXISTS (
        SELECT 1
        FROM sys.tables
        WHERE name IN (N'sale', N'sale_product', N'sale_status', N'sale_type')
    )
        THROW 51004, 'Old sale tables still exist after migration.', 1;

    IF EXISTS (
        SELECT 1
        FROM sys.columns
        WHERE name IN (
            N'sale_id',
            N'sale_type_id',
            N'sale_status_id',
            N'sale_value',
            N'sale_start_date',
            N'sale_end_date',
            N'sale_created_at',
            N'sale_updated_at',
            N'sale_status_name',
            N'sale_type_name'
        )
    )
        THROW 51005, 'Old sale columns still exist after migration.', 1;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
GO

SELECT name AS promotion_table
FROM sys.tables
WHERE name IN (N'promotion', N'promotion_product', N'promotion_status', N'promotion_type')
ORDER BY name;

SELECT OBJECT_NAME(object_id) AS table_name, name AS promotion_column
FROM sys.columns
WHERE name LIKE N'%promotion%'
ORDER BY table_name, promotion_column;
GO
