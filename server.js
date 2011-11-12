
//////////////////////////
// チャットサーバー本体 //
//////////////////////////

const PORT = 8001;
const HOST = null;

var app = require('./app');
var channel = require('./channel');

app.listen(PORT, HOST);        // 待受

// タイトル情報
app.get('/members', function(req, res) {
    res.setJSON(channel.members);
});

// チャットに参加する
app.get('/join', function(req, res){
    var id = Math.floor(Math.random() * 100000000);
    var username = req.params.username;
    channel.join(username);
    channel.msg(username, "[入室]");
    res.setJSON({username: username, id: id});
});

// クライアントが離れる時
app.get('/part', function(req, res) {
    var username = req.params.username;
    channel.part(username);
    channel.msg(username, "[退出]");
    res.empty();    
});

// チャットのメッセージをクライアントへ送信
// ポーリング
app.get('/recv', function(req, res) {
    channel.on('recv', function(username, entry) {
        // メッセージを送信する
        res.setJSON({username: username, entry: entry});  
    });
});

// クライアントからのメッセージを受信
app.get('/send', function(req, res) {
    var username = req.params.username;
    var entry = req.params.entry;
    channel.msg(username, entry);
    res.setText('');            // 空のメッセージを返す
});
