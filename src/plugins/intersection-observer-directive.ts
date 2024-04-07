import type { Directive, DirectiveBinding } from "vue"

interface IntersectionObserverOptions {
  handler: () => void
  options?: IntersectionObserverInit
}

const intersectionObserver: Directive = {
  mounted (
    element: HTMLElement,
    binding: DirectiveBinding<IntersectionObserverOptions>
  ) {
    const options = binding.value ?? {}
    const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          options.handler()
          observer.disconnect()
        }
      })
    }, options.options ?? {})
    observer.observe(element)
  },
}

export default intersectionObserver
