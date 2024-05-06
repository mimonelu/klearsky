<script lang="ts" setup>
import { inject } from "vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import traverseJson from "@/composables/atp-wrapper/atp-util/traverse-json"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  log?: any
}>()

const mainState = inject("state") as MainState

const rootLog = props.log != null
  ? Array.isArray(props.log)
    ? props.log
    : [props.log.didDocument] ?? undefined
  : undefined

function close () {
  emit("close")
}

function getHandle (item: any): undefined | string {
  let result: undefined | string
  traverseJson(item, (key: string, value: any) => {
    if (key === "handle") {
      result = value
    } else if (key === "alsoKnownAs") {
      if (typeof value?.[0] === "string") {
        result = value[0].replace("at://", "")
      }
    }
  })
  return result
}

function getAtProtoEndpoint (item: any): undefined | string {
  let result: undefined | string
  traverseJson(item, (key: string, value: any, parent: any) => {
    if (key === "service" && !Array.isArray(value)) {
      result = value
    } else if (key === "atproto_pds") {
      result = value?.endpoint
    } else if (key === "serviceEndpoint" && parent.type === "AtprotoPersonalDataServer") {
      result = value
    }
  })
  return result
}

function getLabelerEndpoint (item: any): undefined | string {
  let result: undefined | string
  traverseJson(item, (key: string, value: any, parent: any) => {
    if (key === "atproto_labeler") {
      result = value?.endpoint
    } else if (key === "serviceEndpoint" && parent.type === "AtprotoLabeler") {
      result = value
    }
  })
  return result
}
</script>

<template>
  <Popup
    class="handle-history-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="history" />
        <span>{{ $t("handleHistory") }}</span>
      </h2>
    </template>
    <template #body>
      <template v-if="rootLog != null">
        <ol
          v-for="item, itemIndex of rootLog"
          :key="itemIndex"
          class="item"
        >
          <!-- createdAt -->
          <li class="created-at">{{ mainState.formatDate(item.createdAt) }}</li>

          <!-- ハンドル -->
          <li class="handle">{{ getHandle(item) }}</li>

          <!-- エンドポイント -->
          <li class="endpoint">
            <!-- ATProto エンドポイント -->
            <div class="endpoint__atproto">
              <SVGIcon name="database" />
              <span>{{ getAtProtoEndpoint(item) }}</span>
            </div>

            <!-- ラベラーエンドポイント -->
            <div
              v-if="getLabelerEndpoint(item)"
              class="endpoint__labeler"
            >
              <SVGIcon name="labeler" />
              <span>{{ getLabelerEndpoint(item) }}</span>
            </div>
          </li>
        </ol>
      </template>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.handle-history-popup {
  &:deep() {
    .popup-body {
      grid-gap: 1rem;
    }
  }

  .item {
    display: flex;
    flex-direction: column;
    grid-gap: 0.25rem;
    user-select: text;
    &:not(:last-child) {
      padding-bottom: 1rem;
    }
  }

  // createdAt
  .created-at {
    color: var(--fg-color-05);
    word-break: break-all;
  }

  // ハンドル
  .handle {
    font-size: 1.25rem;
    font-weight: bold;
    line-height: 1.25;
    word-break: break-all;
  }

  // エンドポイント
  .endpoint {
    display: flex;
    flex-direction: column;
    grid-gap: 0.25rem;

    &__atproto,
    &__labeler {
      display: flex;
      align-items: center;
      grid-gap: 0.375rem;

      & > .svg-icon {
        font-size: 0.875rem;
      }

      & > span {
        line-height: 1.25;
        word-break: break-all;
      }
    }

    // ATProto エンドポイント
    &__atproto {
      & > .svg-icon {
        fill: var(--fg-color-05);
      }

      & > span {
        color: var(--fg-color-075);
      }
    }

    // ラベラーエンドポイント
    &__labeler {
      & > .svg-icon {
        fill: rgb(var(--share-color));
      }

      & > span {
        color: rgb(var(--share-color));
      }
    }
  }
}
</style>
