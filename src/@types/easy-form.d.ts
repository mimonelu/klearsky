type TTOption = {
  label: string
  value: any
}

type TTEasyForm = {
  id?: string
  gridColumns?: string
  hasSubmitButton?: boolean
  submitButtonLabel?: string
  submitCallback?: Function
  data: Array<TTEasyFormItem>
}

type TTEasyFormItem = {
  index?: number // ボタンのコールバック用
  state?: any
  model?: string
  classes?: string
  label?: string
  buttonLabel?: string
  icon?: string
  type: string
  display?: boolean
  disabled?: boolean
  required?: boolean
  options?: Array<TTOption>
  limit?: number
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
  layout?: "horizontal" | "vertical" | "vertical-2columns"
  accept?: string
  isMultipleFile?: boolean
  maxNumberOfFile?: number
  quadLayout?: boolean
  clearButton?: boolean
  hasPostLanguages?: boolean
  hasAccountSuggest?: boolean
  footnote?: string
  focus?: boolean
  onClick?: (item: TTEasyFormItem, form: TTEasyForm) => void
  onUpdate?: (item: TTEasyFormItem, form: TTEasyForm) => void
  onChange?: (item: TTEasyFormItem, form: TTEasyForm) => void
  onInput?: (item: TTEasyFormItem, form: TTEasyForm) => void
}
