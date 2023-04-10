/// <reference types="vite/client" />
import type { ComponentCustomProperties } from "vue";

declare module "vue" {
  interface ComponentCustomProperties {
    $t: Function;
  }
};
