// 世代番号
// 遷移などで対象が切り替わった後に届いた古いレスポンスを破棄するために使う
// 開始時に `current()` を控え、await 後に `isCurrent()` で照合する

export default function () {
  let generation = 0

  return {
    next (): number {
      return ++ generation
    },

    current (): number {
      return generation
    },

    isCurrent (target: number): boolean {
      return target === generation
    },
  }
}
