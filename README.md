# Overview
本システムは、過去観たことのある映画を点数をつけて管理するWebアプリケーションです。  
登録した映画を登録日、公開日、点数の順に並び替えて一覧表示でき、他のユーザの一覧も閲覧できます。  
レスポンシブ画面にも対応しています。  
<br>
<img src="./img/readme_movie_list.png" width="1000">
<br>

<img src="./img/readme_movie_%20Responsive.png" width="200">

# サービスURL
<p><a href="https://mymovie.jp/" target="_blank">mymovie.jp</a></p>
TOPページ下方の「他ユーザのMyMovieを見る」ボタンから、ログインせずに投稿映画一覧が閲覧できます。

# 使用技術
* フロントエンド
  * HTML  
  * CSS  
  * JavaScript  
  * Bootstrap 5  
* バックエンド  
  * Python 3.9  
  * Node.js 14  
* インフラ(AWS)  
  * CloudFront  
  * S3  
  * API Gateway  
  * Lambda  
  * DynamoDB  
  * Cognito  
  * AWS Organizations  
  * AWS Backup  
  * CloudWatch  
  * CloudWatchLogs  
  * KinesisDataFirehose  
  * EventBridge  
  * SNS  
  * Athena  
  * Route53  
  * AWSCertificateManager  
  * CloudFormation  
  * AWS SAM  
* コード管理  
  * GitHub  
* CI/CD  
  * GItHub Actions  
  * Ubuntu  
* API  
  * TMDB  

# システム構成図
<img src="./img/system_ architecture.png" width="800">

# CI/CD
* GitHubへPush時に、GitHub Actionsが自動で実行されます。
* (アプリケーションファイル)GitHubActionsが実行されると、AWSから取得した値をJSファイルに書き込むShellScriptが実行され、GItHubリポジトリのアプリケーションファイルがS3へ差分アップロードされます。
* (IaCファイル)GitHubActionsが実行されると、実行環境であるUbuntuにcfn-lintがインストールされCloudFormationファイルの構文チェックが実行されます。<br>その後、sam deployコマンドによって、CloudFormation定義ファイルに記載されたサービスがデプロイされます。
* GitHubActionsのEnviromentsにstgとprodが設定されており、一度のPushで二つの環境にアプリケーションファイルがデプロイされます。<br>なお、prod環境へのデプロイは事前に登録されたGItHubユーザによる承認が必要です。  

# 機能一覧
* ユーザ登録、ログイン機能  
ユーザ登録、ログインして、投稿サービスを利用できます。
* プロフィールURL登録機能  
ユーザ情報にSNSのマイページなどのURLをひとつ登録、表示できます。
* 投稿機能  
映画を0〜100までのスコアをつけて投稿できます。
* 投稿編集機能  
投稿した映画のスコアを編集できます。
* 投稿削除機能  
投稿した映画を削除できます。
* 映画検索機能  
映画投稿時、タイトルの一部から特定の映画を検索できます。
* ユーザ検索機能  
サービスに登録しているユーザのユーザIDから特定のユーザを検索できます。
* 登録映画一覧表示機能  
投稿した映画を一覧表示できます。
* 一覧表示並び替え機能(登録日、点数、映画公開日順)  
一覧表示された映画を投稿日、スコア、映画公開日順に降順に並べ替えできます。
* ユーザ一覧機能  
映画を投稿しているユーザ一覧を表示できます。
* フォロー機能  
特定のユーザをフォローできます。
* フォロー一覧機能  
フォローしたユーザを一覧表示できます。
* フォロー削除機能  
フォローしたユーザを一覧から削除できます。

