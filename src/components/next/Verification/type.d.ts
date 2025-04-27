interface TIVerification {
  trustedVerifierStatus: "none" | "valid"
  verifications: TIVerifier[]
  verifiedStatus: "none" | "valid"
}

interface TIVerifier {
  createdAt: string
  issuer: string
  isValid: boolean
  uri: string
}

interface TIVerifiersPopupProps {
  display: boolean
  displayName?: string
  verification?: TIVerification
}

interface TIVerifiedAccountsPopupProps {
  display: boolean
  did?: string
  displayName?: string
}
