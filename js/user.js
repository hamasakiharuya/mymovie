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
  var id_token = "";
  id_token = GetUser(id_token);

  //query読み出し
  var query = location.search;
  console.log(query)
  if(query){
    var parameter = query.replace("?","");
    var parameter_list = parameter.split("&");
    var user_id = parameter_list[0].replace("user_id=","");
    var list = parameter_list[1].replace("list=","");
    //順番ボタン配置
    Order(user_id);
    // 映画を各順に表示
    if (list == "release"){
      release(user_id);
    } else if (list == "register"){
      register(user_id);
    } else {
      score(user_id);
    };
  }else{
    RandomUser();
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

  //ログインユーザーとフォロー対象
  var user = "";
  var login_user = Login_user(user);
  var query = location.search;
  if(query){
    var parameter = query.replace("?","");
    var parameter_list = parameter.split("&");
    //followされる側のuser_id
    var follow = parameter_list[0].replace("user_id=","");
  };

  //フォローする
  $("#follow").on('click',function() {
    Follow(login_user, follow, id_token);
  });
});

//ナビバーに表示するリンクを取得
var NavBer = function(){
  $("#register").html('<a class="nav-link" href="./post.html">登録</a>');
  $("#edit").html('<a class="nav-link" href="./edit.html">編集</a>');
  $("#followlist").html('<a class="nav-link" href="./follow.html">フォロー</a>');
  $("#signout").html('<a class="d-flex text-black-50 fs-6" href="./user.html">ログアウト</a>');
};

//順番ボタン配置
var Order = function(user_id){
  $("#nav_order").html(`
    <li><a class="dropdown-item" href="https://{DOMAIN}/user.html?user_id=${user_id}&list=score">スコア順</a></li>
    <li><a class="dropdown-item" href="https://{DOMAIN}/user.html?user_id=${user_id}&list=release">公開日順</a></li>
    <li><a class="dropdown-item" href="https://{DOMAIN}/user.html?user_id=${user_id}&list=register">登録日順</a></li>
  `);
}

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

//現在のユーザーの属性情報を取得・表示する
var GetUser = function(id_token){
  if (cognitoUser != null) {
    //ナビゲーションバー
    NavBer();
    $("#logo").html(`<a class="navbar-brand" href="./index.html">My Movie</a>`)
    //IDtoken取得
    cognitoUser.getSession(function(err, session) {
      id_token = session["idToken"]["jwtToken"]
    });
    return id_token
  } else {
    $("#signinup").html('<a class="d-flex text-black-50 fs-6" href="./signup.html">会員登録</a>&emsp;<a class="d-flex text-black-50 fs-6" href="./signin.html">ログイン</a>');
  }
}

