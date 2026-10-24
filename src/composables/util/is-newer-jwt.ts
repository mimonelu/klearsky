import { jwtDecode } from "jwt-decode"

// JWT a が JWT b より後に発行されたものかを返す（ b が無い場合は true ）
export default function (a?: string, b?: string): boolean {
  if (a == null) {
    return false
  }
  if (b == null) {
    return true
  }
  try {
    const payloadA = jwtDecode(a)
    const payloadB = jwtDecode(b)
    const timeA = payloadA.iat ?? payloadA.exp
    const timeB = payloadB.iat ?? payloadB.exp
    if (timeA == null || timeB == null) {
      return false
    }
    return timeA > timeB
  } catch (error) {
    return false
  }
}
