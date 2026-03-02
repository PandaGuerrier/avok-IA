import User from '#users/models/user'

export default class AbilitiesService {
  public async getAllAbilities(user: User) {
    return user.role.permissions
  }
}
