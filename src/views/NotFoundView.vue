<template>
  <div class="not-found-view">
    <div class="catch">4😵4</div>
    <RouterLink
      to="/"
      class="button"
    >
      <span>Back to Klearsky's top page</span>
    </RouterLink>
  </div>
</template>

<style lang="scss" scoped>
.not-found-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  grid-gap: 4rem;
  height: 100vh;
}

.catch {
  font-size: 8rem;
}
</style>
