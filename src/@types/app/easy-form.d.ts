type TTEasyForm = {
  data: Array<TTEasyFormItem>
  gridColumns?: string
  hasSubmitButton?: boolean
  id?: string
  submitButtonLabel?: string
  submitCallback?: Function
}

type TTEasyFormItem = {
  type: string
  accept?: string
  autocomplete?: string
  buttonLabel?: string
  classes?: string
  clearButton?: boolean
  disabled?: boolean
  display?: boolean
  focus?: boolean
  footnote?: string
  hasAccountSuggestion?: boolean
  icon?: string
  index?: number // ボタンのコールバック用
  inputmode?: "text" | "url" | "none" | "tel" | "email" | "numeric" | "decimal" | "search" | undefined
  isMultipleFile?: boolean
  label?: string
  layout?: "horizontal" | "vertical" | "vertical-2columns"
  limit?: number
  maxlength?: number
  maxLengthIndicator?: boolean
  maxLengthIndicatorByGrapheme?: boolean
  maxNumberOfFile?: number
  model?: string
  options?: Array<TTOption>
  pattern?: string
  placeholder?: string
  quadLayout?: boolean
  required?: boolean
  rows?: number
  state?: any
  onChange?: (item: TTEasyFormItem, form: TTEasyForm) => void
  onClick?: (item: TTEasyFormItem, form: TTEasyForm) => void
  onInput?: (item: TTEasyFormItem, form: TTEasyForm) => void
  onUpdate?: (item: TTEasyFormItem, form: TTEasyForm) => void
}
