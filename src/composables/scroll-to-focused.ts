export default () => {
  const focusElement = document.querySelector("[data-focus='true']")
  if (focusElement != null) focusElement.scrollIntoView({
    behavior: "smooth",
    block: "start",
  })
}