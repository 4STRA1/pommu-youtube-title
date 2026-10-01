Pommu YouTubeタイトル自動入力

DLsiteの「pommu」の投稿作成画面で、入力欄にYouTubeのURLを貼り付けると、YouTube動画のタイトルを自動で取得してURLの前に入力するTampermonkeyユーザースクリプトです。

対応サイト

https://ch.dlsite.com/pommu/

インストール

Tampermonkey必須。

↓Google Chrome版↓
https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=ja

↓Firefox版↓
https://addons.mozilla.org/ja/firefox/addon/tampermonkey/

Tampermonkeyを起動し、ユーティリティ → URLからインポートで以下のURLを入力してください。

https://raw.githubusercontent.com/4STRA1/pommu-youtube-title/main/pommu-youtube-title.user.js

インストール画面が表示されたら「インストール」を選択してください。

また、js本体のプログラムコードをコピーして、新規ユーザースクリプトに貼り付けて保存することでもインストールできます。

機能

- YouTubeのURLを自動検出
- YouTube動画のタイトルを自動取得
- 取得したタイトルをURLの直前に自動入力
- YouTubeの通常動画に対応
- YouTube Shortsに対応
- YouTube Liveに対応
- "youtu.be"形式のURLに対応
- 複数のYouTube URLに対応
- テキストエリア・入力欄・ContentEditableに対応
- タイトル取得失敗時は再取得に対応
- 投稿画面を開いている間、自動でタイトルを処理

使い方

Pommuの投稿作成画面を開きます。

入力欄にYouTubeのURLを入力または貼り付けます。

例えば、

https://www.youtube.com/watch?v=XXXXXXXXXXX

と入力すると、YouTubeから動画タイトルを取得して、

動画のタイトル
https://www.youtube.com/watch?v=XXXXXXXXXXX

のように自動で入力されます。

複数のYouTube URLを入力した場合も、それぞれのURLを検出してタイトルを追加します。

対応するYouTube URL

以下の形式に対応しています。

通常の動画

https://www.youtube.com/watch?v=XXXXXXXXXXX

Shorts

https://www.youtube.com/shorts/XXXXXXXXXXX

YouTube Live

https://www.youtube.com/live/XXXXXXXXXXX

短縮URL

https://youtu.be/XXXXXXXXXXX

URLの前後に文章がある場合でも、入力欄内からYouTube URLを検出して処理します。

タイトルの取得方法

YouTubeのoEmbed APIを使用して動画タイトルを取得します。

取得したタイトルはスクリプト内で一時的に保持され、同じ動画IDについて何度もタイトルを取得しないようになっています。

タイトルの取得に失敗した場合は一定時間待ってから再取得できます。

通信について

このスクリプトは、YouTube動画のタイトルを取得するためにYouTubeのoEmbedエンドポイントへリクエストを送信します。

使用するURL：

https://www.youtube.com/oembed

Pommu側のAPIへ追加のリクエストを送信する仕組みはありません。

権限について

Tampermonkeyの以下の権限を使用します。

GM_xmlhttpRequest

YouTubeからタイトルを取得するために使用しています。

また、YouTubeへの通信を許可するため、

@connect www.youtube.com

を設定しています。

更新

スクリプトにはGitHubのRawファイルを更新先として設定しています。

GitHub上でスクリプトを更新し、"@version"を変更することで新しいバージョンを公開できます。

現在のバージョン：

"1.2"

更新用URL：

https://raw.githubusercontent.com/4STRA1/pommu-youtube-title/main/pommu-youtube-title.user.js

GitHub

リポジトリ：

https://github.com/4STRA1/pommu-youtube-title

作者：

https://github.com/4STRA1

注意事項

このスクリプトはDLsiteおよびYouTubeの公式機能ではありません。

YouTube側の仕様変更やoEmbed APIの仕様変更などにより、正常にタイトルを取得できなくなる場合があります。

動画が削除されている場合や、YouTubeからタイトルを取得できない場合は自動入力されません。

Pommu側の投稿画面の仕様変更によって動作しなくなる可能性もあります。