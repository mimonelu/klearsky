type TTOption = {
  label: string
  value: any
}

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
  options?: Array<TTOption>
  pattern?: string
  maxlength?: number
  maxLengthIndicator?: boolean
  maxLengthWithSegmenter?: boolean
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
  clearButton?: boolean
  focus?: boolean
  onUpdate?: (item: TTEasyFormItem, form: TTEasyForm) => void
  onChange?: (item: TTEasyFormItem, form: TTEasyForm) => void
  onInput?: (item: TTEasyFormItem, form: TTEasyForm) => void
}
