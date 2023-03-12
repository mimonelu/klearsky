/// <reference types="vite/client" />
import type { ComponentCustomProperties } from "vue";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $t: Function;
  }
};
