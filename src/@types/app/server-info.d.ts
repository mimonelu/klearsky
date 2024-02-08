interface TTServerInfo {
  inviteCodeRequired?: boolean
  phoneVerificationRequired?: boolean
  availableUserDomains: string[]
  links?: TTServerInfoLinks
}

interface TTServerInfoLinks {
  privacyPolicy?: string
  termsOfService?: string
}
