<template>
  <div
    v-if="scheme != null"
    class="feed-generator-label"
  >
    <a
      class="textlink--icon"
      :href="scheme.href"
      rel="noreferrer"
      target="_blank"
    >
      <LazyImage
        v-if="scheme.favicon != null"
        :src="scheme.favicon"
      />
      <SVGIcon
        v-else
        name="feed"
      />
      <span translate="no">{{ scheme.label }}</span>
    </a>
  </div>
</template>

<script lang="ts" setup>
import LazyImage from "@/components/images/LazyImage.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const SCHEMES: {
  [did: string]: {
    label: string
    href: string
    favicon?: string
  }
} = {
  "did:web:api.graze.social": {
    label: "Graze",
    href: "https://www.graze.social/",
    favicon: "https://www.graze.social/favicon.svg",
  },
  "did:web:blueskyfeedcreator.com": {
    label: "Bluesky Feed Creator",
    href: "https://blueskyfeedcreator.com/",
    favicon: "https://blueskyfeedcreator.com/favicon.ico",
  },
  "did:web:skyfeed.me": {
    label: "SkyFeed",
    href: "https://skyfeed.app/",
    favicon: "https://skyfeed.app/favicon-32x32.png",
  },
  "did:web:track.goodfeeds.co": {
    label: "goodfeeds",
    href: "https://goodfeeds.jcsalterego.workers.dev/",
  },
  "did:web:www.bluefeed.app": {
    label: "Bluefeed",
    href: "https://www.bluefeed.app/",
    favicon: "https://www.bluefeed.app/favicon.ico",
  },
}

const props = defineProps<{
  did: string
}>()

const scheme = SCHEMES[props.did]
</script>

<style lang="scss" scoped>
.feed-generator-label {
  display: contents;
}

a {
  line-height: var(--line-height-high);
  word-break: break-word;
}

.lazy-image,
.svg-icon {
  width: 1em;
  min-width: 1em;
  height: 1em;
  max-height: 1em;
}
</style>
