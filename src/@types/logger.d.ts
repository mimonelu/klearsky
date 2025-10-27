declare global {
  interface Window {
    $log: (...args: any[]) => void
    $warn: (...args: any[]) => void
    $error: (...args: any[]) => void
  }
  const $log: (...args: any[]) => void
  const $warn: (...args: any[]) => void
  const $error: (...args: any[]) => void
}

export {}
