
//////////////////////////
// チャットサーバー本体 //
//////////////////////////

const PORT = 8001;
const HOST = null;

var base = require('./base');
var channel = require('./channel');
var obj = {
    x: 1,
    y: 2,
    hello: function() {
        console.log('Hello');
    }
}

base.listen(PORT, HOST);        // 待受

// タイトル情報
base.get('/who', function(req, res) {
    res.setText('Who are you?');
});

base.get('/list', function(req, res) {
    res.setJSON(obj);
});
