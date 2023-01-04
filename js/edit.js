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
var attributeList = [];

//画面読み込み時の処理
$(function() {
  var user_id = "";
  var user = GetUser(user_id);
  register(user);

  // 「Update」ボタン押下時
  $("#UpdateButton").click(function() {
    Update();
  });

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

//ナビバーに表示するリンクを取得
var NavBer = function(){
  $("#register").html('<a class="nav-link" href="./post.html">登録</a>');
  $("#edit").html('<a class="nav-link" href="./edit.html">編集</a>');
  $("#followlist").html('<a class="nav-link" href="./follow.html">フォロー</a>');
  $("#signout").html('<a class="d-flex text-black-50 fs-6" href="./user.html">ログアウト</a>');
};

/**
* 現在のユーザーの属性情報を取得・表示する
*/
var GetUser = function(user_id){
    if (cognitoUser != null) {
      cognitoUser.getSession(function(err, session) {
        if (err) {
            console.log(err);
            $(location).attr("href", "signin.html");
        } else {
          user_id = session["accessToken"]["payload"]["username"]
          $("#logo").html(`<a class="navbar-brand" href="./index.html">My Movie</a>`)
          // ユーザの属性を取得
          cognitoUser.getUserAttributes(function(err, result) {
            if (err) {
                $(location).attr("href", "signin.html");
            }
            // 取得した属性情報を連想配列に格納
            for (i = 0; i < result.length; i++) {
                currentUserData[result[i].getName()] = result[i].getValue();
            }
            var preferred_username = currentUserData["preferred_username"];
            var sns = currentUserData["website"];
            //ナビゲーションバー
            NavBer();
            $("#preferred_username").append(`<input class="form-control" id="username" value="${preferred_username}"><input class="form-control" id="user_id" value="${user_id}" type="hidden">`)
            if (sns) {
              $("#sns").append(`<input class="form-control" id="website" value="${sns}">`)
            } else {
              $("#sns").append(`<input class="form-control" id="website" value="">`)
            };
            
          });
        };
      });
      return user_id;
  } else {
      $(location).attr("href", "signin.html");
  }
}

//DBからの情報を映画カードに整形
var Card = function(data_i){
  var title = data_i.title;
  var releace_all = String(data_i.releace);
  var releace_year = releace_all.slice(0,4)
  var releace_mon = releace_all.slice(4,6)
  var releace_day = releace_all.slice(6)
  var releace = releace_year + "/" + releace_mon + "/" + releace_day
  var register_date_all = String(data_i.date);
  var register_date_year = register_date_all.slice(0,4)
  var register_date_mon = register_date_all.slice(4,6)
  var register_date_day = register_date_all.slice(6,8)
  var register_date = register_date_year + "/" + register_date_mon + "/" + register_date_day
  var score = data_i.score;
  var poster_path = data_i.image_path;
  var link_img = `<div class="col"><div class="card h-100"><a href="./movie.html?title=${title}"><img data-src="https://image.tmdb.org/t/p/w300_and_h450_bestv2${poster_path}" class="card-img-top lazyload" alt=""></a><div class="card-body"><h5 class="card-title">${title}</h5><p class="card-text text-secondary">公開: ${releace}<br>登録: ${register_date}<br><span class="star5_rating" data-rate="${score}"></span><span class="text-warning fs-5">   ${score}</span><span class="text-black-50">/100</span></p><p class="d-flex justify-content-end"><a class="fa-solid fa-pen-to-square text-secondary" href="./update.html?title=${title}&score=${score}&img=${poster_path}"></a></p></div></div></div>`
  return link_img;
};

var register = function(user_id){
  var uri = `https://{DOMAIN}/mymovie-apigw/user?topuser=${user_id}&list=register`
  $.ajax({
    type: 'GET', // HTTPリクエストメソッドの指定
    url: uri, // 送信先URLの指定
    dataType: 'json', // 受信するデータタイプの指定
  })
  .done(function(data) {
    var ItemCount = data[1].Items.length;
    $("#count").append(`<p class="fs-1"><span class="fs-3">Movies:</span> ${ItemCount}</p>`)
    for(let i = 0; i < ItemCount; i++){
      var data_i = data[1].Items[i];
      var link_img = Card(data_i);
      $("#movie_image_9").append(link_img)
    }
    //画像遅延読み込み
    lazyload();
  })
  .fail(function() {
    console.log("failed")
  });
};

//ニックネーム、SNS変更処理
var Update = function(){

  var preferred_username = $("#username").val();
  var sns = $("#website").val();

  //https付与 未登録
  if (!(sns) || sns === "non-registered") {
    sns = "non-registered"
  } else if (!(sns.indexOf("https") === 0)) {
    sns = "https://" + sns
  };

  // ユーザ属性リストの生成
  var data_preferred_username = {
    Name : "preferred_username",
    Value : preferred_username
  }
  if (sns) {
    var data_website = {
      Name : "website",
      Value : sns
    }
  };

  var attributeName = new AmazonCognitoIdentity.CognitoUserAttribute(data_preferred_username);
  if (data_website) {
    var attributeSns = new AmazonCognitoIdentity.CognitoUserAttribute(data_website);
  }

  attributeList.push(attributeName);
  if (attributeSns) {
    attributeList.push(attributeSns);
  };

  cognitoUser.updateAttributes(attributeList, function(err, result) {
    if (err) {
      alert(err.message || JSON.stringify(err));
      return;
    }
    Updateuser();
    console.log('call result: ' + result);
    window.location.href = './index.html';
  });
}

var Updateuser = function(){
  var user = $("#user_id").val();
  fetch(`https://{DOMAIN}/mymovie-apigw/user?upduser=${user}`,{
      method: "put"
    })
    .then(response => {
      return response.json();
    })
    .then(data => {
      console.log(data)
    })    
    .catch(error => {
    console.log("失敗しました");
    });
};