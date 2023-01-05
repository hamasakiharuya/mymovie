// ユーザープールの設定
var user_pool_id = "{USER_POOL_ID}"
var client_id = "{CLIENT_ID}"
const poolData = {
  UserPoolId : user_pool_id,
  ClientId : client_id
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
const cognitoUser = userPool.getCurrentUser();

var currentUserData = {};

/**
* 画面読み込み時の処理
*/
$(function() {
  AddUserId();
  GetTime();

  //ログアウト処理
  $("#signout").on('click',function() {
    if (cognitoUser) {
      cognitoUser.signOut();
    }
  });
});

var NavBer = function(){
  $("#edit").html('<a class="nav-link" href="./edit.html">編集</a>');
  $("#followlist").html('<a class="nav-link" href="./follow.html">フォロー</a>');
  $("#signout").html('<a class="d-flex text-black-50 fs-6" href="./user.html">ログアウト</a>');
};


var AddUserId = function(){
  cognitoUser.getSession(function(err, session) {
    if (err) {
        console.log(err);
        $(location).attr("href", "signin.html");
    } else {
        var user_id = session["accessToken"]["payload"]["username"]
        $("#logo").html(`<a class="navbar-brand" href="./index.html">My Movie</a>`)
        $("#user_id").val(user_id);
        cognitoUser.getUserAttributes(function(err, result) {
          if (err) {
              console.log("getUserAttributes error");
          }
          // 取得した属性情報を連想配列に格納
          for (i = 0; i < result.length; i++) {
              currentUserData[result[i].getName()] = result[i].getValue();
          }
          var nickname = currentUserData["preferred_username"];
          var username = nickname + "@" + user_id
          var birthday = currentUserData["birthdate"];
          var num_birthday = birthday.replaceAll('-', '')
          $("#username").val(username);
          $("#birthday").val(num_birthday);
          $("div#post h1").html('<a href="post.html">登録</a>');

          //ナビゲーションバー
          NavBer();
        });
      };
  });
};

var GetTime = function(){
  var now = new Date();
  var Year = now.getFullYear();
  var Month = ('0' + (now.getMonth() + 1)).slice(-2);
  var date = ('0' + now.getDate()).slice(-2);
  var Hour = ('0' + now.getHours()).slice(-2);
  var Min = ('0' + now.getMinutes()).slice(-2);
  var Sec = ('0' + now.getSeconds()).slice(-2);
  var NowTime = "" + Year + Month + date + Hour + Min + Sec;
  $("#now").val(NowTime)
};