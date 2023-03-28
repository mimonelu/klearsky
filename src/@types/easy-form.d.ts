type TTEasyForm = {
  id?: string
  submitButtonLabel?: string
  submitCallback?: Function
  data: Array<TTEasyFormItem>
}

type TTEasyFormItem = {
  state: any
  model: string
  label?: string
  type: string
  display?: boolean
  disabled?: boolean
  required?: boolean
  pattern?: string
  maxlength?: number
  maxLengthIndicator?: boolean
  rows?: number
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
  accept?: string
  isMultipleFile?: boolean
  maxNumberOfFile?: number
  focus?: boolean
  onChange?: (item: TTEasyFormItem, form: TTEasyForm) => void
  onInput?: (item: TTEasyFormItem, form: TTEasyForm) => void
}
