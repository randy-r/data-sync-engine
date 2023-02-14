CREATE TYPE "sync-run-type" AS ENUM (
  'done',
  'done-with-errors',
  'in-progress'
);

CREATE TABLE "sync-runs" (
  id integer NOT NULL,
  started_at timestamp with time zone NOT NULL DEFAULT NOW(),
  finished_at timestamp with time zone,
  type "sync-run-type"
);

CREATE SEQUENCE "sync-run-id-seq" START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER SEQUENCE "sync-run-id-seq" OWNED BY "sync-runs".id;

ALTER TABLE
  ONLY "sync-runs"
ADD
  CONSTRAINT "sync-runs-pk" PRIMARY KEY (id);

ALTER TABLE
  ONLY "sync-runs"
ALTER COLUMN
  id
SET
  DEFAULT nextval('sync-run-id-seq' :: regclass);