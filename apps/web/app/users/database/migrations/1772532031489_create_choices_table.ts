import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'choices'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('uuid').primary()
      table.uuid('game_uuid').references('uuid').inTable('games').onDelete('CASCADE')
      table.json('data')
      table.text('response')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
