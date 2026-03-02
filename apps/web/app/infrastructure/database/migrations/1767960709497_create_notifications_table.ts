import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notifications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('uuid')
      table.string('user_uuid').notNullable().index()
      table.string('title').notNullable()
      table.text('message').notNullable()
      table.boolean('is_read').notNullable().defaultTo(false)
      table.string('link').nullable()
      table.string('type').notNullable().defaultTo('default')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
