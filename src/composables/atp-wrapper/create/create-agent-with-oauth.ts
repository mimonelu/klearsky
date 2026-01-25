import { Agent } from "@atproto/api"
import type { AtpAgent } from "@atproto/api"
import type { OAuthSession } from "@atproto/oauth-client-browser"

export default function (
  this: TIAtpWrapper,
  oauthSession: OAuthSession
): boolean {
  // OAuthセッションからAgentを作成
  // Agent は AtpAgent の親クラスで、API呼び出しメソッドを全て持っている
  // 型アサーションで AtpAgent として扱う（既存コードとの互換性のため）
  this.agent = new Agent(oauthSession) as AtpAgent
  // authType は MySession.updateSession() で設定される
  return this.agent != null
}
