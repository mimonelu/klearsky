export default () => ({
  // ============================================================================
  // APPLICATION INFO
  // ============================================================================
  "title": "Klearsky",
  "klearsky": "Klearsky",
  "bluesky": "Bluesky",
  "atmosphere": "Atmosphere",

  // ============================================================================
  // COMMON ACTIONS & STATES
  // ============================================================================
  "cancel": "キャンセル",
  "yes": "はい",
  "no": "いいえ",
  "confirmation": "確認",
  "apply": "適用する",
  "release": "解除する",
  "add": "追加する",
  "save": "保存する",
  "load": "読み込む",
  "enabled": "有効",
  "disabled": "無効",
  "show": "表示する",
  "hide": "隠す",
  "fold": "折り畳む",
  "on": "オン",
  "off": "オフ",
  "create": "作成する",
  "delete": "削除する",
  "edit": "編集",
  "copy": "コピーする",
  "select": "選択",
  "notSelected": "選択なし",
  "reset": "リセットする",
  "reload": "リロード",
  "refresh": "更新する",
  "loading": "読込中...",
  "more": "もっと見る",
  "submit": "送信する",
  "success": "処理完了",
  "successMessage": "処理が正常に完了しました。",
  "noContent": "コンテンツがありません。",

  // ============================================================================
  // NAVIGATION & VIEWS
  // ============================================================================
  "home": "ホーム",
  "notifications": "通知",
  "profile": "プロフィール",
  "account": "アカウント",
  "accounts": "アカウント",
  "help": "ヘルプ",
  "followingDescription": "あなたがフォローしているユーザーのポストを表示します。",
  "globalline": "グローバルフィード",
  "globallineDescription": "すべてのポストをリアルタイムに表示します。",
  "trending": "トレンド",
  "trendingDescription": "トレンドトピックを表示します。",

  // ============================================================================
  // AUTHENTICATION & LOGIN
  // ============================================================================
  "service": "ホスティングプロバイダー",
  "identifier": "ハンドル／DID",
  "password": "アプリパスワード／パスワード",
  "getAppPassword": "アプリパスワードを取得",
  "authFactorToken": "確認コード",
  "authFactorTokenMessage": "二要素認証の確認コードが送信されました。上のボックスに入力後、再度ログインしてください。",
  "myAccounts": "マイアカウント",
  "loginFailed": "ログインに失敗しました。入力内容を確認してください。",
  "sessionExpired": "セッションの有効期限が切れました。再ログインしてください。",
  "newLogin": "新規ログイン",
  "logout": "ログアウト",
  "oauthLogin": "OAuthログイン",
  "passwordLogin": "パスワードログイン",
  "signUp": "アカウントを作成（開発者向け）",
  "signUpShort": "サインアップ",
  "signUpCaution": "公式PDSにはサインアップできません。",
  "setAccountToLoginForm": "ログインフォームに設定",
  "removeAccountHistory": "マイアカウントの削除",
  "removeAccountHistoryMessage": "このアカウントをマイアカウントから削除します。よろしいですか？",
  "accountExport": "エクスポート",
  "accountImport": "インポート",
  "accountImportNotification": "アカウントデータをインポートします。\n\n* 入力データで既存データを上書きします。削除はされません。\n* 現在ログイン中のデータは上書きされません。\n\n処理を続行しますか？",
  "noMyAccounts": "マイアカウントがありません。まずはログインしてください。アカウントは公式クライアントで作成できます。",
  "email": "メールアドレス",
  "handle": "ハンドル",
  "inviteCode": "招待コード",
  "inviteCodes": "招待コード",
  "confirmInviteCodes": "招待コードを確認する",
  "copyInviteCode": "コピーする",
  "userOfInviteCode": "使用済み",
  "noInviteCodes": "招待コードがありません。AppPasswordsでログインしている場合は招待コードを取得できない点にご注意ください。",

  // ============================================================================
  // PROFILE EDITING
  // ============================================================================
  "editProfile": "編集",
  "displayName": "名前",
  "description": "紹介文",
  "pronouns": "代名詞／呼び方",
  "websiteUrl": "WebサイトのURL",
  "avatar": "サムネイル",
  "detachAvatar": "サムネイルを取り外す",
  "banner": "バナー",
  "detachBanner": "バナーを取り外す",

  // ============================================================================
  // POSTS & CONTENT
  // ============================================================================
  "post": "ポスト",
  "posts": "ポスト",
  "postsCount": "ポスト",
  "reply": "リプライ",
  "replies": "リプライ",
  "replyUnknown": "リプライ先不明",
  "like": "いいね",
  "likes": "いいね",
  "repost": "リポスト",
  "reposts": "リポスト",
  "quoteRepost": "引用リポスト",
  "createRepost": "リポストする",
  "createRepostConfirmation": "このポストをリポストします。よろしいですか？",
  "deleteRepost": "リポストを取り消す",
  "deleteRepostConfirmation": "このポストのリポストを取り消します。よろしいですか？",
  "sendQuoteRepost": "引用リポストする",
  "postWithReplies": "ポスト＋リプライ",
  "postWithMedia": "メディア付きポスト",
  "postWithVideo": "動画付きポスト",
  "text": "テキスト",
  "sendPost": "ポストを投稿する",
  "sendPostNotification1": "[文字列](URL) でカスタムリンクを作成できます。",
  "sendPostNotification2": "@zap でZapリンクを作成できます（要Lightning設定）。",
  "sendPostNotification3": "リンクカードのURLにはWebページのURL、ポストのAT URI、フィードのAT URI、リストのAT URIを指定できます。",
  "sendPostNotification4": "アニメーション画像は .gif / .apng / .webp に対応しています（公式未対応）。",
  "sendPostNotification5": "最大文字数を超えても送信自体は可能です。",
  "sendPostReset": "入力内容のリセット",
  "sendPostResetMessage": "入力内容をリセットします。よろしいですか？",
  "postDate": "ポスト日時",
  "postDatePopupTitle": "ポスト日時の設定",
  "postDatePopupDescription": "下記の日時でポストを投稿します。\n西暦10年から現在の日時のみ有効です。",
  "postDatePopupReset": "日時をリセットする",
  "postDatePopupResetDescription": "日時をリセットします。よろしいですか？",
  "emptyPostConfirmation": "空ポストの確認",
  "emptyPostConfirmationMessage": "ポストが空のようです。このまま投稿しますか？",

  // ============================================================================
  // POST ACTIONS
  // ============================================================================
  "copyHandle": "ハンドルをコピー",
  "copyOfficialUrl": "公式URLをコピー",
  "copyAtUri": "AT URIをコピー",
  "copyDid": "DIDをコピー",
  "copyDisplayName": "表示名をコピー",
  "likeUsers": "いいねしたユーザー",
  "quoteRepostsList": "引用リポスト一覧",
  "repostUsers": "リポストしたユーザー",
  "pinnedPost": "固定ポスト",
  "pinnedPostOn": "固定ポストにする",
  "pinnedPostOff": "固定ポストを解除",
  "copyPostText": "テキストをコピー",
  "firstPost": "最初のポストを見る",
  "sendMention": "メンションを送る",
  "sendLinkCard": "リンクカードにする",
  "warpPostNotification": "このポストは次の日時として投稿されます：",
  "deletePost": "ポストを削除する",
  "deletePostMessage": "このポストを削除します。よろしいですか？",

  // ============================================================================
  // DRAFT
  // ============================================================================
  "postDraft": "下書き",
  "reDraft": "ポストを再利用する",
  "reDraftCaution": "添付ファイルは再利用できません。\nこのまま再利用しますか？",
  "postDraftDeleteConfirmation": "この下書きを削除します。よろしいですか？",
  "postDraftMediaNotFound": "この下書きのメディアデータが見つかりません。メディアなしで復帰しますか？",
  "postDraftMediaNotFoundOnDevice": "添付されたメディアはこのデバイスに存在しません。",
  "postDraftDeleteWithOrphanedMedia": "添付されたメディアが存在しない下書きを削除すると、その下書きを作成したデバイスにメディアデータが残り続ける可能性があります。\nそれでも削除してよろしいですか？",
  "postDraftThreadUnsupported": "現状、Klearskyでは連投の下書きを適用することはできません。",

  // POST EDIT
  // ============================================================================
  "editPost": "ポストを編集する",
  "editPostDescription1": "残り時間",
  "editPostDescription2": "残り時間内であればポストの本文を変更できます。",
  "editPostDescription3": "これは危険な機能です。利用はおすすめしません。",
  "editPostDescription4": "各リアクションの見た目の数は0になります。",

  // ============================================================================
  // POST STATES
  // ============================================================================
  "postBlocked": "ブロック／被ブロックユーザーのポストです。",
  "postNotFound": "このポストは存在しません。",
  "postDetachedBySelf": "この引用は切り離し済みです。",
  "postDetachedByOther": "この引用は切り離されました。",

  // ============================================================================
  // USER ACTIONS
  // ============================================================================
  "follow": "フォローする",
  "followed": "あなたをフォロー中",
  "follower": "フォロワー",
  "followers": "フォロワー",
  "following": "フォロー中",
  "followings": "フォロー中",
  "followingCount": "フォロー",
  "followersCount": "フォロワー",
  "muteOn": "ミュートする",
  "muteOff": "ミュートを解除する",
  "muting": "ミュート中",
  "block": "ブロックする",
  "unblock": "ブロックを解除する",
  "blocked": "被ブロック中",
  "blocking": "ブロック中",
  "users": "ユーザー",

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================
  "mutingUsers": "個別ミュート中のユーザー",
  "checkMutingUsers": "ミュート中のユーザーを確認する",
  "blockingUsers": "個別ブロック中のユーザー",
  "checkBlockingUsers": "ブロック中のユーザーを確認する",
  "repostMutingUsers": "リポストミュート中のユーザー",
  "noFollowings": "このユーザーがフォローしているユーザーはいません。",
  "noFollowers": "このユーザーをフォローしているユーザーはいません。",
  "recommendedUsers": "オススメユーザー",

  // ============================================================================
  // FEEDS
  // ============================================================================
  "feed": "フィード",
  "feeds": "フィード",
  "feedsAll": "すべてのフィード",
  "feedsPinned": "ピン留めフィード",
  "customFeeds": "カスタムフィード",
  "myFeeds": "マイフィード",
  "myFeedsEdit": "マイフィードを編集する",
  "noMyFeeds": "マイフィードがありません。フィードを保存してください。",
  "noPostsInFeed": "このフィードにポストはありません。",
  "noAuthorFeeds": "このユーザーの管理するフィードはありません。",
  "feedControl": "フィードの制御",
  "feedControlDescription": "次のダウンロードから有効です。",
  "popularFeeds": "人気フィード",
  "feedInteractionMore": "このような投稿の表示を増やす",
  "feedInteractionLess": "このような投稿の表示を減らす",
  "feedInteractionSupportedDescription": "フィードインタラクション対応",

  // ============================================================================
  // MYFEEDS SORTS
  // ============================================================================
  "sortInAsc": "昇順でソート",
  "sortInDesc": "降順でソート",
  "sortByLike": "いいね数でソート",
  "sortByName": "名前でソート",
  "sortByUri": "URIでソート",
  "sortByIndexedAt": "更新日でソート",
  "sortMyFeedsConfirmation": "マイフィードをソートします。\nこの操作をやり直すことはできません。よろしいですか？",

  // ============================================================================
  // POST THREAD SORTS
  // ============================================================================
  "postThreadSortOldest": "古い順",
  "postThreadSortNewest": "新しい順",
  "postThreadSortMostLikes": "いいね順",
  "postThreadSortHotness": "人気順",

  // ============================================================================
  // TIME FEEDS
  // ============================================================================
  "showTimeFeeds": "タイムフィードで見る",
  "timeFeeds": "タイムフィード",

  // ============================================================================
  // SEARCH
  // ============================================================================
  "search": "検索",
  "suggestionSearch": "おすすめ",
  "userSearch": "ユーザーを見つける",
  "postSearch": "ポストを見つける",
  "postSearchLatest": "最新",
  "postSearchTop": "人気",
  "feedSearch": "フィードを見つける",
  "keyword": "キーワード",
  "searchUserLatestPost": "最近のポストを検索",
  "searchUserTopPost": "人気ポストを検索",
  "searchUserMentions": "メンションを検索",
  "advancedSearch": "詳細検索",
  "searchKeyword": "検索キーワード",
  "searchSort": "ソート",
  "searchLang": "このポスト言語から検索",
  "searchNoLang": "ポスト言語を指定しない",
  "searchAuthor": "このユーザーのポストを検索",
  "searchMyPosts": "自分自身のポストを検索",
  "searchTo": "このユーザーへのリプライを検索",
  "searchMentions": "このユーザーへのメンションを検索",
  "searchMentionsToMe": "自分自身へのメンションを検索",
  "searchDomain": "このドメインを含むポストを検索",
  "searchSince": "検索開始日",
  "searchUntil": "検索終了日",

  // ============================================================================
  // TRENDING
  // ============================================================================
  "suggestedTopics": "おすすめのトピック",
  "trendingTopics": "話題のトピック",

  // ============================================================================
  // MEDIA & IMAGES
  // ============================================================================
  "media": "メディア",
  "medias": "メディア",
  "image": "メディアの制御",
  "imageBoxes": "メディア",
  "alts": "代替テキスト",
  "showImage": "メディアを表示する",
  "hideImage": "メディアを隠す",
  "imageFolding": "メディアの折り畳み",
  "imageFolding1": "なし",
  "imageFolding2": "適度",
  "imageFolding3": "すべて",
  "imageMaxHeightRatio": "メディアの最大高さの割合",
  "imageMaxHeightRatio1": "x0.5",
  "imageMaxHeightRatio2": "x0.75",
  "imageMaxHeightRatio3": "x1.0",
  "imageMaxHeightRatio4": "x1.5",
  "imageMaxHeightRatio5": "x2.0",
  "imageMaxHeightRatio6": "制限なし",
  "imageAutoPlay": "アニメーション画像の自動再生",
  "shouldConvertGifToVideo": "GIF画像を動画に変換する",
  "video": "動画",
  "videoPreload": "動画の先読み",
  "videoIsBlob": "ストリーミングできません",
  "videoIsNone": "再生できません",
  "videoCanNotUpload": "動画の投稿は許可されていません",
  "videoRemainingDailyNumber": "本日の投稿可能な動画数",
  "videoRemainingDailyBytes": "本日の投稿可能な動画容量",

  // ============================================================================
  // LINK CARDS
  // ============================================================================
  "linkcard": "リンクカード",
  "linkCardControl": "リンクカードの制御",
  "linkcardLayout": "リンクカードのレイアウト",
  "linkcardLayoutVertical": "縦",
  "linkcardLayoutHorizontal": "横",
  "linkcardLayoutNone": "画像なし",
  "linkcardEmbeddedControl": "リンクカードの埋込コンテンツ制御",
  "LinkCardPlaceHolder": "リンクカードのURLまたはAT URI",
  "urlHasImage": "リンクカードにOGP画像を添付する",

  // ============================================================================
  // LANGUAGE & TRANSLATION
  // ============================================================================
  "language": "言語",
  "languages": "言語",
  "uiLanguage": "UI言語",
  "english": "English",
  "french": "Français",
  "german": "Deutsch",
  "japanese": "日本語",
  "korean": "한국어",
  "contentLanguages": "コンテンツ言語",
  "contentLanguagesEdit": "コンテンツ言語を選択する",
  "contentLanguagesDetail1": "複数選択可。",
  "contentLanguagesDetail2": "選択した言語と合致しないポストは折り畳まれます。",
  "contentLanguagesDetail3": "ポストに適切な言語が設定されていない場合は上記の限りではありません。",
  "contentLanguagesDetail4": "ひとつも選択しない場合はすべてのポストが表示されます。",
  "postLanguages": "ポスト言語",
  "postLanguagesEdit": "ポスト言語を選択する",
  "postLanguagesDetail1": "ポストで使用している言語を3つまで選択してください。",
  "postLanguagesDetail2": "この設定は閲覧者のコンテンツ言語と照合されます。",
  "autoTranslation": "自動翻訳",
  "autoTranslationRemarks1": "自動翻訳にはTranslated社の運営する翻訳メモリ「MyMemory」のAPIを使用しています。",
  "autoTranslationRemarks2": "自動翻訳のAPIコールにはあなたのメールアドレスが付与されます。そのため、あなたのメールアドレスがTranslated社及びTranslated社の外部パートナーと共有される可能性があります。",
  "autoTranslationRemarks3": "自動翻訳のAPIコールには1日あたりの文字数制限があります。",
  "autoTranslationRemarks4": "詳しくはMyMemoryのWebサイトでご確認ください。",
  "autoTranslationIgnoreLanguage": "自動翻訳 - 除外する言語",
  "translate": "翻訳する",
  "translating": "（翻訳中）",
  "translationFailed": "（翻訳に失敗しました）",

  // ============================================================================
  // LABELS & MODERATION
  // ============================================================================
  "label": "ラベル",
  "labels": "ラベル",
  "accountLabels": "ユーザーラベル",
  "customLabels": "カスタムラベル",
  "profileLabel": "ユーザーラベル",
  "postLabel": "ポストラベル",
  "labeler": "ラベラー",
  "labelerSettings": "ラベラー設定",
  "subscribeLabel": "ラベラーを登録する",
  "unsubscribeLabel": "ラベラーを登録中",
  "labelerOverLimit": "登録済みのラベラーが上限値に達しているため、このラベラーを登録できません。",
  "labelerReset": "設定のリセット",
  "labelerResetMessage": "設定をリセットします。よろしいですか？",
  "myLabeler": "マイラベラー",
  "contentFilteringTemporarilyDisable": "コンテンツフィルタを無効化",
  "contentFilteringTemporarilyEnable": "コンテンツフィルタを有効化",
  "moderation": "モデレーション",
  "moderate": "モデレートする",
  "contentFiltering": "コンテンツフィルタ",
  "modifyContentFiltering": "コンテンツフィルタを編集する",
  "contentFilteringDescription": "各コンテンツラベルの制御を設定した上で「適用」ボタンを押してください。",
  "selectLabels": "ラベルの選択",

  // ============================================================================
  // LABELS
  // ============================================================================
  "nsfw": "閲覧注意",
  "nsfw-porn": "閲覧注意（ポルノ）",
  "suggestive": "わいせつ表現",
  "suggestive-sexual": "わいせつ表現（性的表現）",
  "hate": "ヘイト／差別表現",
  "hate-intolerant": "ヘイト（差別表現）",
  "always-hide": "強制閲覧制限",
  "always-warn": "強制閲覧警告",
  "!hide": "強制閲覧制限",
  "!warn": "強制閲覧警告",
  "sexual": "セクシャル",
  "sexual-description": "成人向けまたは性的にきわどい表現",
  "nudity": "ヌード",
  "nudity-description": "芸術的または性的ではないヌード",
  "porn": "ポルノ",
  "porn-description": "性行為または性的な表現",
  "graphic-media": "生々しいメディア",
  "graphic-media-description": "一部のユーザーにとって不快または不適切と思われるメディア",
  "sexual-figurative": "示唆的な性表現",
  "self-harm": "自傷行為",
  "sensitive": "センシティブな表現",
  "extremist": "過激な表現",
  "intolerant": "差別表現",
  "threat": "脅迫行為",
  "rude": "暴言",
  "illicit": "虚偽・誇大広告",
  "security": "セキュリティ上の懸念",
  "unsafe-link": "危険なリンク",
  "impersonation": "なりすまし",
  "misinformation": "誤情報",
  "scam": "詐欺",
  "engagement-farming": "インプレゾンビ",
  "spam": "スパム",
  "rumor": "根拠のない情報",
  "misleading": "ミスリード",
  "inauthentic": "ボット／なりすまし",

  // ============================================================================
  // OFFICIAL LABELS
  // ============================================================================
  "label-name-porn": "成人向けコンテンツ",
  "label-description-porn": "露骨な性的画像。",
  "label-name-sexual": "性的にきわどい",
  "label-description-sexual": "ヌードは含まれません。",
  "label-name-graphic-media": "生々しいメディア",
  "label-description-graphic-media": "露骨な、または不愉快になる可能性のあるメディア。",
  "label-name-nudity": "性的ではないヌード",
  "label-description-nudity": "例：芸術的なヌード。",

  // ============================================================================
  // REPORTS
  // ============================================================================
  "reportSendAccount": "ユーザーをレポートする",
  "reportSendPost": "ポストをレポートする",
  "reportSendFeed": "フィードをレポートする",
  "reportSendList": "リストをレポートする",
  "reportSendConfirmation": "レポートの送信確認",
  "reportSendConfirmationMessage": "レポートを送信します。よろしいですか？",
  "reportReasonType": "カテゴリー",
  "reportReasonItem": "レポート事由",
  "reportReason": "詳細（任意）",
  "reportReasonDescription": "その他、情報があれば記入してください。",
  "reportCustomAtprotoLabeler": "任意の atproto_labeler",
  "reportCustomAtprotoLabelerPlaceholder": "例： did:web:localhost%3A3000",
  "reportCopyrightViolation": "著作権侵害の報告について",
  "reportReasonMisleading": "誤解を招くこと",
  "reportReasonSexualAdultContent": "成人向けコンテンツ",
  "reportReasonHarassmentHate": "嫌がらせまたはヘイト",
  "reportReasonViolencePhysicalHarm": "暴力行為（暴力）",
  "reportReasonChildSafety": "児童の安全",
  "reportReasonSelfHarm": "自傷または危険行為",
  "reportReasonRuleBreaking": "サイト規約違反",
  "reportReasonMisleadingSpam": "スパム",
  "reportReasonMisleadingScam": "詐欺",
  "reportReasonMisleadingBot": "偽のアカウントまたはボット",
  "reportReasonMisleadingImpersonation": "なりすまし",
  "reportReasonMisleadingElections": "選挙に関する誤った情報",
  "reportReasonMisleadingOther": "その他の誤解を招くコンテンツ",
  "reportReasonSexualUnlabeled": "ラベルのない成人向けコンテンツ",
  "reportReasonSexualAbuseContent": "成人向けの性的虐待コンテンツ",
  "reportReasonSexualNCII": "同意のない親密画像（NCII）",
  "reportReasonSexualDeepfake": "ディープフェイクによる成人向けコンテンツ",
  "reportReasonSexualAnimal": "動物の性的虐待",
  "reportReasonSexualOther": "その他の性的暴力に関するコンテンツ",
  "reportReasonHarassmentTroll": "トローリング（荒らし）",
  "reportReasonHarassmentTargeted": "特定個人への執拗な嫌がらせ",
  "reportReasonHarassmentHateSpeech": "ヘイトスピーチ",
  "reportReasonHarassmentDoxxing": "ドクシング（個人情報晒し）",
  "reportReasonHarassmentOther": "その他嫌がらせや憎悪的なコンテンツ",
  "reportReasonViolenceAnimal": "動物の福祉",
  "reportReasonViolenceThreats": "脅迫または扇動",
  "reportReasonViolenceGraphicContent": "露骨な暴力的コンテンツ",
  "reportReasonViolenceGlorification": "暴力の賛美",
  "reportReasonViolenceExtremistContent": "過激主義的コンテンツ",
  "reportReasonViolenceTrafficking": "人身売買",
  "reportReasonViolenceOther": "その他の暴力的コンテンツ",
  "reportReasonChildSafetyCSAM": "児童性的虐待コンテンツ（CSAM）",
  "reportReasonChildSafetyGroom": "グルーミングまたは捕食的行為（性的搾取目的の接近）",
  "reportReasonChildSafetyPrivacy": "未成年者のプライバシー侵害",
  "reportReasonChildSafetyHarassment": "未成年者への嫌がらせまたはいじめ",
  "reportReasonChildSafetyOther": "その他の児童の安全に関する問題",
  "reportReasonSelfHarmContent": "自傷行為を助長または描写するコンテンツ",
  "reportReasonSelfHarmED": "摂食障害",
  "reportReasonSelfHarmStunts": "危険なチャレンジまたは活動",
  "reportReasonSelfHarmSubstances": "危険物質または薬物の乱用",
  "reportReasonSelfHarmOther": "その他の危険なコンテンツ",
  "reportReasonRuleSitesecurity": "ハッキングまたはシステム攻撃",
  "reportReasonRuleProhibitedSales": "禁止品目・サービスの宣伝または販売",
  "reportReasonRuleBanEvasion": "BANされたユーザーの帰還",
  "reportReasonRuleOther": "その他のネットワーク規約違反",
  "reportReasonOther": "その他",

  // ============================================================================
  // WORD MUTE
  // ============================================================================
  "wordMute": "ワードミュート",
  "wordMuteEnabled": "有効",
  "wordMutePlaceholder": "キーワード1, キーワード2, ...",
  "wordMuteRemoveConfirmation": "ワードミュートの削除",
  "wordMuteRemoveConfirmationMessage": "以下のワードミュートを削除します。よろしいですか？",
  "wordMuteEmpty": "ワードミュートはありません。",
  "wordMuteTerm": "期限",
  "wordMuteNoTerm": "期限なし",
  "wordMuteCurrentTerm": "現在の期限",
  "wordMuteContent": "本文",
  "wordMuteTag": "タグ",
  "wordMuteUrl": "URL",
  "wordMuteExcludeFollowing": "フォロー中のユーザーを除く",

  // ============================================================================
  // PSYCHOLOGICAL SAFETY
  // ============================================================================
  "psySafety": "心理的安全性",
  "hideNotificationBadge": "新着バッジの非表示",
  "hideNotificationBadgeOff": "無効",
  "hideNotificationBadgeOn": "有効",
  "hideNumberOfReaction": "リアクション数の非表示",
  "hideNumberOfReactionOff": "無効",
  "hideNumberOfReactionOn": "有効",
  "postAnonymization": "ポストの匿名化",
  "postAnonymizationOff": "無効",
  "postAnonymizationOn": "有効",
  "anonymous": "（匿名）",

  // ============================================================================
  // LISTS
  // ============================================================================
  "list": "リスト",
  "lists": "リスト",
  "listPurpose": "種類",
  "noList": "このユーザーの管理するリストはありません。",
  "modlist": "モデレーションリスト",
  "curatelist": "ユーザーリスト",
  "referencelist": "リファレンスリスト",
  "unknownlist": "不明なリスト",
  "listFeeds": "リストフィード",
  "listUsers": "リストユーザー",
  "listAdd": "リストの追加",
  "listUpdate": "リストの更新",
  "listEdit": "リストの編集",
  "listEditShort": "編集",
  "listDelete": "リストを削除する",
  "listDeleteMessage": "このリストを削除します。よろしいですか？",
  "listDuplicate": "リストの複製",
  "listDuplicateMessage": "このリストを複製します。\n\n* 最大で5000人まで複製します。\n* 大量のユーザーが登録されたリストを複製すると、1回でレートリミットを超えてしまう可能性があります。100人ほどのリストまでにしてください。\n* サムネイルは複製されません。",
  "listDetectFollowings": "フォロー中ユーザーの検証",
  "listDetectFollowingsNoUsers": "このリストにフォロー中ユーザーはいないようです。\nただし、リストユーザーが5000人以上の場合は保証できません。",
  "listAvatar": "サムネイル",
  "listName": "名前",
  "listDescription": "説明",
  "listUserManagement": "リスト",
  "listUserManagementDetail": "リストユーザーの追加／削除",
  "listMuted": "ミュート中",
  "listMuting": "リストミュート中",
  "listBlocked": "ブロック中",
  "listBlocking": "リストブロック中",
  "by": "by",
  "myList": "マイリスト",
  "myListConfirmation": "マイリストを再取得します。\nリストの数によっては時間のかかる処理になりますが、よろしいですか？",

  // ============================================================================
  // CHAT
  // ============================================================================
  "chat": "チャット",
  "noChat": "チャットがありません。",
  "noChatMessage": "メッセージがありません。",
  "startChat": "チャット",
  "addChatMember": "チャットメンバーの選択",
  "chatMemberPlaceholder": "表示名またはハンドル",
  "chatOk": "チャット可",
  "chatNo": "チャット不可",
  "allow-incoming-all": "全員可",
  "allow-incoming-none": "全員不可",
  "allow-incoming-following": "フォロー中のみ",
  "unreadChatConvo": "既読にする",
  "muteChatConvo": "ミュートする",
  "unmuteChatConvo": "ミュートを解除する",
  "leaveChatConvo": "退室する",
  "deleteChatMessage": "自分だけ削除",
  "chatMessagePlaceholder": "メッセージ",
  "chatUrlPlaceholder": "埋め込みポストのAT URI",
  "leaveChatConvoConfirmation": "チャットから退室します。再入室は可能ですが、現在のメッセージは取得できなくなります。よろしいですか？",
  "errorInvalidChatToken": "チャットの開始に失敗しました。\nアプリパスワードを使用中の場合はチャット権限を付与してください。",
  "chatUrlNotification": "URLの形式がポストのAT URIではありません。",
  "chatFetchInterval": "新着チャットを取得する間隔",
  "chatFetchInterval1": "取得しない",
  "chatFetchInterval2": "15秒ごと",
  "chatFetchInterval3": "30秒ごと",
  "chatFetchInterval4": "1分ごと",
  "chatFetchInterval5": "5分ごと",
  "chatFetchInterval6": "10分ごと",

  // ============================================================================
  // STARTER PACKS
  // ============================================================================
  "packs": "パック",
  "starterPacks": "スターターパック",
  "joinedStarterPack": "スターターパック",
  "latestActivityDate": "最新の更新",
  "oldPostNotification": "2日以上前のポストです",
  "noStarterPacks": "このユーザーの管理するスターターパックはありません。",
  "showStarterPackListFeeds": "リストフィードを見る",
  "showStarterPackListUsers": "リストユーザーを見る",
  "starterPackShare": "共有リンクをコピー",
  "starterPackCreate": "スターターパックを作成",
  "starterPackEdit": "スターターパックを編集",
  "starterPackName": "名前",
  "starterPackDescription": "説明",
  "starterPackDelete": "スターターパックを削除",
  "starterPackDeleteMessage": "このスターターパックを削除します。よろしいですか？\nスターターパックが参照しているリストは削除されません。",

  // ============================================================================
  // VERIFICATIONS
  // ============================================================================
  "verified": "認証アカウント",
  "verifiedAccounts": "認証アカウント一覧",
  "verifier": "認証者",
  "verifiers": "認証者一覧",

  // ============================================================================
  // POSTGATES
  // ============================================================================
  "postgate": "引用制限",
  "postgateAllow": "引用可",
  "postgateNotAllow": "引用不可",
  "attachQuote": "引用を付け直す",
  "detachQuote": "引用を切り離す",

  // ============================================================================
  // THREADGATES
  // ============================================================================
  "threadgate": "リプライ制限",
  "threadgateNoAction": "誰でもリプライ可",
  "threadgateCustomAction": "許可されたユーザーのみリプライ可",
  "threadgateAllowMention": "メンションされたユーザー",
  "threadgateAllowFollower": "あなたのフォロワー",
  "threadgateAllowFollowing": "あなたがフォローしているユーザー",
  "threadgateNotification1": "リプライを許可する対象を5つまで選択できます。",
  "threadgateNotification2": "何もチェックせずに適用するとあなた以外リプライできなくなります。",

  // ============================================================================
  // REACTION CONTROL
  // ============================================================================
  "reactionControl": "反応制限",

  // ============================================================================
  // SETTINGS
  // ============================================================================
  "settings": "設定",
  "designSettings": "デザイン設定",
  "postSettings": "ポスト設定",
  "timeSettings": "時間設定",
  "psySafetySettings": "心理的安全性の設定",
  "etcSettings": "その他の設定",
  "font": "フォント",
  "fontSize": "フォントサイズ",
  "fontSizeSmall": "小",
  "fontSizeMedium": "中",
  "fontSizeLarge": "大",
  "fontKerning": "フォントのカーニング（環境依存）",
  "fontAntialiasing": "フォントのアンチエイリアス（環境依存）",
  "colorTheme": "カラーテーマ",
  "colorThemeAuto": "自動",
  "colorThemeLight": "ライト",
  "colorThemeLightGray": "ライトグレー",
  "colorThemeDark": "ダーク",
  "colorThemeDarkGray": "ダークグレー",
  "mainAreaOpacity": "メインエリアの不透明度",
  "background": "壁紙",
  "backgroundImage": "壁紙のURL",
  "backgroundOpacity": "壁紙の不透明度",
  "backgroundImage1": "背景画像を置いているサーバによっては表示できない場合があります。",
  "backgroundImage2": "CSSプロパティ `background-image` の値も設定できます。\n例： linear-gradient(to bottom, pink, cyan)",
  "development": "開発",
  "dangerZone": "注意が必要な操作",
  "atprotoProxyAppBskySetting": "atproto-proxy（app.bsky用）",
  "setOfficialValue": "公式の値を設定する",
  "resetSettings": "全設定のリセット",
  "resetSettingsDetail": "このアカウントの設定をリセットします。よろしいですか？",

  // ============================================================================
  // TIME SETTINGS
  // ============================================================================
  "date": "日時",
  "timeControl": "時間表記",
  "timeControlRelative": "相対表記",
  "timeControlAbsolute": "絶対表記",
  "timelineFetchInterval": "新着フォロー中フィードをチェックする間隔",
  "timelineFetchInterval1": "チェックしない",
  "timelineFetchInterval2": "10秒ごと",
  "timelineFetchInterval3": "30秒ごと",
  "timelineFetchInterval4": "1分ごと",
  "timelineFetchInterval5": "2分ごと",
  "timelineFetchInterval6": "3分ごと",
  "notificationFetchInterval": "新着通知を取得する間隔",
  "notificationFetchInterval1": "取得しない",
  "notificationFetchInterval2": "15秒ごと",
  "notificationFetchInterval3": "30秒ごと",
  "notificationFetchInterval4": "1分ごと",
  "notificationFetchInterval5": "3分ごと",
  "notificationFetchInterval6": "5分ごと",
  "daysAgo": "日前",
  "startedAt": "開始日",
  "numberOfPostsPerDay": "1日あたり",

  // ============================================================================
  // NOTIFICATION FILTERS
  // ============================================================================
  "notificationFilter": "通知フィルター",
  "notificationFilterList": "この通知を受け取る",
  "notificationFilterIncludeAll": "誰でも",
  "notificationFilterIncludeFollows": "フォロー中",
  "notificationFilterReply": "リプライ通知",
  "notificationFilterMention": "メンション通知",
  "notificationFilterQuote": "引用リポスト通知",
  "notificationFilterRepost": "リポスト通知",
  "notificationFilterRepostViaRepost": "リポストのリポスト通知",
  "notificationFilterLike": "いいね通知",
  "notificationFilterLikeViaRepost": "リポストへのいいね通知",
  "notificationFilterFollow": "フォロー通知",

  // ============================================================================
  // ACTIVITY SUBSCRIPTION
  // ============================================================================
  "subscribe": "購読する",
  "unsubscribe": "購読をやめる",
  "activitySubscription": "購読",
  "activitySubscriptionList": "購読リスト",
  "allowSubscription-followers": "フォロワーのみ",
  "allowSubscription-mutuals": "相互フォロワーのみ",
  "allowSubscription-none": "購読不可",
  "activitySubscriptionPermission": "購読の許可設定",
  "allowSubscriptionsFollowers": "フォロワーのみ購読可",
  "allowSubscriptionsMutuals": "相互フォロワーのみ購読可",
  "allowSubscriptionsNone": "購読不可",

  // ============================================================================
  // CONTENT FOLDING
  // ============================================================================
  "replyFolding": "リプライの折り畳み",
  "replyFolding1": "投稿者自身へのリプライ",
  "replyFolding2": "あなたへのリプライ",
  "replyFolding3": "あなたをフォローしていないユーザーへのリプライ",
  "replyFolding4": "あなたがフォローしていないユーザーへのリプライ",
  "replyFolding5": "あなたがフォローしているユーザーへのリプライ",
  "repostFolding": "リポストの折り畳み",
  "repostFolding1": "投稿者自身によるポストのリポスト",
  "repostFolding2": "あなたによるポストのリポスト",
  "repostFolding3": "あなたをフォローしていないユーザーによるポストのリポスト",
  "repostFolding4": "あなたがフォローしていないユーザーによるポストのリポスト",
  "repostFolding5": "あなたがフォローしているユーザーによるポストのリポスト",

  // ============================================================================
  // REPOST CONTROL
  // ============================================================================
  "disableActionViaRepostControl": "リポスト経由リポスト／いいねの通知制御",
  "disableLikeViaRepost": "リポストをいいねした際にリポストしたユーザーに通知を送らない",
  "disableRepostViaRepost": "リポストをリポストした際にリポストしたユーザーに通知を送らない",

  // ============================================================================
  // REPOST MUTE
  // ============================================================================
  "enableRepost": "リポストミュートを解除",
  "disableRepost": "リポストミュートする",

  // ============================================================================
  // GLOBALLINE SETTINGS
  // ============================================================================
  "globallineContentLanguages": "グローバルフィード用コンテンツ言語",
  "globallineSkipPostHasNoLanguage": "ポスト言語のないポストをフィルタリング",
  "globallinePostTypes": "ポスト種別によるフィルタリング",
  "globallineFollowersCountThreshold": "フォロワー数によるフィルタリング",
  "globallineFollowersCountThresholdPlaceholder": "フィルタリングなし",
  "globallineFollowersCountThresholdDescription": "正数でN人以上、負数でN人以下、0は0人にマッチします。",
  "globallineLayout": "ポストのレイアウト",
  "globallineLayoutPost": "通常",
  "globallineLayoutSlim": "スリム",

  // ============================================================================
  // OFFICIAL_BOOKMARKS
  // ============================================================================
  "officialBookmark": "公式ブックマーク",
  "noOfficialBookmark": "公式ブックマークがありません。",

  // ============================================================================
  // CUSTOM_BOOKMARKS
  // ============================================================================
  "customBookmark": "拡張ブックマーク",
  "noCustomBookmark": "拡張ブックマークがありません。",
  "deleteCustomBookmark": "拡張ブックマークを削除",
  "customBookmarkManagement": "拡張ブックマーク",
  "customBookmarkManagementDetail": "拡張ブックマークの作成／更新",
  "addingCustomBookmarkTag": "新しい拡張ブックマークタグ",
  "customBookmarkOutputConfirmation": "読み込み済みのポストをSkyFeedのJSONとしてクリップボードにコピーします（最新の30件まで）。",

  // ============================================================================
  // MY WORDS
  // ============================================================================
  "myWord": "マイワード",
  "newMyWord": "新しいマイワード",
  "noMyWord": "マイワードがありません。追加してください。",
  "deleteMyWord": "マイワードの削除",
  "deleteMyWordMessage": "このマイワードを削除します。よろしいですか？",

  // ============================================================================
  // LIGHTNING
  // ============================================================================
  "lightning": "Lightning",
  "lightningDescription": "ライトニング決済の支払先となるLN-URLやLightning Addressを設定すると、あなたのポストに支払リンク（いわゆるZapボタン）が付与されます。",

  // ============================================================================
  // LIVE STATUS
  // ============================================================================
  "live": "LIVE",
  "actorStatusLiveUntil": "LIVE配信中",
  "actorStatusLiveEdit": "配信ステータスの設定",
  "actorStatusLiveExpiredAt": "表示終了日時",
  "actorStatusLiveUri": "配信URL",
  "actorStatusLiveDurationMinutes": "表示期間（分）",
  "actorStatusOpenLivePage": "配信ページを開く",

  // ============================================================================
  // EXTERNAL SERVICES
  // ============================================================================
  "pnAppleMusic": "Apple Music",
  "pnGiphy": "Giphy",
  "pnGraysky": "Graysky",
  "pnSpotify": "Spotify",
  "pnTenor": "Tenor",
  "pnTwitch": "Twitch",
  "pnYoutube": "Youtube",
  "pnVimeo": "Vimeo",
  "pnNicovideo": "ニコニコ動画",
  "pnFrontpage": "Frontpage",
  "pnLinkat": "Linkat",
  "pnSkyBeMoreBlue": "SkyBeMoreBlue",
  "pnSmokeSignal": "Smoke Signal",
  "pnWhiteWind": "WhiteWind",

  // ============================================================================
  // EXTERNAL APPS
  // ============================================================================
  "openOtherApp": "外部アプリで開く",
  "officialApp": "公式アプリ",
  "officialAppProfile": "公式アプリ - プロフィール",
  "officialAppPost": "公式アプリ - ポスト",
  "officialAppRss": "公式アプリ - RSS",
  "atprotoAtApp": "atproto.at",
  "pdslsApp": "PDSls",
  "wrapperApp": "Bluesky Wrapper",
  "tokimekiApp": "TOKIMEKI Bluesky",
  "witchskyApp": "Witchsky",
  "uniresolverApp": "Universal Resolver",
  "didApp": "did:plc Directory",
  "oplogsApp": "PLC operation logs",

  // ============================================================================
  // LIST MENTIONS
  // ============================================================================
  "listMention": "リストメンション",
  "listMentionNotification": "選択したリストのユーザーに通知を送信します（最大30人まで）。本文にメンションは表示されず、表向きには通知先のユーザーはわかりません。",
  "listMentionNotification2": "この機能は非推奨です。 bsky.social では spam ラベルが貼られます。",

  // ============================================================================
  // HIDDEN FEATURES
  // ============================================================================
  "hiddenFeatures": "非推奨機能",

  // ============================================================================
  // UI ELEMENTS
  // ============================================================================
  "notSet": "未設定",
  "resetTextarea": "テキストエリアをリセットします。よろしいですか？",
  "showQuotePost": "引用元を表示",
  "hideQuotePost": "引用元を隠す",
  "showQuotePostByMutingUser": "ミュート中のユーザーによる引用元を表示",
  "hideQuotePostByMutingUser": "ミュート中のユーザーによる引用元を隠す",
  "showBadge": "バッジを表示",
  "alt": "ALT",
  "official": "公式",
  "suggestedFollows": "おすすめ",
  "share": "共有する",
  "postFeatures": "機能",
  "showDetail": "詳細を表示",
  "hideDetail": "詳細を隠す",
  "noHistory": "履歴はありません。",
  "unknownFeed": "不明なフィード",
  "unknownItem": "不明なアイテム",
  "unknownList": "不明なリスト",

  // ============================================================================
  // CONFIRMATION DIALOGS
  // ============================================================================
  "confirmUrl": "URLの確認",
  "confirmUrlNotification": "下記URLを開きます。よろしいですか？",

  // ============================================================================
  // USER STATUS
  // ============================================================================
  "authenticated": "非公開",
  "unauthenticated": "公開中",
  "beginner": "新規ユーザー",
  "beginnerInPost": "初期ポスト",
  "postViaBridgy": "Post via Bridgy",

  // ============================================================================
  // ERROR MESSAGES
  // ============================================================================
  "error": "エラー",
  "errorMessage": "エラーが発生しました。",
  "warning": "警告",
  "warn": "警告する",
  "errorNotification": "再試行する際は事前にブラウザをリロードしてください。\nエラーが再度発生した場合、エラー内容を添えてご連絡ください。",
  "errorApiFailed": "APIリクエストが失敗しました。",
  "errorDirectAccessFailed": "XRPCへのダイレクトリクエストが失敗しました。",
  "globalError": "不明なエラーが発生しました。",
  "unhandledRejectionError": "Unhandled rejectionエラーが発生しました。",
  "rejectionHandledError": "Rejection handledエラーが発生しました。",
  "apiError": "APIへの接続中にエラーが発生しました。",
  "cidEncodeError": "CIDのエンコードでエラーが発生しました。",
  "downloadImageError": "画像のダウンロード中にエラーが発生しました。",
  "fetchOgpError": "OGPの取得でエラーが発生しました。URLが間違っているか、Blueskyのリンクサーバが落ちている可能性があります。",
  "fetchOgpImageError": "OGP画像の取得でエラーが発生しました。WebページがOGPに対応していない可能性があります。OGP画像を添付せずに再度送信してください。",
  "getSessionError": "ログインに失敗しました。入力内容を確認してください。",
  "oauthResolveIdentityError": "ハンドルまたはDIDが見つかりません。入力内容を確認してください。",
  "oauthSessionRestoreError": "OAuthセッションの復元に失敗しました。再度ログインしてください。",
  "imageCompressionError": "画像の圧縮中にエラーが発生しました。",
  "invalidCidError": "不正なCIDです。",
  "invalidJwtError": "不正なJWTです。",
  "invalidUrlError": "不正なURLです",
  "jwtDecodeError": "JWTのエンコードでエラーが発生しました。",
  "jwtUpdateError": "セッションをアップデートします。\nログインフォームから再ログインしてください。",
  "noJwtError": "JWTがありません。再ログインしてください。",
  "makeAvatarBlobRefError": "アバター画像の処理中にエラーが発生しました。",
  "noAgentError": "エージェントがありません。",
  "noGeneratorError": "フィードジェネレーターがありません。",
  "noListError": "リストがありません。",
  "noSessionError": "有効なセッションがありません。再ログインしてください。",
  "reLoginFailed": "再ログイン失敗",
  "offlineError": "インターネットに接続されていません。",
  "parseOgpError": "OGPの解析中にエラーが発生しました。WebページがOGPに対応していない可能性があります。OGP画像を添付せずに再度送信してください。",
  "refreshJwtExpired": "refreshJWTの期限が切れました。再ログインしてください。",
  "refreshSessionError": "セッションの更新中にエラーが発生しました。再ログインしてください。",
  "resumeSessionError": "セッションの復帰中にエラーが発生しました。\nセッションが切れている可能性があります。再ログインしてください。",
  "translationError": "翻訳中にエラーが発生しました。",

  // ============================================================================
  // INVALID HANDLE
  // ============================================================================
  "invalidHandle": "(不正なハンドル)",
  "suspendedAccount": "(停止中のアカウント)",
  "deactivatedAccount": "(無効化されたアカウント)",
  "notFoundAccount": "(存在しないアカウント)",
  "invalidResponse": "(不正なレスポンス)",
  "unresolvedAccount": "(解決できないハンドル)",

  // ============================================================================
  // DEBUG TOOLS
  // ============================================================================
  "showSource": "ソースを表示する",
  "callApi": "APIをコールする",

  // ============================================================================
  // HANDLE HISTORY
  // ============================================================================
  "handleHistory": "ハンドル変更履歴",
  "handleHistoryNoHandle": "ハンドルが見つかりません",
  "handleHistoryNoEndpoint": "有効なエンドポイントが見つかりません",

  // ============================================================================
  // FEED MIGRATION
  // ============================================================================
  "mergeV1ToV2": "v1フィードをv2フィードにマージ",
  "mergeV1ToV2Confirmation": "v2形式のカスタムフィードにv1形式のカスタムフィードを追加します。\n\n・v0.9.85以前からKlearskyをお使いになられてきた方が対象です。\n・この操作を行うことで公式クライアントとの同期が再開されます。\n・この操作は1回だけ行ってください。",
  "mergeV1ToV2Canceled": "フィードのマージ中にエラーが発生しました。\nv1形式のカスタムフィードが存在しない可能性があります。その場合、マージは不要です。このエラーは無視してください。",
  "myFeedsFetchItemsError": "マイフィードの取得中にエラーが発生しました。\n何らかのフィードジェネレーターまたはリストの取得に失敗した可能性があります。マイフィードの内容に問題がある場合、マイフィードポップアップを閉じずにブラウザをリロードしてください。",

  // ============================================================================
  // EASTER EGG
  // ============================================================================
  "easterEggFancyText": "Fancy text",
  "easterEggInvert": "反転する",
  "easterEggSpaceOut": "空白で区切る",
  "easterEggBold": "太字にする",
  "easterEggItalic": "斜体にする",
  "easterEggStrikethrough": "打ち消し線を引く",
  "easterEggFullWidth": "全角にする",
  "easterEggHalfWidth": "半角にする",
  "easterEggRestore": "テキストを元に戻す",

  // ============================================================================
  // LEGAL
  // ============================================================================
  "privacyPolicy": "プライバシーポリシー",
  "termsOfService": "利用規約",

})
