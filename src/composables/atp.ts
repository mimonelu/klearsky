import AtpAgent from "@atproto/api"
import type {
  AtpSessionEvent,
  AtpSessionData,
  AppBskyActorUpdateProfile,
  ComAtprotoBlobUpload
} from "@atproto/api"

const getUint8Array = (file: File): Promise<null | Uint8Array> =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = (event: ProgressEvent) => {
      if (event.target == null) reject(null)
      const buffer: null | string | ArrayBuffer = (event.target as FileReader).result ?? null
      if (buffer == null) reject(null)
      resolve(new Uint8Array(buffer as ArrayBuffer))
    }
    fileReader.readAsArrayBuffer(file)
  })

type ImageObject = {
  cid: string;
  mimeType: string;
}

const getImageObject = async (agent: AtpAgent, file: File): Promise<null | ImageObject> => {
  if (file == null) return null
  const image: null | Uint8Array = await getUint8Array(file)
  if (image == null) return null
  const response: ComAtprotoBlobUpload.Response = await agent.api.com.atproto.blob.upload(image, {
    encoding: file.type,
  })
  return {
    cid: response.data.cid,
    mimeType: file.type,
  }
}

export default class {
  session: null | AtpSessionData = null

  contsructor () {
    this.session = null
  }

  async updateProfile ({
    service,
    email,
    password,
    avatar,
    banner
  }: {
    service: string
    email: string
    password: string
    avatar: null | File
    banner: null | File
  }): Promise<boolean> {
    try {
      const agent = new AtpAgent({
        service,
        persistSession: (event: AtpSessionEvent, session?: AtpSessionData) => {
          if (event !== "create" && event !== "update") return
          this.session = session != null ? session as AtpSessionData : null
        },
      })

      await agent.login({
        identifier: email,
        password,
      })

      if (this.session == null) return false

      const profile = (await agent.api.app.bsky.actor.getProfile({ actor: this.session.did })).data

      const avatarObject: null | ImageObject = avatar != null
        ? await getImageObject(agent, avatar)
        : null

      const bannerObject: null | ImageObject = banner != null
        ? await getImageObject(agent, banner)
        : null

      const profileObject: AppBskyActorUpdateProfile.InputSchema = {
        displayName: profile.displayName,
        description: profile.description,
      }
      if (avatarObject != null) profileObject.avatar = avatarObject
      if (bannerObject != null) profileObject.banner = bannerObject

      const response: AppBskyActorUpdateProfile.Response = await agent.api.app.bsky.actor.updateProfile(profileObject)

      return response?.success ?? false
    } catch (error: any) {
      console.error(error)
      return false
    }
  }
}
