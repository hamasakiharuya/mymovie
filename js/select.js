window.onload = function(){
  var searchText = $(".select").val() // 検索ボックスに入力された値

  $(".select").change(function() {
    $("#results").empty();
    targetText = $(this).val();
    var uri = `https://{DOMAIN}/api/search?query=${targetText}`;
    var enuri = encodeURI(uri);
    $.ajax({
      type: 'GET', // HTTPリクエストメソッドの指定
      url: enuri, // 送信先URLの指定
      dataType: 'json', // 受信するデータタイプの指定
    })
    .done(function(data) {
      for(let i=0; i<=10; i++){
        var title = data.results[i].title;
        var release_date = data.results[i].release_date;
        var date = release_date.replaceAll('-','/');
        var poster_path = data.results[i].poster_path;
        $("#results").append(`<option value="${title}--${date}--${poster_path}">${title} (${date})</option>`)
      }
    })
    .fail(function() {
      console.log("failed")
    });

  });
  
};