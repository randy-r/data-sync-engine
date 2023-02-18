# Data Sync Engine

## Server

### Installation

Requires node v16 or higher.

In a terminal type the following:

```
cd ./server && npm i
```

Populate the `.env` file with the corresponding values. Take a look at `.env.template` for the required variables.
For the `DATABASE_URL` make sure you have the database created before running the migrations.

```
npm run -- knex migrate:latest --env production
```

### Running

```
npm run build
```

```
npm run start
```

### Calling the API

**Trigger a synchronization run:**

```
POST /api/sync
```

Based on the value for `SYNC_ALLOWED_INTERVAL_MS` it will start a new one, or if the current one is still in progress. The run is executed in the background after the http request has finished, thus new data will be available with a delay after the sync request.

*Example:*

Request:

```
curl -X POST http://localhost:3001/api/sync | json_pp
```

Response:

```
{
   "finished_at" : null,
   "id" : 1,
   "started_at" : "2023-02-18T20:43:04.648Z",
   "type" : "in-progress"
}

```

**Reading the synchronization results saved in database:**

```
GET /api/accounts/:id/clients?email=
```

`client` is the term for the common ground or the intersection between the third party data entries.
`:id` is the key from the map that contained the access tokens, it is case sensitive. `email=` is an optional query string parameter for matching a substring in an email, regardless of casing.

*Example:*

Request:

```
curl -X GET http://localhost:3001/api/accounts/Jane/clients?email=maria | json_pp
```

Response:

```
[
   {
      "account_id" : "Jane",
      "created_at" : "2023-02-18T09:45:53.156Z",
      "email" : "emailmaria@hubspot.com",
      "id" : "1",
      "name" : "Maria Johnson (Sample Contact)",
      "source" : "hubspot",
      "sync_run_id" : 1,
      "synced_at" : "2023-02-18T20:43:07.975Z"
   }
]
```

### Tests

```
npm run test
```
