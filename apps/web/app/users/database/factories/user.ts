import Factory from '@adonisjs/lucid/factories'

import User from '#users/models/user'

export const UserFactory = Factory.define(User, ({ faker }) => {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    age: faker.number.int({ min: 18, max: 99 }),
    pseudo: faker.internet.username(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  }
}).build()
