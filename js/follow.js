// ユーザープールの設定
var user_pool_id = "{USER_POOL_ID}"
var client_id = "{CLIENT_ID}"
const poolData = {
  UserPoolId : user_pool_id,
  ClientId : client_id
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
const cognitoUser = userPool.getCurrentUser();  // 現在のユーザー

$(function() {
  //ログイン中のユーザー情報取得
  var return_array = [];
  return_arry = AddUserId(return_array);
  var id_token = return_array[0]
  var user_id = return_array[1]

  //user検索
  $("#user").on('click',function() {
    var user = $('#user_id').val();
    if (user.length == 0) {
      return false;
    };
    window.location.href = `./user.html?user_id=${user}&list=score`;
  });

  //フォローを表示
  FollowList(user_id);

  //フォロー削除
  $(document).on('click',"#delete_follow",function() {
    var follow = $(this).data('id');
    fetch(`https://{DOMAIN}/mymovie-apigw/follow?user_id=${user_id}&follow=${follow}`,{
      headers: {
        Authorization: id_token
      },
      method: "delete"
    })
    .then(response => {
      return response.json();
    })
    .then(data => {
      console.log(data)
      location.reload();
    })
    .catch(error => {
    console.log("失敗しました");
    });
  });
})

var NavBer = function(){
  $("#register").html('<a class="nav-link" href="./post.html">登録</a>');
  $("#edit").html('<a class="nav-link" href="./edit.html">編集</a>');
};

var AddUserId = function(return_array){
  cognitoUser.getSession(function(err, session) {
    id_token = session["idToken"]["jwtToken"];
    return_array.push(id_token);
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

var FollowList = function(user_id){
  var uri = `https://{DOMAIN}/mymovie-apigw/follow?user_id=${user_id}`
  $.ajax({
    type: 'GET', // HTTPリクエストメソッドの指定
    url: uri, // 送信先URLの指定
    dataType: 'json', // 受信するデータタイプの指定
  })
  .done(function(data) {
    for(var i = 0; i < data.Items.length; i++){
      var user_id = data.Items[i].follow["S"];
      var user = "@" + user_id;
      var username = `<div>
                        <div><br></div>
                        <div>
                          <a href="./user.html?user_id=${user_id}&list=score&follow=true"><span class="text-secondary fs-5">${user}</span></a>
                          &emsp;&emsp;<button class="btn btn-outline-light btn-sm" data-id="${user_id}" id="delete_follow">解除</button>
                        </div>
                      </div>`;
      $("#followlist").append(username)
    }
  })
  .fail(function() {
    console.log("failed")
  });
}
