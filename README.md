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
* プロフィールURL登録機能  
* 投稿機能  
* 投稿編集機能  
* 投稿削除機能  
* 映画検索機能  
* ユーザ検索機能  
* 登録映画一覧表示機能  
* 一覧表示並び替え機能(登録日、点数、映画公開日順)  
* ユーザ一覧表示機能  
* フォロー機能  
* フォロー一覧表示機能  
* フォロー削除機能  

# 非機能一覧	
### 可用性  
* 本システムはAWSマネージドサービスの中でもグローバルサービス、VPC外に存在するリージョンサービスのみで構成されており、単一障害点は存在しないシステムとなっている。	
* AWSより提供されているマネージドサービスそれぞれの可用性目標値は以下を参照。いずれも99.900%を超える高い可用性目標値が設定されている。  
https://docs.aws.amazon.com/ja_jp/wellarchitected/latest/reliability-pillar/appendix-a-designed-for-availability-for-select-aws-services.html	
	
### 性能・拡張性	
AWSマネージドサービスの拡張機能を以下に記載する。	
* CloudFront  
	CloudFrontはデフォルトで150Gbpsのデータ転送速度、ディストリビューションあたり250,000リクエスト数の処理性能が提供されている。これらの値は申請をすることで上限緩和が可能である。
* API Gateway  
	毎秒10,000リクエストの処理性能に加え最大5,000リクエストのバースト容量が提供されている。バースト容量を除く処理性能は申請をすることで上限緩和が可能である。
* Lambda  
	Lambda関数に割り当てられるメモリの量は128MB〜10,240MBの範囲で設定でき、この値によって仮想CPUの量も決まる。同時実行数はでリージョンあたりデフォルトで1,000回の呼び出しが提供されており、この値は申請をすることで上限緩和が可能である。
* DynamoDB  
	オンデマンドキャパシティモードを設定すると、無制限の読み取り/書き込み性能が提供されるようトラフィック量によりスケールアウトされる。初回のスケールアウトは毎秒4,000書き込みユニット、12,000読み取りユニットが即座に維持されるよう設定し、以降は前回のピークトラフィックの最大2倍までの性能が即座に維持される。テーブルの項目数、バイト数は無制限である。
* S3  
	パーティション化されたプレフィックス毎に毎秒3,500以上のPUT、毎秒5,500回以上のGETリクエストが可能である。バケット内のプレフィックスの量は無制限のため、プレフィックスを作成し処理を並列化することで拡張可能である。
* KinesisDataFirehose  
	配信ストリーム毎にデフォルトで毎秒最大2,000トランザクション、5,000レコード、5MB書き込みが可能である。これらの値は申請をすることで上限緩和が可能である。
	
### 運用・保守性	
* IAM  
  * IAMユーザは管理アカウントのみに作成する。各AWSアカウントにAdministrator権限ポリシーを含んだロールを作成し、AWSマネジメントコンソール操作は管理アカウントのIAMユーザがスイッチロールすることで行う。  
* 監視  
  * 各システムアカウントのCloudWatchメトリクスを運用監視アカウントで閲覧できるよう設定し、メトリクス監視は運用監視基盤で行う。  
  * AWS利用料監視は管理アカウントで行い、設定した料金を超えた場合メール通知するよう設定する。また、設定した月の予算に達した場合は、Route53で設定されたサービスURLが書き変わるLambdaが実行され、サービスが停止する。  
  * 各システムのCloudFrontアクセスログ、APIGatewayアクセスログ、Lambdaエラーログはログ集約アカウントのS3に保存し、Athenaを利用し閲覧する。  
* バックアップ  
  * サービスの資産であるユーザの投稿データが保存されたDynamoDBテーブルのみ、AWS Backupを利用し日毎にバックアップを取得し、7日分保存する。  
* 保守  
  * 本システムはすべてAWSマネージドサービスを利用しているため、保守作業はない。また、AWS側のメンテナンスによるサービス停止も発生しない。  
	
### セキュリティ	
* AWSアカウント管理  
  * AWSマネジメントコンソールにログインするIAMユーザは、すべて管理アカウントに集約する。各AWSアカウントの操作は管理アカウントのIAMユーザが、他アカウントのロールにスイッチすることで実現する。  
  * 管理者が一人のため、管理アカウントのIAMユーザ、各アカウントのロールにはAdministrator権限ポリシーを付与する。  
* ネットワークセキュリティ  
  * 各AWSサービスへのインバウンド通信は意図した通信元からの通信のみ受け付けるよう、IAMロール、ポリシー、S3バケットポリシーは最小権限で設計する。  
  * CloudFrontのOAC、APIGatewayのAPIキーを利用することで、S3、APIGatewayへの外部アクセスをCloudFrontを経由した通信のみに限定する。  
  * 本システムはAWSから標準で提供されている、DDoS攻撃を検知緩和するAWS Shield Standardによる保護を受けている。  
* 暗号化  
  * 本システムにより発生する通信は、すべてTLSによる通信暗号化を行う。外部からの通信に使用するTLS証明書はAWS Certificate Managerで発行、管理し、CloudFrontに適用する。  
  * AWS環境に保存されるデータはすべてAWS管理のキーを使用し暗号化する。  


