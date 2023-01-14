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

//画面読み込み時の処理
$(function() {
  var return_array = [];
  return_arry = AddUserId(return_array);
  var id_token = return_array[0]
  var user_id = return_array[1]
  AddTitleImg();

  var query = location.search;
  var parameter = query.replace("?","")
  var parameter_list = parameter.split("&");
  var en_title = parameter_list[0].replace("title=","");
  var title = decodeURI(en_title)

  //削除
  $("#delete_btn").on('click',function() {
    fetch(`https://{DOMAIN}/mymovie-apigw/movie?user_id=${user_id}&title=${title}`,{
      headers: {
        Authorization: id_token
      },
      method: "delete"
    })
    .then(response => {
      if (!response.ok) {
        //エラーメッセージ表記初期化
        $("div#message span").empty();
        $("div#message span").append("データの削除に失敗しました");
      } else {
        window.location.href = './edit.html';
      }
    })  
    .catch(error => {
      $("div#message span").empty();
      $("div#message span").append("データの削除に失敗しました");
    });
  });

  //ログアウト処理
  $("#signout").on('click',function() {
    if (cognitoUser) {
      cognitoUser.signOut();
    }
  });
});

//ナビバーに表示するリンクを取得
var NavBer = function(){
  $("#register").html('<a class="nav-link" href="./post.html">登録</a>');
  $("#edit").html('<a class="nav-link" href="./edit.html">編集</a>');
  $("#followlist").html('<a class="nav-link" href="./follow.html">フォロー</a>');
  $("#signout").html('<a class="d-flex text-black-50 fs-6" href="./user.html">ログアウト</a>');
};


var AddUserId = function(return_array){
  cognitoUser.getSession(function(err, session) {
    id_token = session["idToken"]["jwtToken"]
    return_array.push(id_token)
    //ナビゲーションバー
    NavBer();
    if (err) {
        console.log(err);
        $(location).attr("href", "signin.html");
    } else {
        user_id = session["accessToken"]["payload"]["username"]
        return_array.push(user_id)
        $("#logo").html(`<a class="navbar-brand" href="./index.html">My Movie</a>`)
        $("#user_id").val(user_id);
      };
  });
  return return_array;
};

var AddTitleImg = function(){
    //query読み出し
    var query = location.search;
    console.log(query)
    var parameter = query.replace("?","")
    var parameter_list = parameter.split("&");
    var en_title = parameter_list[0].replace("title=","");
    var title = decodeURI(en_title)
    var score = parameter_list[1].replace("score=","");
    var poster_path = parameter_list[2].replace("img=","");

    var poster = `<img src="https://image.tmdb.org/t/p/w300_and_h450_bestv2${poster_path}"></a>`
    $("#poster").append(`<p>${poster}</p>`)
    $("#org_score").append(`<input class="form-control" id="score" type="number" min="0" max="100" value="${score}" name="score">`)
    $("#delete").append(`<button class="btn btn-outline-dark" id="delete_btn">削除</button>`)
    $("#title").val(title);
}