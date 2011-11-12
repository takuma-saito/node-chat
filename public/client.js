
//////////////////////////////////////////////////
// チャットアプリケーションのクライアントサイド //
//////////////////////////////////////////////////

var CONFIG = {
    id: 0,
    username: "#"
};

// エンターキーのステータスコード
const ENTER_KEY = 13;

// イベントを登録
$(function() {
    showLogin();
    longPoll();

    // エンターキー押下を監視する
    function pressEnter(select, callback) {
        $(select).keypress(function(e) {
            if (e.keyCode == ENTER_KEY) {
                var selectMsg = $(select).attr('value');
                if (!isBlank(selectMsg)) {
                    callback(selectMsg);
                }
                $(select).attr('value', '');
            }
        });
    }

    pressEnter('#entry', function(entry) {
        sendMsg(entry);        
    });

    // 名前を入力し、接続する
    pressEnter('#username', function(username) {
        if (validateName(username)) {
            $.ajax({
                cache: false,
                type : "GET",
                url  : "/join",
                dataType: "json",
                data : {username: username},
                error: function() {
                    showLogin("error connecting to server");
                },
                success: onChat
            });
        }
    });
});

$(window).unload(function() {
    $.get('/part', {username: CONFIG.username}, function(data) {}, "json");
});

// ロングポーリング
function longPoll(data) {
    if (data) {
        addMessage(data.username, data.entry);
    }
    // ポーリングを行う
    $.ajax({
        cache: false,
        type : "GET",
        url : "/recv",
        dataType: "json",
        data: {id: CONFIG.id},
        error: function() {
            addMessage("Long Poll error");
            setTimeout(longPoll, 10 * 1000);
        },
        success: function(data) {
            longPoll(data);
        }
    });
}

function addMessage(username, msg) {  
    $("#chat_history").append('<tr><th>' + username
                              + ":</th><td>" + msg + '</td></tr>');
    window.scrollBy(0, 1000000000000000000);
}

function isBlank(text) {
    return (text.match(/^\s*$/) !== null);    
}

function sendMsg(entry) {
    $.get("/send",{username: CONFIG.username, entry:entry});
}

// チャットにログイン
function onChat(session) {
    CONFIG.username = session.username;
    CONFIG.id = session.id;
    showChat();
}

// ユーザーネームのチェック
function validateName(username) {
    if (username.length  == 0) {        
        showLogin("Please enter your name");
        return false;
    }
    if (username.length > 50) {
        showLogin("Username too long. 50 character max.");
        return false;
    }
    return true;
}

// ログイン画面
function showLogin(error) {
    if (error) {
        alert(error);        
    }
    $("#login").show();
    $("#chat_main").hide();
    $("#username").focus();
}

// チャット入力画面
function showChat() {
    $("#login").hide();
    $("#chat_main").show();
    $("#entry").focus();
}
