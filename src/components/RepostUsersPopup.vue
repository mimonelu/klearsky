<script lang="ts" setup>
import { inject, onBeforeMount, reactive } from "vue"
import { useRouter } from "vue-router"
import LoadButton from "@/components/LoadButton.vue"
import Popup from "@/components/Popup.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import UserBox from "@/components/UserBox.vue"
import Util from "@/composables/util/index"

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
}>({
  processing: false
})

const router = useRouter()

onBeforeMount(async () => {
  await fetchContinuousResults("new")
})

function close () {
  emit("close")
}

async function openProfile (handle: string) {
  close()
  await router.push({ name: "profile-post", query: { handle } })
}

async function fetchContinuousResults (direction: "new" | "old") {
  Util.blurElement()
  if (state.processing) return
  state.processing = true
  try {
    await mainState.fetchRepostUsers(direction)
  } finally {
    state.processing = false
  }
}
</script>

<template>
  <Popup
    class="repost-users-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template v-slot:header>
      <h2>
        <SVGIcon name="repost" />
        <span>{{ $t("repostUsers") }}</span>
      </h2>
    </template>
    <template v-slot:body>
      <div class="users">
        <UserBox
          v-for="user of mainState.currentRepostUsers"
          :key="user.did"
          class="user"
          :user="user"
          @click.prevent="openProfile(user.handle)"
        />
      </div>
    </template>
    <template v-slot:footer>
      <LoadButton
        direction="old"
        :processing="state.processing"
        @activate="fetchContinuousResults('old')"
      />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.repost-users-popup:deep() {
  .popup {
    width: calc($router-view-width - 2rem);
    max-height: calc(100vh - 8rem);

    &-header {
      & > h2 {
        color: rgb(var(--share-color));

        & > .svg-icon {
          fill: rgb(var(--share-color));
        }
      }
    }

    &-body > .users {
      display: flex;
      flex-direction: column;
      grid-gap: 1rem;

      & > .user-box {
        cursor: pointer;
      }
    }
  }
}
</style>
