interface TTHtmlPopupProps {
  display: boolean
  type?: string
}

type TTMessagePopupProps = {
  display: boolean
  title?: string
  text?: string
  hasTranslateLink?: boolean
}

interface TIConfirmationPopupProps {
  display: boolean
  title?: string
  text?: string
  detail?: string
  post?: TTPost
  result: boolean
}
