package database

import (
	"log"
)

// Migrate runs all DDL statements to ensure the schema is up to date.
// Safe to run multiple times (idempotent via IF NOT EXISTS pattern).
func Migrate() {
	statements := []string{
		`IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AnalysisLogs' AND xtype='U')
		CREATE TABLE AnalysisLogs (
			LogID            UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
			Timestamp        DATETIME         NOT NULL DEFAULT GETUTCDATE(),
			FileSizeKB       INT              NOT NULL,
			FileType         VARCHAR(10)      NOT NULL,
			ProcessingTimeMs INT              NOT NULL,
			OverallScore     INT              NULL,
			Status           VARCHAR(20)      NOT NULL,
			ErrorMessage     NVARCHAR(MAX)    NULL
		)`,

		`IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ApiUsageLogs' AND xtype='U')
		CREATE TABLE ApiUsageLogs (
			LogID            UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
			AnalysisLogID    UNIQUEIDENTIFIER NOT NULL REFERENCES AnalysisLogs(LogID),
			Model            VARCHAR(50)      NOT NULL,
			PromptTokens     INT              NULL,
			CompletionTokens INT              NULL,
			TotalTokens      INT              NULL,
			CostUSD          DECIMAL(10,6)    NULL,
			CreatedAt        DATETIME         NOT NULL DEFAULT GETUTCDATE()
		)`,
	}

	for _, stmt := range statements {
		if _, err := DB.Exec(stmt); err != nil {
			log.Fatalf("Migration failed: %v\nStatement: %s", err, stmt)
		}
	}

	log.Println("Database migrations applied successfully")
}
