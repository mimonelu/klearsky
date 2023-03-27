<template>
  <div class="loader">
    <div v-for="_ of Array(5)" />
  </div>
</template>

<style lang="scss" scoped>
.loader {
  background-color: rgba(var(--bg-color), 0.25);
  cursor: wait;
  display: flex;
  align-items: center;
  justify-content: center;
  grid-gap: 0.75em;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 2;
  width: 100%;
  height: 100%;

  & > div {
    animation: loader-animation 250ms ease-in-out infinite alternate-reverse;
    background-color: rgb(var(--accent-color));
    width: 0.75em;
    height: 0.75em;
  }
  @for $i from 1 through 5 {
    & > div:nth-child(#{$i}) {
      animation-delay: #{$i * 100}ms;
    }
  }
}

@keyframes loader-animation {
  0% { transform: scaleY(25%); }
  100% { transform: scaleY(100%); }
}
</style>
