type TTSession = {
  [index: string]: any
  accessJwt: string
  did: string
  handle: string
  email?: string
  emailConfirmed?: boolean
  emailAuthFactor?: boolean
  refreshJwt: string
  __service?: string // Injected
  __serviceName?: string // Injected
  __avatar?: string // Injected
}
