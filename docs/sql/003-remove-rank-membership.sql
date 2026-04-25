USE [Unleashed];
GO

SET XACT_ABORT ON;
GO

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @sql nvarchar(max) = N'';

    SELECT @sql = @sql
        + N'ALTER TABLE '
        + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id))
        + N'.'
        + QUOTENAME(OBJECT_NAME(parent_object_id))
        + N' DROP CONSTRAINT '
        + QUOTENAME(name)
        + N';' + CHAR(13) + CHAR(10)
    FROM sys.foreign_keys
    WHERE referenced_object_id = OBJECT_ID(N'dbo.rank')
       OR parent_object_id = OBJECT_ID(N'dbo.user_rank');

    IF LEN(@sql) > 0
        EXEC sp_executesql @sql;

    SET @sql = N'';

    SELECT @sql = @sql
        + N'ALTER TABLE '
        + QUOTENAME(OBJECT_SCHEMA_NAME(dc.parent_object_id))
        + N'.'
        + QUOTENAME(OBJECT_NAME(dc.parent_object_id))
        + N' DROP CONSTRAINT '
        + QUOTENAME(dc.name)
        + N';' + CHAR(13) + CHAR(10)
    FROM sys.default_constraints dc
    JOIN sys.columns c
        ON c.object_id = dc.parent_object_id
       AND c.column_id = dc.parent_column_id
    WHERE dc.parent_object_id = OBJECT_ID(N'dbo.voucher')
      AND c.name = N'voucher_rank_requirement';

    IF LEN(@sql) > 0
        EXEC sp_executesql @sql;

    IF COL_LENGTH(N'dbo.voucher', N'voucher_rank_requirement') IS NOT NULL
        ALTER TABLE dbo.voucher DROP COLUMN voucher_rank_requirement;

    IF OBJECT_ID(N'dbo.user_rank', N'U') IS NOT NULL
        DROP TABLE dbo.user_rank;

    IF OBJECT_ID(N'dbo.rank', N'U') IS NOT NULL
        DROP TABLE dbo.rank;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
GO
