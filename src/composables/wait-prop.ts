import { watch } from "vue"

export default function (getter: Function, value: any): Promise<boolean> {
  return new Promise(resolve => {
    watch(getter, (newValue: any) => {
      if (newValue === value) resolve(true)
    })
  })
}
