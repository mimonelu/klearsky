<script lang="ts" setup>
import { inject } from "vue"

const mainState = inject("state") as MainState

const props = defineProps<{
  did?: string
  cid?: string
}>()

let host: undefined | string
if (props.did != null && props.cid != null) {
  const logJson = await mainState.atp.fetchLogAudit(props.did)
  if (logJson != null) {
    host = (
      Array.isArray(logJson)
        // did:plc:
        ? logJson[0]?.operation?.services?.atproto_pds?.endpoint

        // did:plc: 以外
        : logJson?.didDocument?.service?.[0]?.serviceEndpoint
    ) ?? host
  }
}
</script>

<template>
  <video
    autoplay
    controls
    loading="lazy"
    loop
    preload="metadata"
    width="100%"
  >
    <source
      :src="`${host}/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${cid}`"
      type="video/mp4"
    />
  </video>
</template>
