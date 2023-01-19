// ユーザープールの設定
var user_pool_id = "{USER_POOL_ID}"
var client_id = "{CLIENT_ID}"
const poolData = {
  UserPoolId : user_pool_id,
  ClientId : client_id
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
const cognitoUser = userPool.getCurrentUser();  // 現在のユーザー

var currentUserData = {};  // ユーザーの属性情報

//画面読み込み時の処理
  $(function() {
  var user_id = "";
  //順序指定
  var list = ""
  var query = location.search;
  list = query.replace("?list=","");

  // 映画を各順に表示
  if (list == "release"){
    release(GetUser(user_id));
  } else if (list == "register"){
    register(GetUser(user_id));
  } else {
    score(GetUser(user_id));
  };

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

//誕生日から年齢を取得
var Age = function(birthdate){
  var now = new Date();
  var Year = now.getFullYear();
  var Month = ('0' + (now.getMonth() + 1)).slice(-2);
  var date = ('0' + now.getDate()).slice(-2);
  var NowTime = "" + Year + "." + Month + date;
  var age = Math.floor(NowTime - birthdate);
  return age;
};


//現在のユーザーの属性情報を取得・表示する
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
                //ナビゲーションバー
                NavBer();
              //ユーザー情報
                var preferred_username = currentUserData["preferred_username"];
                var sns = currentUserData["website"];
                var birthdate = currentUserData["birthdate"].replace("-",".").replace("-","");
                var num_birthdate = Number(birthdate);
                //年齢
                var age = Age(num_birthdate);
                var username = `<span class="text-secondary">${preferred_username}</span><span class="fs-6 text-black-50"> @${user_id}</span> <span class="fs-2 text-secondary fw-light">/</span><span class="fs-4 text-secondary fw-light">Age: ${age}</span>`;
                var website = `<span class="text-secondary fs-5">SNS: <a href="${sns}">${sns}</a></span>`
                $("#username").append(username)
                if (sns && sns !== "non-registered") {
                  $("#sns").append(website)
                };
              })
        }
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
  var link_img = `<div class="col"><div class="card h-100"><a href="./movie.html?title=${title}"><img data-src="https://image.tmdb.org/t/p/w300_and_h450_bestv2${poster_path}" class="card-img-top lazyload" alt=""></a><div class="card-body"><h5 class="card-title">${title}</h5><p class="card-text text-secondary">公開: ${releace}<br>登録: ${register_date}<br><span class="star5_rating" data-rate="${score}"></span><span class="text-warning fs-5">   ${score}</span><span class="text-black-50">/100</span></p></div></div></div>`
  return link_img;
};

var release = function(user_id){
  var uri = `https://{DOMAIN}/api/user?topuser=${user_id}&list=release`
  $.ajax({
    type: 'GET', // HTTPリクエストメソッドの指定
    url: uri, // 送信先URLの指定
    dataType: 'json', // 受信するデータタイプの指定
  })
  .done(function(data) {
    var ItemCount = data[1].Items.length;
    var array_releace = [];
    $("#count").append(`<p class="fs-1"><span class="fs-3">Movies:</span> ${ItemCount}</p>`)
    for(let i = 0; i < ItemCount; i++){
      var data_i = data[1].Items[i];
      var releace_num = data_i.releace;
      var link_img = Card(data_i);
      //公開年代毎に映画を配置
      if (20200000 <= releace_num) {
        $("#movie_image_9").append(link_img)
      }else if (20100000 <= releace_num){
        $("#movie_image_8").append(link_img)
      }else if (20000000 <= releace_num){
        $("#movie_image_7").append(link_img)
      }else if (19900000 <= releace_num){
        $("#movie_image_6").append(link_img)
      }else if (19800000 <= releace_num){
        $("#movie_image_5").append(link_img)
      }else if (19700000 <= releace_num){
        $("#movie_image_4").append(link_img)
      }else if (19600000 <= releace_num){
        $("#movie_image_3").append(link_img)
      }else if (19500000 <= releace_num){
        $("#movie_image_2").append(link_img)
      }else if (19400000 <= releace_num){
        $("#movie_image_1").append(link_img)
      }else if (19300000 <= releace_num){
        $("#movie_image_0").append(link_img)
      };
      array_releace[i] = releace_num;
    };
    //公開年代毎の区切りを表示
    if (array_releace.some(value => 20200000 <= value)){
      $(`#level_9`).append(`<p class="fs-1 text-muted fw-light">2020's</p>`);
    };
    for (let i = 0; i <= 8; i++){
      var releace_age = 1930 + i * 10
      if (array_releace.some(value => releace_age * 10000 <= value && value < (releace_age + 10) * 10000)){
        $(`#level_${i}`).append(`<br><br><p class="fs-1 text-muted fw-light">${releace_age}'s</p>`);
      }
    };
    //画像遅延読み込み
    lazyload();
  })
  .fail(function(data) {
    var error_data = JSON.parse(data.responseJSON.errorMessage);
    var error_message = error_data.description;
    $("div#message span").append(error_message);
  });
};

