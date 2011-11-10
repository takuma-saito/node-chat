
//////////////////////////////////
// チャット全体を管理するクラス //
//////////////////////////////////

module.exports = (function(){
    // private
    // 必要なモジュールをロード
    var util = require('util');

    const JOIN_MSG = 'JOIN: ';
    const PART_MSG = 'PART: ';
    
    var memberTable = {
        members: [],
        get: function(nick) {
            var ms = this.members;
            for (var i in ms) {
                if (ms[i] == nick) {
                    return ms[i];
                }
            };
            return null;
        },        
        exist: function(nick) {
            if (this.get(nick)) return true;
            return false;
        },
        del: function(nick) {
            var ms = this.members;
            for (var i in ms) {
                if (ms[i] == nick) {
                    delete ms[i];
                    return;
                }
            };
        },
        add: function(nick) {
            this.members.push(nick);
        }
    };

    function action(nick, type, text) {        
        msg = {
            nick:  nick,
            type: type,
            text: text,
            timestamp: (new Date()).getTime()
        };
        util.puts(nick + ':' + type + '\t\t"' + text + '"');
        switch(type) {
          case 'msg':
            break;
          case 'join':
            memberTable.add(nick);
            break;
          case 'part':
            memberTable.del(nick);
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
        
        join: function(nick) {
            action.call(this, nick, 'join', JOIN_MSG + nick); 
        },

        msg: function(nick, text) {
            action.call(this, nick, 'msg', text);
        },
        
        part: function(nick) {
            action.call(this, nick, 'part', PART_MSG + nick);
        },

        exist: function(nick) {
            return memberTable.exist(nick);            
        },

        members: memberTable.members
    };
})();

