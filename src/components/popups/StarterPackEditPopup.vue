<script lang="ts" setup>
import { inject, reactive, ref } from "vue"
import { RichText } from "@atproto/api"
import extend from "extend"
import EasyForm from "@/components/forms/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"
import DESIGN_CONSTS from "@/consts/design-consts.json"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  mode?: "create" | "edit"
  starterPack?: TIStarterPack
}>()

const easyForm = ref()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  loaderDisplay: boolean
}>({
  loaderDisplay: false,
})

const easyFormState = reactive<{
  name: string
  description: string
  feeds?: Array<string>
  feedsOptions: Array<TTOption>
  list?: string
  listOptions: Array<TTOption>
}>({
  name: props.starterPack?.record.name ?? "",
  description: props.starterPack?.record.description ?? "",
  feeds: (props.starterPack?.record.feeds ?? []).map((feed) => feed.uri),
  feedsOptions: (() => {
    const results: Array<TTOption> = []

    // マイフィードを選択肢に追加
    Array.from(mainState.myFeeds!.items)
      .filter((item) => {
        return item.kind === "feed"
      })
      .forEach((item) => {
        results.push({
          label: item.value.displayName,
          value: item.value.uri,
        })
      })

    return results
  })(),
  list: props.starterPack?.record.list,
  listOptions: (() => {
    const results: Array<TTOption> = []

    // マイリストを選択肢に追加
    Array.from(mainState.myLists!.items)
      .sort((a, b): number => {
        const aTerm = a.name || a.indexedAt
        const bTerm = b.name || b.indexedAt
        return aTerm < bTerm ? - 1 : aTerm > bTerm ? 1 : 0
      })
      .forEach((myList) => {
        results.push({
          label: `${myList.name}`,
          value: myList.uri,
          icon: DESIGN_CONSTS.LIST_PURPOSE_ICON_MAP[myList.purpose] ?? "help",
        })
      })

    return results
  })(),
})

const easyFormProps: TTEasyForm = {
  hasSubmitButton: true,
  submitButtonLabel: $t(props.mode === "create" ? "create" : "save"),
  submitCallback,
  blurOnSubmit: true,
  data: [
    {
      state: easyFormState,
      model: "name",
      label: $t("starterPackName"),
      type: "text",
      required: true,
      maxlength: 50,
      maxLengthIndicator: true,
      maxLengthIndicatorByGrapheme: true,
      autocomplete: "off",
    },
    {
      state: easyFormState,
      model: "description",
      label: $t("starterPackDescription"),
      type: "textarea",
      rows: 6,
      maxlength: 300,
      maxLengthIndicator: true,
      maxLengthIndicatorByGrapheme: true,
    },
    {
      state: easyFormState,
      model: "feeds",
      label: $t("feeds"),
      type: "checkbox",
      options: easyFormState.feedsOptions,
      limit: 3,
    },
    {
      state: easyFormState,
      model: "list",
      label: $t("list"),
      type: "radio",
      options: easyFormState.listOptions,
      required: true,
    },
  ],
}

function close () {
  emit("close")
}

async function submitCallback () {
  Util.blurElement()
  if (props.mode === "edit" && props.starterPack == null) {
    return
  }
  state.loaderDisplay = true
  const query = props.starterPack == null
    ? {
      $type: "app.bsky.graph.starterpack",
      record: {
        createdAt: new Date().toISOString(),
      },
    } as unknown as TIStarterPack
    : { ...props.starterPack } as TIStarterPack

  // 入力内容の設定
  query.record.name = easyFormState.name
  query.record.description = easyFormState.description
  query.record.feeds = easyFormState.feeds?.map((uri) => ({ uri })) ?? []
  query.record.list = easyFormState.list

  // `descriptionFacets` の設定
  if (mainState.atp.agent != null) {
    const richText = new RichText({ text: easyFormState.description })
    await richText.detectFacets(mainState.atp.agent)
    query.record.descriptionFacets = richText.facets
  }

  // 作成
  if (props.mode === "create") {
    const result = await mainState.atp.createStarterPack(query)
    if (result instanceof Error) {
      state.loaderDisplay = false
      mainState.openErrorPopup(result, "StarterPackEditPopup/createStarterPack")
      return
    }

    // レコードの反映待ち
    // TODO: 要検討
    await Util.wait(1000)

    // 再取得
    const newStarterPack: Error | TIStarterPack =
      await mainState.atp.fetchStarterPack(result.uri)
    if (newStarterPack instanceof Error) {
      mainState.openErrorPopup(newStarterPack, "StarterPackEditPopup/fetchStarterPack")
      return
    }

    // ユーザーのスターターパックに追加
    mainState.currentAuthorStarterPacks.unshift(newStarterPack)

  // 更新
  } else if (props.mode === "edit") {
    const result = await mainState.atp.updateStarterPack(query)
    if (result instanceof Error) {
      state.loaderDisplay = false
      mainState.openErrorPopup(result, "StarterPackEditPopup/updateStarterPack")
      return
    }
    if (props.starterPack == null) {
      return
    }

    // レコードの反映待ち
    // TODO: 要検討
    await Util.wait(1000)

    // 再取得
    const newStarterPack: Error | TIStarterPack =
      await mainState.atp.fetchStarterPack(props.starterPack.uri)
    if (newStarterPack instanceof Error) {
      mainState.openErrorPopup(newStarterPack, "StarterPackEditPopup/fetchStarterPack")
      return
    }

    // ユーザーのスターターパックを上書き
    mainState.currentAuthorStarterPacks.some((starterPack) => {
      if (props.starterPack == null) {
        return true
      }
      if (props.starterPack.uri !== starterPack.uri) {
        return false
      }
      starterPack.feeds?.splice(0)
      starterPack.record.feeds?.splice(0)
      starterPack.listItemsSample?.splice(0)
      extend(true, starterPack, newStarterPack)
      return true
    })

    // スターターパックページのスターターパックを上書き
    if (mainState.currentStarterPack?.uri === props.starterPack.uri) {
      mainState.currentStarterPackListFeeds.splice(0)
      mainState.currentStarterPackListFeedsCursor = undefined
      mainState.currentStarterPack.feeds?.splice(0)
      mainState.currentStarterPack.record.feeds?.splice(0)
      mainState.currentStarterPack.listItemsSample?.splice(0)
      extend(true, mainState.currentStarterPack, newStarterPack)
    }
  }

  close()
}
</script>

<template>
  <Popup
    class="starter-pack-edit-popup"
    :hasCloseButton="true"
    :loaderDisplay="state.loaderDisplay"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="cards" />
        <span>{{ $t(mode === "create" ? "starterPackCreate" : "starterPackEdit") }}</span>
      </h2>
    </template>
    <template #body>
      <EasyForm
        v-bind="easyFormProps"
        ref="easyForm"
      />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.starter-pack-edit-popup {
  &:deep() {
    .popup-header > h2 > .svg-icon--cards {
      fill: rgb(var(--starter-pack-color));
    }

    // リストアイコン
    .easy-form .radios {
      @include list-icon-styles;
    }
  }
}
</style>

