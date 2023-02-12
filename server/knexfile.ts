import type { Knex } from "knex";
import dotenv from "dotenv"
dotenv.config();

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {

  production: {
    client: "postgresql",
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  }

};

module.exports = config;
