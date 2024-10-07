import type { DirectiveBinding } from "vue"

interface IntersectionObserverOptions {
  inboundHandler?: () => void
  outboundHandler?: () => void
  options?: IntersectionObserverInit
}

// 交差オブザーバー
export default {
  mounted (
    element: HTMLElement,
    binding: DirectiveBinding<IntersectionObserverOptions>
  ) {
    let intersected = false
    const options = binding.value ?? {}
    const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          intersected = true
          options.inboundHandler?.()
        } else {
          if (intersected) {
            intersected = false
            options.outboundHandler?.()
          }
        }
      })
    }, options.options ?? {})
    observer.observe(element)
    ;(element as any).__observer__ = observer
  },

  unmounted (element: HTMLElement) {
    ;(element as any).__observer__?.disconnect()
  },
}
