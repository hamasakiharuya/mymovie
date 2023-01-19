// ユーザープールの設定
var user_pool_id = "{USER_POOL_ID}"
var client_id = "{CLIENT_ID}"
const poolData = {
  UserPoolId : user_pool_id,
  ClientId : client_id
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

var attributeList = [];

$(function() {
  //生年月日のオプション
  var now = new Date();
  var Year = now.getFullYear();
  for (let i = Year; i >= 1920; i--) {
    $("#year").append(`<option>${i}</option>`)
  };
  for (let i = 1; i <= 31; i++) {
    num_arry = [1,2,3,4,5,6,7,8,9]
    if (num_arry.includes(i)) {
      i = "0" + i
    }
    $("#day").append(`<option>${i}</option>`)
  };

        
  // 「Create Account」ボタン押下時
  $("#createAccount").click(function(event) {
    //エラーメッセージ表記初期化
    $("#signup div#message span").empty();
    signUp();
  });
});

/**
* サインアップ処理。
*/
var signUp = function() {
  var username = $("#username").val();
  var email = $("#email").val();
  var email_md5 = CybozuLabs.MD5.calc(email);
  var name = $("#name").val();
  //誕生日
  var year = $("#year").val();
  var month = $("#month").val();
  var day = $("#day").val();
  var birthdate = year + "-" + month + "-" + day
  var sns = $("#sns").val();
  var password = $("#password").val();

    //空欄チェック
    if (!username | !email | !name | !birthdate | !password) { 
      $("#signup div#message span").append("項目に入力漏れがあります");
      return false;
    }

    //nameの長さチェック
    if (username.length >= 16 || name >= 16) {
      $("#signup div#message span").append("User ID / NickName は16文字までです");
      return false;
    }

    //nameの中身チェック
    var vaildname = /^[a-zA-Z0-9!-/:-@¥[-`{-~]+$/;
    if(!vaildname.test(username)){
      $("#signup div#message span").append("User ID が正しくありません");
      return false;
    }

    //メールアドレスチェック
    var vaildemail = /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]+.[A-Za-z0-9]+$/;
    if(!vaildemail.test(email)){
      $("#signup div#message span").append("メールアドレスが正しくありません");
      return false;
    }

    //パスワード判定
    var vaildpassword = isValidPassword(password)
    if(!vaildpassword){
      $("#signup div#message span").append("パスワードが正しくありません(英大/小文字/数字を入れた6文字以上)");
      return false;
    }

  fetch(`https://{DOMAIN}/api/useremail?username=${username}&email=${email_md5}`)
    .then(response => {
      return response.json();
    })
    .then(data => {
      var data_json = JSON.parse(data);
      var status_code = data_json.statusCode;
      var message = data_json.body;
      if (status_code != 200){
        //エラーのないようをHTMLに挿入
        if (message == "Email already exists") {
          $("#signup div#message span").append("Emailはすでに登録されています");
        } else if (message == "usernmae already exists") {
          $("#signup div#message span").append("User IDはすでに登録されています");
        } else {
          $("#signup div#message span").append(message);
        }
        return false;
      }else{
        // ユーザ属性リストの生成
        var dataEmail = {
          Name : "email",
          Value : email
        }

        var dataName = {
          Name : "preferred_username",
          Value : name
        }

        var dataSNS = {
          Name : "website",
          Value : sns
        }

        var dataBirthdate = {
          Name : "birthdate",
          Value : birthdate
        }

        var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
        var attributeName = new AmazonCognitoIdentity.CognitoUserAttribute(dataName);
        var attributeSNS = new AmazonCognitoIdentity.CognitoUserAttribute(dataSNS);
        var attributeBirthdate = new AmazonCognitoIdentity.CognitoUserAttribute(dataBirthdate);

          attributeList.push(attributeEmail);
          attributeList.push(attributeName);
          attributeList.push(attributeSNS);
          attributeList.push(attributeBirthdate);
            
          // サインアップ処理
          userPool.signUp(username, password, attributeList, null, function(err, result){
            if (err) {
              $("#signup div#message span").append(err.message);
            return;
            } else {
              console.log(username);
              window.location.href = './activation.html';
            }
          });
        }
    })    
    .catch(error => {
      $("#signup div#message span").append("登録情報の送信に失敗しました");
    });
}

var ratz = /[a-z]/, rAtZ = /[A-Z]/, r0t9 = /[0-9]/;
function isValidPassword(str) {
  return ratz.test(str) && rAtZ.test(str) && r0t9.test(str) && str.length >= 6;
}