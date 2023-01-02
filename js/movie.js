// ユーザープールの設定
var user_pool_id = "ap-northeast-1_ijjGKXaeO"
var client_id = "dmobejjq04an8tvlolljf5ppp"
const poolData = {
  UserPoolId : user_pool_id,
  ClientId : client_id
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
const cognitoUser = userPool.getCurrentUser();  // 現在のユーザー

var currentUserData = {};  // ユーザーの属性情報

//画面読み込み時の処理
$(function() {
  //ログイン判定
  GetUser();

  //query読み出し
  var query = location.search;
  var title = query.replace("?title=","")

  // 映画を見たユーザーを表示
  UserList(title);

  //user検索
  $("#user").on('click',function() {
    var user = $('#user_id').val();
    if (user.length == 0) {
      return false;
    };
    window.location.href = `./user.html?user_id=${user}&list=score`;
  });

  //ログアウト処理
  $("#signout").on('click',function() {
    if (cognitoUser) {
      cognitoUser.signOut();
    }
  });
});

var NavBer = function(){
  $("#register").html('<a class="nav-link" href="./post.html">登録</a>');
  $("#edit").html('<a class="nav-link" href="./edit.html">編集</a>');
  $("#followlist").html('<a class="nav-link" href="./follow.html">フォロー</a>');
  $("#signout").html('<a class="d-flex text-black-50 fs-6" href="./user.html">ログアウト</a>');
};

//現在のユーザーの属性情報を取得・表示する
var GetUser = function(){
  if (cognitoUser != null) {
    //ナビゲーションバー
    NavBer();
    $("#logo").html(`<a class="navbar-brand" href="./index.html">My Movie</a>`)
  } else {
    $("#signinup").html('<a class="d-flex text-black-50 fs-6" href="./signup.html">会員登録</a>&emsp;<a class="d-flex text-black-50 fs-6" href="./signin.html">ログイン</a>');
  }
};

//誕生日から年齢を取得
var Age = function(birthdate){
  var st_birthdate = String(birthdate)
  var birthdate_year = st_birthdate.slice(0,4)
  var birthdate_monday = st_birthdate.slice(4)
  var birthdate_date = birthdate_year + "." + birthdate_monday
  var num_birthdate = Number(birthdate_date)
  var now = new Date();
  var Year = now.getFullYear();
  var Month = ('0' + (now.getMonth() + 1)).slice(-2);
  var date = ('0' + now.getDate()).slice(-2);
  var NowTime = "" + Year + "." + Month + date;
  var age = Math.floor(NowTime - num_birthdate);
  return age;
};

var UserList = function(title){
  var uri = `https://d2qoqe32dzzjx7.cloudfront.net/mymovie-apigw/movie?title=${title}`
  $.ajax({
    type: 'GET', // HTTPリクエストメソッドの指定
    url: uri, // 送信先URLの指定
    dataType: 'json', // 受信するデータタイプの指定
  })
  .done(function(data) {
    console.log(data)
    var title = data.Items[0].title["S"];
    var total_score = 0;
    var poster_path = data.Items[0].image_path["S"];
    var poster = `<img src="https://image.tmdb.org/t/p/w300_and_h450_bestv2${poster_path}"></a>`
    $("#poster").append(`<p>${poster}</p>`)
    $("#movie").append(`<p>${title}</p>`)
    for(let i = 0; i < data.Items.length; i++){
      var user_id = data.Items[i].user_id["S"];
      var user = "@" + user_id;
      var score = data.Items[i].score["N"];
      total_score += Number(score);
      var birthdate = data.Items[i].birthday["N"];
      var age = Age(birthdate);
      var username = `<div class="col">
                        <div><br></div>
                        <div><a href="./user.html?user_id=${user_id}&list=score"><span class="text-secondary fs-2">${user}</span></a> <span class="fs-2 text-secondary fw-light">/</span><span class="fs-4 text-secondary fw-light">Age: ${age}</span></div>
                        <div>&emsp;<span class="star5_rating" data-rate="${score}"></span><span class="fs-6 text-warning">   ${score}</span><span class="fs-6 text-black-50">/100</span></div>
                      </div>`;
      $("#username").append(username)
    }
    var avarage_score = Math.floor(total_score/data.Items.length);
    var avarage = `<span class="star5_rating" data-rate="${avarage_score}"></span>&emsp;<span class="text-warning">${avarage_score}</span><span class="text-black-50">/${data.Items.length}件</span>`
    $("#score").append(avarage);
  })
  .fail(function() {
    console.log("failed")
  });
 }