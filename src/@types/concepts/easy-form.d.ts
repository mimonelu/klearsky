type TTEasyForm = {
  data: Array<TTEasyFormItem>
  gridColumns?: string
  hasSubmitButton?: boolean
  id?: string
  submitButtonLabel?: string
  submitCallback?: Function
  blurOnSubmit?: boolean
}

type TTEasyFormItem = {
  name?: string // ユーザー用
  type: TTEasyFormItemType
  accept?: string
  attrs?: { [k: string]: any }
  autocomplete?: string
  buttonLabel?: string
  classes?: string
  clearButton?: boolean
  disabled?: boolean
  display?: boolean
  focus?: boolean
  footnote?: string
  hasMentionSuggestion?: boolean
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
  model?: number | string
  options?: Array<TTOption>
  pattern?: string
  placeholder?: string
  quadLayout?: boolean
  required?: boolean
  rows?: number
  state?: any
  submitWhenEnter?: boolean
  onBlur?: (item: TTEasyFormItem, form: TTEasyForm) => void
  onChange?: (item: TTEasyFormItem, form: TTEasyForm) => void
  onClick?: (item: TTEasyFormItem, form: TTEasyForm) => void
  onFocus?: (item: TTEasyFormItem, form: TTEasyForm) => void
  onInput?: (item: TTEasyFormItem, form: TTEasyForm) => void
  onUpdate?: (item: TTEasyFormItem, form: TTEasyForm) => void
}

type TTEasyFormItemType =
  "datetime-local" |
  "password" |
  "text" |
  "url" |
  "textarea" |
  "checkbox" |
  "radio" |
  "select" |
  "file" |
  "button" |
  "space" |
  string
