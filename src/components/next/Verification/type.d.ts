interface TIVerification {
  trustedVerifierStatus: "none" | "trusted"
  verifications: TIVerifier[]
  verifiedStatus: "none" | "valid"
}

interface TIVerifier {
  createdAt: string
  issuer: string
  isValid: boolean
  uri: string
}
