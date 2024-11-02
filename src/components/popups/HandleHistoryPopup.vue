<script lang="ts" setup>
import { inject } from "vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  log?: any
}>()

const mainState = inject("state") as MainState

const rootLog = props.log != null
  ? Array.isArray(props.log)
    ? props.log
    : [props.log.didDocument]
  : undefined

function close () {
  emit("close")
}

function getHandle (item: any): undefined | string {
  let result: undefined | string
  Util.traverseJson(item, (key: string, value: any) => {
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
  Util.traverseJson(item, (key: string, value: any, parent: any) => {
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
  Util.traverseJson(item, (key: string, value: any, parent: any) => {
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
            <div>
              <a
                class="endpoint__atproto"
                :href="getAtProtoEndpoint(item)"
                rel="noreferrer"
                target="_blank"
              >
                <SVGIcon name="database" />
                <span>{{ getAtProtoEndpoint(item) }}</span>
              </a>
            </div>

            <div>
              <!-- ラベラーエンドポイント -->
              <a
                v-if="getLabelerEndpoint(item)"
                class="endpoint__labeler"
                :href="getLabelerEndpoint(item)"
                rel="noreferrer"
                target="_blank"
              >
                <SVGIcon name="labeler" />
                <span>{{ getLabelerEndpoint(item) }}</span>
              </a>
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
    &:not(:nth-last-child(2)) {
      border-bottom: 1px solid rgb(var(--fg-color), 0.125);
      padding-bottom: 1rem;
    }
  }

  // createdAt
  .created-at {
    color: rgb(var(--fg-color), 0.5);
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
    align-items: flex-start;
    grid-gap: 0.25rem;

    &__atproto,
    &__labeler {
      cursor: pointer;
      display: flex;
      align-items: center;
      grid-gap: 0.375rem;
      &:hover {
        text-decoration: underline;
        text-underline-offset: 0.25em;
      }

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
      color: rgb(var(--accent-color));

      & > .svg-icon {
        fill: rgb(var(--accent-color), 0.75);
      }
    }

    // ラベラーエンドポイント
    &__labeler {
      color: rgb(var(--label-color));

      &:hover {
        border-color: rgb(var(--label-color));
      }

      & > .svg-icon {
        fill: rgb(var(--label-color));
      }
    }
  }
}
</style>
@/composables/util/traverse-json