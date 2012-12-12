
//////////////////////////////
// HTTP層をラップするクラス //
//////////////////////////////

module.exports = (function() {
    // private
    // 必要なモジュールをロード
    var http = require('http');
    var fs = require('fs');
    var util = require('util');
    var url = require('url');
    var qs = require('querystring');
    var mime = require('./mime');
    var path = require('path');

    // ホスト名, ポート名
    var _host = "localhost";
    var _port = 8001;
    
    // 定数
    var publicHtmlDir = './public/'; // 静的ファイルを格納するディレクトリ
    const DEFAULT_ENCODING = 'UTF-8'; // デフォルトのエンコーディング
    const DEFAULT_PAGE = 'index.html'; // デフォルトのページ
    const NOT_FOUND_FORMAT = '<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN"><html><head><title>404 Not Found</title></head><body><h1>Not Found   (^_^;)</h1><p>The requested URL %s was not found on this server.</p><hr><address>Takuma\'s Server at %s Port %d</address></body></html>';   // 対応するページがない場合に表示

    // パスとイベントの対応関係を保持
    var map = {};

    // private funciton
    var httpd = http.createServer();

    // 404 Not Found
v    function notFound(req, res) {
        res.writeHead(404, {
            "Content-Type": "text/html; charset=iso-8859-1",
            "Conetnt-Length": NOT_FOUND_FORMAT.length
        });
        res.end(NOT_FOUND_FORMAT);
    }

    function isDirectory(path, callback) {
        fs.stat(path, function(err, stat) {            
            if (err) throw err;
            callback(stat.isDirectory());
        });
    }
    
    function staticHandler(filename) {
        var body, headers;
        var content_type = mime.getContentType(filename);

        function loadResponseData(callback) {
            fs.readFile(filename, function(err, data) {
                if (err) {
                    util.puts('Error loading ' + filename);
                }
                else {
                    body = data;
                    headers = {
                        "Content-Type": content_type,
                        "Content-Length": body.length
                    };
                    callback();
                }
            });
        }        

        return function(req, res) {
            loadResponseData(function() {
                res.writeHeader(200, headers);
                res.end(body);
            });
        };
    }

    // 登録済みのファイル名に対応したコールバックルーチン
    // (setText, setJSON..etc) を呼び出す
    function requestHandler(req, res) {
        var pathname = req.pathname;
        var handler = map[pathname];
        
        console.log("loaded .. " + pathname);
        if (!handler) {
            pathToFileHandler(pathname);
        }
        else {
            handler(req, res);
        }
        
        function pathToFileHandler(pathname, callback) {
            pathToFileName(pathname, function(filename) {
                var handler = staticHandler(filename);
                handler(req, res);
            });
        }        

        function pathToFileName(pathname, callback) {
            var filename = publicHtmlDir + pathname;
            path.exists(filename, function(exists){
                (!exists) ? notFound(req, res) :
                    isDirectory(filename, function(isDirectory) {
                        var file  = isDirectory ? (filename + '/' + DEFAULT_PAGE) : filename;
                        callback(file);
                    });
            });
        }
    }

    function setReqParam() {
        this.params = qs.parse(url.parse(this.url).query);        
        this.pathname = url.parse(this.url).pathname; 
    }
    
    // ヘッダーとボディを設定する
    function setHeaderBody(body, content, type) {
        var code = (type == 'error') ? 400  : 200;
        this.writeHead(code, content);
        this.end(body);
    }

    function setResParam() {
        
        this.setBody = function(body, type) {
            var content = {
                "Content-Type": "text/plain",
                "Content-Length": body.length 
            };
            setHeaderBody.call(this, body, content, type);
        };
        this.setHtml = function(body, type) {
            var content = {
                "Content-Type": "text/html",
                "Content-Length": body.length
            };
        };
        this.setJSON = function(obj, type) {
            var body = new Buffer(JSON.stringify(obj));
            var content = {
                "Content-Type": "text/json",
                "Content-Length": body.length
            };
            setHeaderBody.call(this, body, content, type);
        };
        this.empty = function() {
            this.setBody('');
        };
        this.setText = this.setBody;
    };

    httpd.on('request', function(req, res){
        setReqParam.call(req);
        setResParam.call(res);
        requestHandler(req, res);
    });

    // Public
    return {
        get: function(path, handler) {
            map[path] = handler;
        },
        listen: function(port, host) {
            _port = port;
            _host = host;
            httpd.listen(_port, _host);
            util.puts("Server Starting at http://" +
                      (host || "localhost") +
                      ":" + port.toString() + "/");
        },
        close: function() {
            httpd.close();
        },
        setPublicHtml: function(dir) {
            publicHtmlDir = dir;
        }
    };
})();
