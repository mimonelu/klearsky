<script lang="ts" setup>
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import UserBox from "@/components/compositions/UserBox.vue"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  myConvo?: TIMyConvo
}>()

function close () {
  emit("close")
}
</script>

<template>
  <Popup
    class="chat-members-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="people" />
        <span>{{ $t("chatMembers") }}</span>
      </h2>
    </template>
    <template #body>
      <div class="users">
        <UserBox
          v-for="user of myConvo?.data?.members"
          :key="user.did"
          class="user"
          :user="user"
          :menuDisplay="true"
          :contentWarningDisabled="true"
          :viewerDisplay="true"
        />
      </div>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.chat-members-popup:deep() {
  .popup {
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
