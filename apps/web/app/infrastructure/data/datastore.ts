import UserStore from '#datastore/stores/user'


class Datastore {
  declare users: UserStore

  constructor() {
    this.users = new UserStore()
  }

  async init() {

  }
}

const datastore = new Datastore()
export default datastore
