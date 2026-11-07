// `viewRecord` を `Post.vue` に渡せる形にする（元のデータは書き換えない）
// NOTICE: `__custom` は元のデータと同じオブジェクトを参照するため、書き込んだ状態は元のデータに残る
export default function (view: TTEmbedQuoteRecord): TTPost {
  return {
    ...view,
    record: view.value,
    embed: view.embeds?.[0],
  } as unknown as TTPost
}
