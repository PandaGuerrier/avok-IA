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
      table.string('password').nullable()
      table.string('avatar_url').nullable().defaultTo(null)
      table.json('avatar').nullable()
      table.json('preferences').defaultTo(
        JSON.stringify({
          anonyme_rules_view: false,
          onboarding_completed: false,
        })
      )

      table.integer('year').nullable()
      table.string('program').nullable()
      table.string('track').nullable()
      table.string('campus').nullable()

      table.boolean('is_banned').notNullable().defaultTo(false)
      table.uuid('ban_uuid').nullable().defaultTo(null)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
