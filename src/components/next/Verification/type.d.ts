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
