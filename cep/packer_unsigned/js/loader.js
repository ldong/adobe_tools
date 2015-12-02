/**
 * Created by xiaoqiang on 5/29/15.
 * loader.js
 * 负责进行当前版本的更新检查，并支持下载更新文件进行替换
 * 2015-05-30
 */

/**
 * 构造函数，传入APP实例
 * @param instance
 * @constructor
 */
Loader = function(instance, config) {
    this.app = instance;
    this.config = config;
    this.filename = 'loader.conf';
};


/**
 * 初始化，检查本地更新文件，创建本地目录
 */
Loader.prototype.init = function()
{
    // 创建本地userdata目录/js/jsx
    var thiz = this;
    var dir = this.app.getLocalDir();
    var version = this.config.version;

    // 先加载jsx文件
    thiz.app.loadJSX();
    var jsdir = thiz.app.getUserDataPath() + '/' + thiz.app.id;
    thiz.app.evalScript('$._ext.evalFiles("' + jsdir + '")');

    // 加载主js文件
    /*
    var mainFile = dir + '/' + this.app.id + '.js';
    var r = this.app.readFile(mainFile);
    if (r.err == 0) {
        console.log('update file exists');
        $('body').append('<script src="'+ mainFile +'"></script>')
    } else {
        console.log('update file not exists');
        // 加载默认的业务js文件，该JS文件必须是extensionid.js
        var extensionDir = thiz.app.getExtensionPath();
        var mainJsPath = extensionDir + '/js/' + thiz.app.id + '.js?t=' + (new Date()).getTime();
        $('body').append('<script src="'+mainJsPath+'"></script>')
        //loadDefault();
    }
    */
    /*
    var r = this.app.readDir(dir);
    if (r.err == 0) {
        // 读取extensionid.js文件

        if (r.data.length > 1) {    // 默认有一个conf文件
            var reg = new RegExp(version + '.js$');
            console.log('local files: ' + r.data);
            for (var i=0; i< r.data.length; i++) {
                if (reg.test(r.data[i])) {
                    $('body').append('<script src="'+ dir + '/' + r.data[i] +'"></script>')
                }
            }
        } else {
            loadDefault();
        }
    } else {
        loadDefault();
    }
    */

    function loadDefault() {


    }
};

/**
 * 插件是否可以连接网络
 * @returns {App.isAppOnline|HostEnvironment.isAppOnline|*}
 */
Loader.prototype.isNetConnected = function()
{
    return (this.app.isAppOnline() && this.app.isAdminOnline() && this.app.isUserOnline());
};

/**
 * 启动的时候登录一次
 */
Loader.prototype.checkUpdate = function()
{
    if (this.isNetConnected()) {    // 登录，并获取更新信息
        var url = 'http://www.cutterman.cn/client/checkupdate?t=' + (new Date()).getTime();
        var param = {
            app: this.app.id,
            email: this.config.email,
            version: this.config.version,
            licence: this.config.licence
        };
        /*
          result : {
            licence: 'xxxxxxxx',
            update: 0/1,
            version: '2.3.0'
            update_files:  ['aa.js', 'bb.js', 'cc.jsxbin', 'dd.jsxbin' ]
          }
         */
        var thiz = this;
        thiz.app.request(url, param, function(result){
            if (result.update == 1) {   // 服务器有更新
                /*
                thiz.config.version = result.version;
                thiz.config.save();
                var jsdir = thiz.app.getUserDataPath() + '/' + thiz.app.id;
                var jslist = result.update_files;
                for (var i=0; i<jslist.length; i++) {
                    var filename = jslist[i].replace(/.*\//,'');
                    $('#jsx').load(jslist[i] + '?t=' + (new Date()).getTime(), function(data, status, xhr) {
                        var ret = thiz.app.writeFile(jsdir + '/' + filename, data);
                        if (ret.err == 0) {
                            console.log('write file ' + filename + ' success');
                        } else {
                            console.log('write file ' + filename + ' failed');
                        }
                    });
                }
                */
            }
        });
    }
};


