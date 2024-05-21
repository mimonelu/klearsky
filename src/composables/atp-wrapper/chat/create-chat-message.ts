import type { BskyAgent, ChatBskyConvoDefs, ChatBskyConvoSendMessage } from "@atproto/api"
import { RichText } from "@atproto/api"
import AtpUtil from "@/composables/atp-wrapper/atp-util"

export default async function (
  this: TIAtpWrapper,
  convoId: string,
  params: TTCreatePostParams
): Promise<Error | TIChatMessage> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const headers = { "atproto-proxy": "did:web:api.bsky.chat#bsky_chat" }
  const message: ChatBskyConvoDefs.Message = { text: params.text ?? "" }

  // Zapリンク
  if (params.lightning != null) {
    message.text = message.text.replace(/@zap(?=\W|$)/gi, `[⚡️Zap!](lightning:${params.lightning})`)
  }

  // カスタムリンク
  const customLinks = AtpUtil.makeCustomLinks(message.text)
  message.text = customLinks.text
  if (customLinks.facets.length > 0) {
    message.facets = customLinks.facets
  }

  // Facets
  const richText = new RichText({ text: message.text })
  await richText.detectFacets(this.agent)
  message.text = richText.text
  if (richText.facets != null) {
    if (message.facets != null) {
      message.facets.push(...richText.facets)
    } else {
      message.facets = richText.facets
    }
  }

  // Embed
  const embedResult = await AtpUtil.createEmbed(this, message, params)
  if (embedResult instanceof Error) {
    return embedResult
  }

  const query: ChatBskyConvoSendMessage.InputSchema = {
    convoId,
    message,
  }
  const response = await (this.agent as BskyAgent).api.chat.bsky.convo
    .sendMessage(query, {
      headers,
      encoding: "application/json",
    })
      .then((value: ChatBskyConvoSendMessage.Response) => value)
      .catch((error: Error) => error)
  console.log("[klearsky/api.chat.bsky.convo.sendMessage]", response)
  if (response instanceof Error) {
    return response
  }
  return response.data
}
