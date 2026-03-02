import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('uuid').notNullable().primary()
      table
        .uuid('role_uuid')
        .unsigned()
        .references('uuid')
        .inTable('roles')
        .nullable()

      table.string('full_name').nullable()
      table.string('email', 254).notNullable().unique()
      table.boolean('is_email_verified').notNullable().defaultTo(false)
      table.boolean('is_fully_configured').notNullable().defaultTo(false)

      table.string('password').nullable()

      table.string('avatar_url').nullable().defaultTo(null)
      table.json('avatar').nullable()

      table.string('provider').nullable().defaultTo("email")
      table.json('preferences').defaultTo(
        JSON.stringify({})
      )

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
