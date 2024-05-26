<template>
  <div class="loader">
    <div />
    <div />
    <div />
    <div />
    <div />
  </div>
</template>

<style lang="scss" scoped>
.loader {
  background-color: rgb(0, 0, 0, 0.0625);
  cursor: wait;
  display: flex;
  align-items: center;
  justify-content: center;
  grid-gap: 0.5em;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 3;
  width: 100%;
  height: 100%;

  & > div {
    animation: loader-animation 200ms ease-in-out infinite alternate-reverse;
    background-color: rgb(var(--accent-color));
    border-radius: 0.25em;
    width: 0.25em;
    height: 1.5em;
  }
  @for $i from 1 through 5 {
    & > div:nth-child(#{$i}) {
      animation-delay: #{$i * 75}ms;
    }
  }
}

@keyframes loader-animation {
  0% { transform: scaleY(25%); }
  100% { transform: scaleY(100%); }
}
</style>
