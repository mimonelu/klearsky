/// <reference types="vite/client" />
export {};

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $t: Function;
  }
}
