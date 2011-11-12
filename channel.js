
//////////////////////////////////
// チャット全体を管理するクラス //
//////////////////////////////////

module.exports = (function(){
    // private
    // 必要なモジュールをロード
    var util = require('util');

    const JOIN_MSG = 'JOIN: ';
    const PART_MSG = 'PART: ';

    // 変数
    var _callbacks = {};
    
    var memberTable = {
        members: [],
        get: function(username) {
            var ms = this.members;
            for (var i in ms) {
                if (ms[i] == username) {
                    return ms[i];
                }
            };
            return null;
        },        
        exist: function(username) {
            if (this.get(username)) return true;
            return false;
        },
        del: function(username) {
            var ms = this.members;
            for (var i in ms) {
                if (ms[i] == username) {
                    delete ms[i];
                    return;
                }
            };
        },
        add: function(username) {
            this.members.push(username);
        }
    };

    function action(username, type, entry) {        
        msg = {
            username:  username,
            type: type,
            entry: entry,
            timestamp: (new Date()).getTime()
        };
        util.puts(username + ':' + type + '\t\t"' + entry + '"');
        switch(type) {
          case 'msg':
            break;
          case 'join':
            memberTable.add(username);
            break;
          case 'part':
            memberTable.del(username);
            break;
        default:
            throw 'invalid type';
            break;
        } 
        this.history.push(msg);
    }

    // public
    return {
        history: [],
        
        join: function(username) {
            action.call(this, username, 'join', JOIN_MSG + username); 
        },

        msg: function(username, entry) {
            action.call(this, username, 'msg', entry);
            this.emit('recv', username, entry); // recvイベントを登録            
        },
        
        part: function(username) {
            action.call(this, username, 'part', PART_MSG + username);
        },

        exist: function(username) {
            return memberTable.exist(username);            
        },

        members: memberTable.members,

        on: function(name, callback) {
            if (!_callbacks[name]) {
                _callbacks[name] = [callback];   
            }
            else {
                _callbacks[name].push(callback);
            }
        },

        emit: function(name) {
            var args = Array.prototype.slice.apply(arguments);
            args.shift();
            if (_callbacks[name]) {
                for (var i = 0; i < _callbacks[name].length; i++) {
                    _callbacks[name][i].apply(this, args);
                }
            }
        }
    };
})();

