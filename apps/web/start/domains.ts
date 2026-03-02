import env from '#start/env'

export const primaryDomain = env.get('PRIMARY_DOMAIN', 'localhost:3333')
export const appDomain = env.get('APP_DOMAIN', 'localhost:3333')
