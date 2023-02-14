import { Knex } from 'knex';
import fs from 'fs/promises';
import path from 'path';

export async function up(knex: Knex): Promise<void> {
  const fileContents = await fs.readFile(
    path.join(__dirname, './raw/001_initial_up.sql')
  );
  const statement = fileContents.toString();
  await knex.raw(statement);
}

export async function down(knex: Knex): Promise<void> {
  const fileContents = await fs.readFile(
    path.join(__dirname, './raw/001_initial_down.sql')
  );
  const statement = fileContents.toString();
  await knex.raw(statement);
}
