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
* (アプリケーションファイル)GitHubActionsが実行されると、AWSから取得した値をJSファイルに書き込むShellScriptが実行され、GItHubリポジトリのアプリケーションファイルがS3へ差分アップロードされます。
* (IaCファイル)GitHubActionsが実行されると、実行環境であるUbuntuにcfn-lintがインストールされCloudFormationファイルの構文チェックが実行されます。<br>その後、sam deployコマンドによって、CloudFormation定義ファイルに記載されたサービスがデプロイされます。
* GitHubActionsのEnviromentsにstgとprodが設定されており、一度のPushで二つの環境にアプリケーションファイルがデプロイされます。<br>なお、prod環境へのデプロイは事前に登録されたGItHubユーザによる承認が必要です。  

