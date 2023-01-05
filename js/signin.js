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
// 「Sign In」ボタン押下時
$("#signinButton").click(function(event) {
  signIn();
});
});

/**
* サインイン処理
*/
var signIn = function() {
  var username = $('#username').val();
  var password = $('#password').val();
  
  // 何か1つでも未入力の項目がある場合、メッセージを表示して処理を中断
  if (!username | !password) { 
    $("#signin div#message span").empty();
    $("#signin div#message span").append("項目に入力漏れがあります");
    return false; 
  }
  
  // 認証データの作成
  var authenticationData = {
      Username: username,
      Password: password
  };
  var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
  
  var userData = {
      Username: username,
      Pool: userPool
  };
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  
  // 認証処理
  cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {
          var idToken = result.getIdToken().getJwtToken();          // IDトークン
          var accessToken = result.getAccessToken().getJwtToken();  // アクセストークン
          var refreshToken = result.getRefreshToken().getToken();   // 更新トークン
          
          console.log("idToken : " + idToken);
          console.log("accessToken : " + accessToken);
          console.log("refreshToken : " + refreshToken);
          
          window.location.href = './index.html';
      },
      onFailure: function(err) {
          // サインイン失敗の場合、エラーメッセージを画面に表示
          console.log(err);
          $("div#message span").empty();
          if (err.message == "Password attempts exceeded") {
            $("div#message span").append("パスワードを試行回数を超えました");
          } else if (err.message == "Incorrect username or password.") {
            $("div#message span").append("入力が正しくありません");
          };
      }
  });
};