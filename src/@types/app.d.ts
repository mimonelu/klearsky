declare module "*.vue"
declare module "crypto-js"
declare module "@/composables/**/*"

type KEasyForm = {
  id?: string
  submitButtonLabel?: string
  submitCallback?: Function
  data: Array<KEasyFormItem>
}

type KEasyFormItem = {
  state: any
  model: string
  label?: string
  type: string
  required?: boolean
  placeholder?: string
  autocomplete?: string
  inputmode?:
    | "text"
    | "url"
    | "none"
    | "tel"
    | "email"
    | "numeric"
    | "decimal"
    | "search"
    | undefined
  rows?: number
  focus?: boolean
  accept?: string
  isMultipleFile?: boolean
  maxNumberOfFile?: number
}