//userテーブルからuser_idをランダムで取得
var RandomUser = function(){
  var uri = `https://{DOMAIN}/mymovie-apigw/userid`
  $.ajax({
    type: 'GET', // HTTPリクエストメソッドの指定
    url: uri, // 送信先URLの指定
    dataType: 'json', // 受信するデータタイプの指定
  })
  .done(function(data){
    var user_id = data[0].Items[0].user_id;
    var preferred_username = data[0].Items[0].preferred_username;
    var birthdate = data[0].Items[0].birthdate;
    var sns = data[0].Items[0].sns;
    //年齢
    var age = Age(birthdate);
    var username = `<span class="text-secondary">${preferred_username}</span><span class="fs-6 text-black-50"> @${user_id}</span> <span class="fs-2 text-secondary fw-light">/</span><span class="fs-4 text-secondary fw-light">Age: ${age}</span>`;
    var website = `<span class="text-secondary fs-5">SNS: <a href="${sns}">${sns}</a></span>`
    $("#username").append(username);
    Order(user_id);
    //フォローボタン
    GetUser_Follow(user_id);
    if (sns && sns !== "non-registered") {
      $("#sns").append(website)
    };
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
  .fail(function(){
    console.log("failed")
  });
};

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
  var uri = `https://{DOMAIN}/mymovie-apigw/user?topuser=${user_id}&list=release`
  $.ajax({
    type: 'GET', // HTTPリクエストメソッドの指定
    url: uri, // 送信先URLの指定
    dataType: 'json', // 受信するデータタイプの指定
  })
  .done(function(data) {
   //ユーザー
    //ユーザーが存在しない場合
    if (data[0].Items[0] == null) {
      history.back();
     } else {
      var query = location.search;
      if(query){
        var parameter = query.replace("?","");
        var parameter_list = parameter.split("&");
        //followされる側のuser_id
        var follow = parameter_list[0].replace("user_id=","");
        //followリストからのuserページはフォローボタンを出さない
        if(parameter_list[2]){
          var already_follow = parameter_list[2].replace("follow=","");
        }
      }
      if (follow) {
        if(already_follow){
          GetUser_Follow(follow,already_follow);
        }else{
          GetUser_Follow(follow);
        }
      };
  
      var preferred_username = data[0].Items[0].preferred_username;
      var birthdate = data[0].Items[0].birthdate;
      var sns = data[0].Items[0].sns;
      //年齢
      var age = Age(birthdate);
      var username = `<span class="text-secondary">${preferred_username}</span><span class="fs-6 text-black-50"> @${user_id}</span> <span class="fs-2 text-secondary fw-light">/</span><span class="fs-4 text-secondary fw-light">Age: ${age}</span>`;
      var website = `<span class="text-secondary fs-5">SNS: <a href="${sns}">${sns}</a></span>`
      $("#username").append(username)
      if (sns && sns !== "non-registered") {
        $("#sns").append(website)
      };

      //映画
      var ItemCount = data[1].Items.length;
      console.log(ItemCount)
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
    };
  })
  .fail(function() {
    console.log("failed")
  });
};


var register = function(user_id){
  var uri = `https://{DOMAIN}/mymovie-apigw/user?topuser=${user_id}&list=register`
  $.ajax({
    type: 'GET', // HTTPリクエストメソッドの指定
    url: uri, // 送信先URLの指定
    dataType: 'json', // 受信するデータタイプの指定
  })
  .done(function(data) {
    //ユーザー
    //ユーザーが存在しない場合
   if (data[0].Items[0] == null) {
    history.back();
   } else {
      var query = location.search;
      if(query){
        var parameter = query.replace("?","");
        var parameter_list = parameter.split("&");
        //followされる側のuser_id
        var follow = parameter_list[0].replace("user_id=","");
        //followリストからのuserページはフォローボタンを出さない
        if(parameter_list[2]){
          var already_follow = parameter_list[2].replace("follow=","");
        }
      }
      if (follow) {
        if(already_follow){
          GetUser_Follow(follow,already_follow);
        }else{
          GetUser_Follow(follow);
        }
      };

      var preferred_username = data[0].Items[0].preferred_username;
      var birthdate = data[0].Items[0].birthdate;
      var sns = data[0].Items[0].sns;
      //年齢
      var age = Age(birthdate);
      var username = `<span class="text-secondary">${preferred_username}</span><span class="fs-6 text-black-50"> @${user_id}</span> <span class="fs-2 text-secondary fw-light">/</span><span class="fs-4 text-secondary fw-light">Age: ${age}</span>`;
      var website = `<span class="text-secondary fs-5">SNS: <a href="${sns}">${sns}</a></span>`
      $("#username").append(username);
      console.log(sns)
      if (sns && sns !== "non-registered") {
        $("#sns").append(website)
      };
      var ItemCount = data[1].Items.length;
      $("#count").append(`<p class="fs-1"><span class="fs-3">Movies:</span> ${ItemCount}</p>`)
      for(let i = 0; i < ItemCount; i++){
        var data_i = data[1].Items[i];
        var link_img = Card(data_i);
        $("#movie_image_9").append(link_img)
      }
      //画像遅延読み込み
      lazyload();
    };
  })
  .fail(function() {
    console.log("failed")
  });
};

var score = function(user_id){
  var uri = `https://{DOMAIN}/mymovie-apigw/user?topuser=${user_id}&list=score`
  $.ajax({
    type: 'GET', // HTTPリクエストメソッドの指定
    url: uri, // 送信先URLの指定
    dataType: 'json', // 受信するデータタイプの指定
  })
  .done(function(data) {
   //ユーザー
   //ユーザーが存在しない場合
   if (data[0].Items[0] == null) {
    history.back();
   } else {
    //フォローボタン
    var query = location.search;
    if(query){
      var parameter = query.replace("?","");
      var parameter_list = parameter.split("&");
      //followされる側のuser_id
      var follow = parameter_list[0].replace("user_id=","");
      //followリストからのuserページはフォローボタンを出さない
      if(parameter_list[2]){
        var already_follow = parameter_list[2].replace("follow=","");
      }
    }
    if (follow) {
      if(already_follow){
        GetUser_Follow(follow,already_follow);
      }else{
        GetUser_Follow(follow);
      }
    };

    var preferred_username = data[0].Items[0].preferred_username;
    var birthdate = data[0].Items[0].birthdate;
    var sns = data[0].Items[0].sns;
    //年齢
    var age = Age(birthdate);
    var username = `<span class="text-secondary">${preferred_username}</span><span class="fs-6 text-black-50"> @${user_id}</span> <span class="fs-2 text-secondary fw-light">/</span><span class="fs-4 text-secondary fw-light">Age: ${age}</span>`;
    var website = `<span class="text-secondary fs-5">SNS: <a href="${sns}">${sns}</a></span>`
    $("#username").append(username);
    if (sns && sns !== "non-registered") {
      $("#sns").append(website)
    };
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
   };
  })
  .fail(function() {
    console.log("failed")
  });
};

//ログイン中のユーザー取得
var Login_user = function(user){
  if (cognitoUser != null) {
    cognitoUser.getSession(function(err, session) {
      if (err) {
          console.log(err);
      } else {
          user = session["accessToken"]["payload"]["username"]
      }
    });
    return user;
  } 
}

//フォローボタン
var GetUser_Follow = function(follow,already_follow){
  if (cognitoUser != null) {
    cognitoUser.getSession(function(err, session) {
      if (err) {
          console.log(err);
      } else {
          user = session["accessToken"]["payload"]["username"]
          if(!(already_follow=="true") && !(user == follow)){
            $("div#follow").html('<button class="btn btn-outline-danger">Follow</button>');
          }
      }
    });
  } 
}

//フォローする
var Follow = function(user_id, follow, id_token){
  fetch(`https://{DOMAIN}/mymovie-apigw/follow?user_id=${user_id}&follow=${follow}`,{
    method: 'POST',
    headers: {
      Authorization: id_token
    }
  })
  .then(response => {
    return response.json();
  })
  .then(data => {
    console.log(data)
    $("div#follow").html('<button class="btn btn-outline-danger disabled">Following</button>');
  })
  .catch(error => {
  console.log("失敗しました");
  });
}