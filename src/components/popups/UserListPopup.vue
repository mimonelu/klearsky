<script lang="ts" setup>
import { inject } from "vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import UserBox from "@/components/compositions/UserBox.vue"

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

function close () {
  emit("close")
}
</script>

<template>
  <Popup
    class="user-list-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="people" />
        <span>{{ $t(mainState.userListPopupProps.headerLabel) }}</span>
      </h2>
    </template>
    <template #body>
      <div class="users">
        <p
          v-if="mainState.userListPopupProps.users.length === 0"
          class="message"
        >{{ $t(mainState.userListPopupProps.noUsersMessage) }}</p>
        <template v-else>
          <UserBox
            v-for="user of mainState.userListPopupProps.users"
            :key="user.did"
            class="user"
            :user="user"
            :menuDisplay="true"
            :contentWarningDisabled="false"
            :viewerDisplay="true"
            @link="close"
          />
        </template>
      </div>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.user-list-popup {
  .message {
    white-space: pre-wrap;
  }

  &:deep() {
    .popup {
      &-body {
        & > .users {
          display: flex;
          flex-direction: column;
          grid-gap: 1rem;

          & > .user-box {
            cursor: pointer;
          }
        }
      }
    }
  }
}
</style>
