type TTListEditPopupProps = {
  mode?: "create" | "edit"
  display: boolean
  list?: TTList
  callback?: (list: TTList) => void
}
