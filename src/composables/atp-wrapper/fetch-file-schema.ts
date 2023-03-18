import type { ComAtprotoBlobUpload } from "@atproto/api"
import { getFileAsUint8Array } from "@/composables/atp-wrapper/services"

export default async function (
  this: AbstractAtpWrapper,
  file: File
): Promise<null | FileSchema> {
  if (this.agent == null) return null
  if (file == null) return null
  const data: null | Uint8Array = await getFileAsUint8Array(file)
  if (data == null) return null
  const response: ComAtprotoBlobUpload.Response =
    await this.agent.api.com.atproto.blob.upload(data, {
      encoding: file.type,
    })
  console.log("[klearsky/fetchFileSchema]", response)
  if (!response.success) return null
  return {
    cid: response.data.cid,
    mimeType: file.type,
  }
}
