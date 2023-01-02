// ユーザープールの設定
var user_pool_id = "ap-northeast-1_ijjGKXaeO"
var client_id = "dmobejjq04an8tvlolljf5ppp"
const poolData = {
  UserPoolId : user_pool_id,
  ClientId : client_id
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

/**
* 画面読み込み時の処理
*/
$(function() {

// Amazon Cognito 認証情報プロバイダーの初期化
AWSCognito.config.region = 'ap-northeast-1'; // リージョン
AWSCognito.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'ap-northeast-1:d51c640b-3543-4cba-83cf-b948e4a05719'
});

// 「Activate」ボタン押下時
$("#activationButton").click(function(event) {
    activate();
});
});

/**
* アクティベーション処理
*/
var activate = function() {

  //エラーメッセージ初期化
  $("div#message span").empty();

  var username = $("#username").val();
  var activationKey = $("#activationKey").val();
  
  // 何か1つでも未入力の項目がある場合、処理を中断
  if (!username | !activationKey) {
    $("div#message span").append("項目に入力漏れがあります");
    return false;
  } 

  var userData = {
      Username : username,
      Pool : userPool
  };
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  
  // アクティベーション処理
  cognitoUser.confirmRegistration(activationKey, true, function(err, result){
      if (err) {
          // アクティベーション失敗の場合、エラーメッセージを画面に表示
          if (err.message != null) {
              if (err.massage == "Invalid verification code provided, please try again.") {
                $("div#message span").append("入力が正しくありません");
              } else {
                $("div#message span").append(err.message);
              }
          }
      } else {
        window.location.href = './signin.html';
      }
  });
};
