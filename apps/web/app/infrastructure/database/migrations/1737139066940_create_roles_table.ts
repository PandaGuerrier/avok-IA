import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'roles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('uuid').primary()
      table.string('name', 50).notNullable()
      table.string('description', 255).nullable()

      table.json('permissions').notNullable().defaultTo('[]')
      table.string('tag', 50).nullable()
      table.string('tag_color', 60).nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
