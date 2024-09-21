<script lang="ts" setup>
import { inject, nextTick, reactive, ref } from "vue"
import EasyForm from "@/components/forms/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import UserBox from "@/components/compositions/UserBox.vue"
import CONSTS from "@/consts/consts.json"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  users: Array<TTUser>
  limit: number
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const easyFormState = reactive<{
  text: string
  users: Array<TTUser>
}>({
  text: "",
  users: [],
})

const easyFormProps: TTEasyForm = {
  data: [
    {
      state: easyFormState,
      model: "text",
      type: "text",
      placeholder: $t("chatMemberPlaceholder"),
      hasMentionSuggestion: true,
      focus: true,
      onInput () {
        if (easyFormState.text === "") {
          return
        }
        if (timer != null) {
          clearTimeout(timer)
          timer = undefined
        }
        timer = setTimeout(async () => {
          if (easyFormState.text === "") {
            return
          }
          const results = await mainState.atp.fetchActorsTypeahead(
            easyFormState.text,
            CONSTS.LIMIT_OF_FETCH_ACTORS_TYPEAHEAD_IN_CHAT_MEMBERS
          )
          if (results instanceof Error) {
            // TODO:
            return
          }

          // なるべく元の順番を保ちつつチャット可能なユーザーが上に来るようにソート
          results.sort((a, b) => {
            const aOk =
              a.associated?.chat?.allowIncoming === "all" ||
              (
                (
                  a.associated?.chat?.allowIncoming == null ||
                  a.associated?.chat?.allowIncoming === "following"
                ) &&
                a.viewer.followedBy != null
              )
            const bOk =
              b.associated?.chat?.allowIncoming === "all" ||
              (
                (
                  b.associated?.chat?.allowIncoming == null ||
                  b.associated?.chat?.allowIncoming === "following"
                ) &&
                b.viewer.followedBy != null
              )
            return aOk && !bOk
              ? - 1
              : !aOk && bOk
                ? 1
                : 0
          })

          easyFormState.users.splice(0)
          await nextTick()
          easyFormState.users.push(...results)
          ;(popup.value as any)?.scrollToTop()
        }, 500)
      },
    },
  ],
}

const popup = ref(null)

let timer: undefined | any

function close () {
  emit("close")
}

function canChat (user: TTUser): boolean {
  const allowIncoming = user.associated?.chat?.allowIncoming
  if (allowIncoming === "all") {
    return true
  }
  if (allowIncoming === "none") {
    return false
  }
  return user.viewer.followedBy != null
}

function getAllowIncoming (user: TTUser): TTAllowIncoming {
  return user.associated?.chat?.allowIncoming ?? "following"
}

const userIcon: { [k in TTAllowIncoming]: string } = {
  all: "people",
  following: "personHeart",
  none: "personOff",
}
function getUserIcon (user: TTUser): string {
  const allowIncoming = getAllowIncoming(user)
  return userIcon[allowIncoming]
}

function toggleOrSubmit (user: TTUser) {
  if (props.limit === 1) {
    props.users.push(user)
    close()
  } else {
    const index = props.users.findIndex((dst) => dst.did === user.did)
    if (index === - 1) {
      props.users.push(user)
    } else {
      props.users.splice(index, 1)
    }
  }
}

function unselect (index: number) {
  props.users.splice(index, 1)
}
</script>

<template>
  <Popup
    class="chat-members-select-popup"
    ref="popup"
    :hasCloseButton="true"
    :data-limit="limit"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="chatPlus" />
        <span>{{ $t("addChatMember") }}</span>
      </h2>
    </template>
    <template #header-after>
      <EasyForm v-bind="easyFormProps" />
    </template>
    <template #body>
      <div
        v-for="user, userIndex of easyFormState.users"
        :key="userIndex"
        class="chat-members-select-popup__user-box-container"
      >
        <UserBox
          v-if="user.did !== mainState.atp.data.did"
          :user="user"
          :noLink="true"
          :contentWarningDisabled="false"
          :menuDisplay="false"
          :viewerDisplay="true"
          @link="toggleOrSubmit(user)"
        >
          <template #content>
            <div class="chat-members-select-popup__user-state">
              <SVGIcon :name="canChat(user) ? 'check' : 'cross'" />
              <div :data-can-chat="canChat(user)">{{ $t(canChat(user) ? "chatOk" : "chatNo") }}</div>
              <SVGIcon :name="getUserIcon(user)" />
              <div :data-allow-incoming="getAllowIncoming(user)">{{ $t(`allow-incoming-${getAllowIncoming(user)}`) }}</div>
            </div>
          </template>
        </UserBox>
      </div>
    </template>
    <template
      v-if="limit > 1"
      #footer
    >
      <div class="chat-members-select-popup__selected-users">
        <button
          v-for="user, userIndex of users"
          :key="userIndex"
          class="button--bordered chat-members-select-popup__user-button"
          type="button"
          @click.prevent="unselect(userIndex)"
        >
          <SVGIcon name="person" />
          <span>{{ user.displayName || user.handle }}</span>
        </button>
        <button
          class="button chat-members-select-popup__submit-button"
          type="button"
          @click.prevent="close"
        >
          <SVGIcon name="chatPlus" />
          <span>{{ $t("create") }}</span>
        </button>
      </div>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.chat-members-select-popup {
  &:deep() {
    .popup {
      flex-grow: 1;

      &-header > h2 > .svg-icon {
        fill: rgb(var(--post-color));
      }

      &-body {
        flex-grow: 1;
      }
    }
  }

  .easy-form {
    margin: 1rem;
  }

  &__user-box-container {
    display: contents;

    .user-box {
      cursor: pointer;
    }
  }

  &__user-state {
    display: grid;
    grid-gap: 0.5rem;
    grid-template-columns: auto auto auto 1fr;
    line-height: var(--line-height-middle);

    & > .svg-icon--check,
    & > .svg-icon--people {
      fill: rgb(var(--share-color));
    }
    & > .svg-icon--cross {
      fill: rgb(var(--fg-color), 0.25);
    }
    & > .svg-icon--personHeart {
      fill: rgb(var(--fg-color));
    }
    & > .svg-icon--personOff {
      fill: rgb(var(--notice-color));
    }

    [data-can-chat="true"] {
      color: rgb(var(--share-color));
      font-weight: bold;
    }
    [data-can-chat="false"] {
      color: rgb(var(--fg-color), 0.25);
      font-weight: bold;
    }

    [data-allow-incoming="all"] {
      color: rgb(var(--share-color));
    }
    [data-allow-incoming="following"] {
      color: rgb(var(--fg-color));
    }
    [data-allow-incoming="none"] {
      color: rgb(var(--fg-color), 0.25);
    }
  }

  &__selected-users {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    grid-gap: 0.25rem;
    padding: 1rem;
  }

  &__user-button {
    font-size: 0.875rem;
  }

  &__submit-button {
    font-size: 0.875rem;
    margin-left: auto;
  }
}
</style>
