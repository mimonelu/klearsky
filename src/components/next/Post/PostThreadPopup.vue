<script lang="ts" setup>
import { inject } from "vue"
import Popup from "@/components/popups/Popup.vue"
import PostThread from "@/components/next/Post/PostThread.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits(["close", "removeThisPost"])

const mainState = inject("state") as MainState

function close () {
  emit("close")
}

function removeThisPost (uri: string) {
  mainState.postThreadPopupProps.posts =
    mainState.postThreadPopupProps.posts.filter((post: TTPost) => {
      return post.uri !== uri
    })
}
</script>

<template>
  <Popup
    class="post-thread-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="posts" />
        <span>{{ $t("post") }}</span>
      </h2>
    </template>
    <template #body>
      <PostThread
        :posts="mainState.postThreadPopupProps.posts"
        :focusPostUri="mainState.postThreadPopupProps.focusPostUri"
        @removeThisPost="removeThisPost"
      />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.post-thread-popup:deep() {
  .popup-body {
    grid-gap: 0;
    padding: 0;
  }

  // ScrollObserver が最後の要素にあるため
  .post:nth-last-child(2)::before {
    display: none;
  }
}
</style>
