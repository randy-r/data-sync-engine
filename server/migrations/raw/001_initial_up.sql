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

CREATE TABLE "stripe-customers" (
  id CHARACTER varying(64) NOT NULL,
  description CHARACTER varying(2048),
  name CHARACTER varying(512),
  email CHARACTER varying(512),
  account_id CHARACTER varying(64) NOT NULL,
  created_at timestamp with time zone NOT NULL,
  sync_run_id integer NOT NULL
);

ALTER TABLE
  ONLY "stripe-customers"
ADD
  CONSTRAINT "stripe-customers_pkey" PRIMARY KEY (id);

-- Dropping PK for demo purposes only, because we use the same access token for more stripe accounts
ALTER TABLE
  ONLY public."stripe-customers" DROP CONSTRAINT "stripe-customers_pkey";
ALTER TABLE
  ONLY "stripe-customers"
ADD
  CONSTRAINT "stripe-customers_sync-runs_fkey" FOREIGN KEY (sync_run_id) REFERENCES "sync-runs"(id);