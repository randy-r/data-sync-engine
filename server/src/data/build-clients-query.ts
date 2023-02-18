export function buildClientsQuery(filters?: {
  emailSearch?: string;
  account_id: string;
}): string {
  const statement = `SELECT
  u.*,
  sr.finished_at synced_at
FROM
  (
    SELECT
      id,
      email,
      name,
      created_at,
      sync_run_id,
      account_id,
      'stripe' AS source
    FROM
      public."stripe-customers"
    UNION
    ALL
    SELECT
      id,
      email,
      CASE
        TRIM(CONCAT("first_name", ' ', "last_name"))
        WHEN '' THEN NULL
        ELSE TRIM(CONCAT("first_name", ' ', "last_name"))
      END AS name,
      created_at,
      sync_run_id,
      account_id,
      'hubspot' AS source
    FROM
      public."hubspot-contacts"
  ) u
  INNER JOIN public."sync-runs" sr ON sr.id = u.sync_run_id
  ${
    filters
      ? `WHERE u.account_id = E'${filters.account_id}'${
          filters?.emailSearch
            ? ` AND u.email ILIKE E'%${filters.emailSearch}%'`
            : ''
        }`
      : ''
  }
  ;`;

  return statement;
}
