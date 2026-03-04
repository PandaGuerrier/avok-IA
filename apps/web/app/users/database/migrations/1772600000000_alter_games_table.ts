import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'games'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('start_time').nullable()
      table.boolean('is_paused').defaultTo(false)
      table.timestamp('paused_at').nullable()
      table.bigInteger('total_paused_ms').defaultTo(0)
      table.json('current_choices').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('start_time')
      table.dropColumn('is_paused')
      table.dropColumn('paused_at')
      table.dropColumn('total_paused_ms')
      table.dropColumn('current_choices')
    })
  }
}
