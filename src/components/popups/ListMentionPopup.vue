<script lang="ts" setup>
import { inject, reactive } from "vue"
import EasyForm from "@/components/forms/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import DESIGN_CONSTS from "@/consts/design-consts.json"

const emit = defineEmits<{(event: string, params: any): void}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const easyFormState = reactive<{
  options: Array<TTOption>
}>({
  options: (() => {
    const results: Array<TTOption> = [
      {
        label: $t("off"),
        value: undefined,
      },
    ]

    // マイリストを選択肢に追加
    Array.from(mainState.myLists!.items)
      .sort((a: TTList, b: TTList): number => {
        const aTerm = a.name || a.indexedAt
        const bTerm = b.name || b.indexedAt
        return aTerm < bTerm ? - 1 : aTerm > bTerm ? 1 : 0
      })
      .forEach((myList: TTList) => {
        results.push({
          label: `${myList.name} (${myList.listItemCount ?? myList.items?.length ?? "-"})`,
          value: myList.uri,
          icon: DESIGN_CONSTS.LIST_PURPOSE_ICON_MAP[myList.purpose] ?? "help",
        })
      })

    return results
  })(),
})

const easyFormProps: TTEasyForm = {
  hasSubmitButton: false,
  data: [
    {
      state: mainState.listMentionPopupProps,
      model: "list",
      type: "radio",
      options: easyFormState.options,

      // リストメンションの対象リストと対象DID配列の更新
      onUpdate () {
        if (mainState.listMentionPopupProps.list != null) {
          const list = mainState.myLists!.items.find((item) => {
            return item.uri === mainState.listMentionPopupProps.list
          })
          if (list != null) {
            const dids = list.items?.map((item) => {
              return item.subject.did
            }) ?? []
            mainState.listMentionPopupProps.dids.splice(
              0,
              mainState.listMentionPopupProps.dids.length,
              ...dids
            )
          }
        } else {
          mainState.listMentionPopupProps.dids.splice(0)
        }
      },
    },
  ],
}

function close (params: any) {
  emit("close", params)
}
</script>

<template>
  <Popup
    class="list-mention-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="list" />
        <span>{{ $t("listMention") }}</span>
        <span
          v-if="mainState.listMentionPopupProps.list != null"
          class="list-mention-popup__state--on"
        >ON</span>
        <span
          v-else
          class="list-mention-popup__state--off"
        >OFF</span>
      </h2>
    </template>
    <template #body>
      <!-- 注意文 -->
      <div class="textlabel">
        <div class="textlabel__text">{{ $t("listMentionNotification") }}</div>
      </div>

      <EasyForm v-bind="easyFormProps" />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.list-mention-popup {
  &__state--on,
  &__state--off {
    border-radius: var(--border-radius-middle);
    font-size: 0.875rem;
    padding: 0.125rem 0.5rem;
  }
  &__state--on {
    background-color: rgb(var(--notice-color), 0.125);
    color: rgb(var(--notice-color));
  }
  &__state--off {
    background-color: rgb(var(--fg-color), 0.125);
    color: rgb(var(--fg-color), 0.75);
  }

  &:deep() {
    .popup-header > h2 > .svg-icon--list {
      fill: rgb(var(--list-color));
    }

    // リストアイコン
    .easy-form .radios {
      @include list-icon-styles;
    }
  }
}
</style>
