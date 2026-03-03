import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'games'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('uuid').primary()
      table.boolean('is_finished').defaultTo(false)
      table.uuid('user_uuid').references('uuid').inTable('users').onDelete('CASCADE')
      table.float('guilty_pourcentage').defaultTo(98)
      table.json('data')
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
    
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}