var register = function(user_id){
  var uri = `https://{DOMAIN}/api/user?topuser=${user_id}&list=register`
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
  .fail(function(data) {
    var error_data = JSON.parse(data.responseJSON.errorMessage);
    var error_message = error_data.description;
    $("div#message span").append(error_message);
  });
};

var score = function(user_id){
  if (user_id == 0) {
    console.log(user_id.length)
    history.back();
    } else {
    var uri = `https://{DOMAIN}/api/user?topuser=${user_id}&list=score`
    $.ajax({
      type: 'GET', // HTTPリクエストメソッドの指定
      url: uri, // 送信先URLの指定
      dataType: 'json', // 受信するデータタイプの指定
    })
    .done(function(data) {
      var ItemCount = data[1].Items.length;
      var array_score = [];
      $("#count").append(`<p class="fs-1"><span class="fs-3">Movies:</span> ${ItemCount}</p>`)
      for(let i = 0; i < ItemCount; i++){
        var data_i = data[1].Items[i];
        var score = data_i.score;
        var link_img = Card(data_i);
        //スコア順に映画を配置
        if (90 <= score) {
          $("#movie_image_9").append(link_img)
        }else if (80 <= score){
          $("#movie_image_8").append(link_img)
        }else if (70 <= score){
          $("#movie_image_7").append(link_img)
        }else if (60 <= score){
          $("#movie_image_6").append(link_img)
        }else if (50 <= score){
          $("#movie_image_5").append(link_img)
        }else if (40 <= score){
          $("#movie_image_4").append(link_img)
        }else if (30 <= score){
          $("#movie_image_3").append(link_img)
        }else if (20 <= score){
          $("#movie_image_2").append(link_img)
        }else if (10 <= score){
          $("#movie_image_1").append(link_img)
        }else if (0 <= score){
          $("#movie_image_0").append(link_img)
        };
        array_score[i] = score;
      };
      //スコア毎の区切りを表示
      if (array_score.some(value => 90 <= value && value <= 100)){
        $(`#level_9`).append(`<p class="fs-4 text-muted fw-light"><span class="star10_rating" data-rate="9"></span> Score: 90 〜 100</p>`);
      };
      for (let i = 0; i <= 8; i++){
        if (array_score.some(value => i * 10 <= value && value < i * 10 + 10)){
          $(`#level_${i}`).append(`<br><br><p class="fs-4 text-muted fw-light"><span class="star10_rating" data-rate="${i}"></span> Score: ${i*10} 〜 ${i*10+9}</p>`);
        }
      };
      //画像遅延読み込み
      lazyload();
    })
  .fail(function(data) {
    var error_data = JSON.parse(data.responseJSON.errorMessage);
    var error_message = error_data.description;
    $("div#message span").append(error_message);
  });
 }
};