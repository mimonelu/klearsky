<template>
  <div class="menu-ticker">
    <div class="menu-ticker--overlay" />
    <div class="menu-ticker--inner">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.menu-ticker {
  display: contents;

  &--overlay {
    // background-color: rgba(var(--bg-color), 0.25);
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
  }

  &--inner {
    box-shadow: 0 0 0.5rem 0 rgba(0, 0, 0, 0.25);
    background-color: rgb(var(--bg-color));
    border: 1px solid rgba(var(--fg-color), 0.25);
    border-radius: 1px;
    display: flex;
    flex-direction: column;
    grid-gap: 0.25rem;
    padding: 0.5rem 0;
    position: absolute;
    z-index: 2;

    &:deep() > button {
      cursor: pointer;
      display: flex;
      align-items: center;
      grid-gap: 1rem;
      padding: 0.5rem 1rem;
      white-space: nowrap;
      &:focus, &:hover {
        color: rgb(var(--accent-color));
      }

      & > .svg-icon {
        fill: rgb(var(--fg-color));
      }
      &:focus, &:hover {
        & > .svg-icon {
          fill: rgb(var(--accent-color));
        }
      }
    }
  }
}
</style>
