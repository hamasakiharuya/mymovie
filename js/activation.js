// ユーザープールの設定
var user_pool_id = "{USER_POOL_ID}"
var client_id = "{CLIENT_ID}"
const poolData = {
  UserPoolId : user_pool_id,
  ClientId : client_id
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

/**
* 画面読み込み時の処理
*/
$(function() {
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
