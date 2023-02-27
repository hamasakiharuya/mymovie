# Overview
本システムは、過去観たことのある映画を点数をつけて管理するWebアプリケーションです。  
登録した映画を登録日、公開日、点数の順に並び替えて一覧表示でき、他のユーザの一覧も閲覧できます。  
それぞれの映画を登録しているユーザ一覧も表示されるので、その映画を観たユーザが他にどのような映画を観ているか、どの映画に高い点数をつけているかをチェックできます。  
レスポンシブ画面にも対応しています。  
<br>
<img src="./img/readme_movie_list.png" width="1000">
<br>

<img src="./img/readme_movie_%20Responsive.png" width="200">

# サービスURL
<a href="https://mymovie.jp" target="_blank">mymovie.jp</a>	

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
GitHubへのPush時に、GitHubActionsが自動で実行されます。  
(アプリケーションファイル)GitHubActionsが実行されると、AWSからCloudFrontのCNAME、CognitoのUserPool IDを取得しJSファイルに書き込むShellScriptが実行され、GItHubリポジトリにPushしたアプリケーションファイルがS3へ差分アップロードされます。  
(IaCファイル)GitHubActionsが実行されると、実行環境であるUbuntuにcfn-lintがインストールされCloudFormationファイルの構文チェックが実行されます。その後、AWS SAMフレームワークによるsam deployコマンドが実行され、CloudFormation定義ファイルに記載されたサービスがAWS環境にデプロイされます。  
GitHubActionsのEnviromentsにstgとprodが設定されており、一度のPushで二つの環境にアプリケーションファイルがデプロイされます。なお、prod環境へのデプロイは事前に登録されたGItHubユーザによる承認が必要です。  

