const LIGHTNING_REGEXP = /@zap(?=\W|$)/gi

export default function (
  text?: string,
  lightningAddress?: string
): undefined | string {
  return text?.replace(
    LIGHTNING_REGEXP,
    `[⚡️Zap!](lightning:${lightningAddress})`
  )
}
