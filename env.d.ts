/// <reference types="vite/client" />
declare module "@/@types/*";
declare module "@/composables/*";

declare module "*.vue" {
  import Vue from "vue";
  export default Vue;
}
