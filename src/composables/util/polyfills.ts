// AbortSignal.timeout polyfill for older browsers (Chrome < 103)
// Android 10 の Chrome などでサポートされていないため追加
if (typeof AbortSignal.timeout === "undefined") {
  AbortSignal.timeout = function (ms: number): AbortSignal {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), ms)
    return controller.signal
  }
}
