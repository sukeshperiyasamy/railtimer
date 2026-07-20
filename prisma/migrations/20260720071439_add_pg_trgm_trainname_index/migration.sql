-- Enable trigram matching so ILIKE '%...%' searches on Train.trainName and
-- Train.trainNumber use a GIN index instead of a sequential scan. Not
-- expressible in schema.prisma directly (would need the
-- postgresqlExtensions preview feature + native GIN/gin_trgm_ops support),
-- so this is a hand-written migration.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "Train_trainName_trgm_idx"
  ON "Train" USING GIN ("trainName" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Train_trainNumber_trgm_idx"
  ON "Train" USING GIN ("trainNumber" gin_trgm_ops);