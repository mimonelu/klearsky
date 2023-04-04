<script lang="ts" setup>
import Post from "@/components/Post.vue"

const emit = defineEmits<{(event: string, params?: any): void}>()

defineProps<{
  feed: TTFeed;
}>()

function updateThisPostThread (newPosts: Array<TTPost>) {
  emit("updateThisPostThread", newPosts)
}

function removeThisPost (uri: string) {
  emit("removeThisPost", uri)
}
</script>

<template>
  <div class="feed">
    <template v-if="feed.__replyDisplay && (feed.reply?.root != null || feed.reply?.parent != null)">
      <Post
        v-if="feed.reply?.root != null && feed.reply.root.cid !== feed.reply.parent?.cid"
        position="root"
        :post="feed.reply.root"
        :data-has-child="feed.reply.root.cid === feed.reply?.parent?.record.reply?.parent?.cid"
        @updateThisPostThread="updateThisPostThread"
        @removeThisPost="removeThisPost"
      />
      <Post
        v-if="feed.reply?.parent != null"
        position="parent"
        :post="feed.reply.parent"
        :data-has-child="feed.reply.parent.cid === feed.post.record?.reply?.parent?.cid"
        @updateThisPostThread="updateThisPostThread"
        @removeThisPost="removeThisPost"
      />
    </template>
    <Post
      v-if="feed.post != null"
      position="post"
      :post="feed.post"
      :replyTo="feed.reply?.parent"
      @onClickReplier="feed.__replyDisplay = !feed.__replyDisplay"
      @updateThisPostThread="updateThisPostThread"
      @removeThisPost="removeThisPost"
    />
  </div>
</template>
