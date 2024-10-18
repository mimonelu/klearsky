import type { ChatBskyConvoDefs, ChatBskyConvoSendMessage } from "@atproto/api"
import { RichText } from "@atproto/api"
import Util from "@/composables/util"

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
  const message: ChatBskyConvoDefs.MessageInput = { text: params.text ?? "" }

  // Zapリンク
  if (params.lightning) {
    message.text = Util.makeLightningLinks(
      message.text,
      params.lightning
    ) ?? message.text
  }

  // カスタムリンク
  const customLinks = Util.makeCustomLinks(message.text)
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
  const embedResult = await Util.createEmbed(this, message, params)
  if (embedResult instanceof Error) {
    return embedResult
  }

  const query: ChatBskyConvoSendMessage.InputSchema = {
    convoId,
    message,
  }
  const options: ChatBskyConvoSendMessage.CallOptions = {
    headers: {},
    encoding: "application/json",
  }
  if (options.headers != null && this.proxies.chat != null) {
    options.headers["atproto-proxy"] = this.proxies.chat
  }
  const response: Error | ChatBskyConvoSendMessage.Response =
    await this.agent.api.chat.bsky.convo.sendMessage(query, options)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/api.chat.bsky.convo.sendMessage]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data as TIChatMessage
}
