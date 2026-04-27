IF COL_LENGTH('dbo.[transaction]', 'transaction_note') IS NULL
BEGIN
    ALTER TABLE dbo.[transaction]
    ADD transaction_note NVARCHAR(500) NULL;
END;
GO
