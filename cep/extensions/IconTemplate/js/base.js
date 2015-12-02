/* vim: set et sw=4 ts=4 sts=4 fdm=marker ff=unix fenc=utf8 nobomb: */

/**
 * filename.js
 *
 * @author xiaoqiang
 * @mail   qiang0902@126.com
 * @date
 */


/**
 * 应用程序基础对象
 * @constructor
 */
App = function(extensionID) {
    this.id = extensionID;
    this.csInterface = new CSInterface();
    this.cep = window.cep;
};

/**
 * 初始化
 */
App.prototype.init = function()
{
    // PS主题变化事件
    this.csInterface.addEventListener('com.adobe.csxs.events.ThemeColorChanged',  this.themeChange);
    // 开发调试事件
    this.csInterface.addEventListener("DevToolsConsoleEvent", function(event) {
        console.log(event.data);
    });

    this.themeChange();
    this.loadJSX();
};

/**
 * 加载本地的JSX文件
 */
App.prototype.loadJSX = function() {
    var extensionRoot = this.csInterface.getSystemPath(SystemPath.EXTENSION) + "/jsx/";
    this.csInterface.evalScript('$._ext.evalFiles("' + extensionRoot + '")');
};

/**
 * 主题样式变化
 */
App.prototype.themeChange = function()
{
    var hostEnv = this.csInterface.getHostEnvironment();
    var UIColorObj = new UIColor();
    UIColorObj = hostEnv.appSkinInfo.appBarBackgroundColor;
    var red = Math.round(UIColorObj.color.red);
    var green = Math.round(UIColorObj.color.green);
    var blue = Math.round(UIColorObj.color.blue);
    var alpha = Math.round(UIColorObj.color.alpha);
    var colorRGB = "#" + red.toString(16) + green.toString(16) + blue.toString(16);
    var theme = {
        '#343434': ['theme-black', './css/topcoat-desktop-darkdark.min.css'],
        '#535353': ['theme-dark', './css/topcoat-desktop-dark.min.css'],
        '#b8b8b8': ['theme-gray', './css/topcoat-desktop-light.min.css'],
        '#d6d6d6': ['theme-white', './css/topcoat-desktop-lightlight.min.css?xx']
    };
    if (theme[colorRGB] != undefined) {
        $('body').removeClass('theme-black').removeClass('theme-dark').removeClass('theme-gray').removeClass('theme-white').addClass(theme[colorRGB][0]);
        $('#theme-link').attr('href', theme[colorRGB][1]);
        try {
            window.parent.document.body.style.backgroundColor = colorRGB;
        } catch(e) {
        }
    }

};


/* ---------------------------
 * --- 获取系统路径------------
 *----------------------------*/
App.prototype.getExtensionPath = function()
{
    return this.csInterface.getSystemPath(SystemPath.EXTENSION);
};

App.prototype.getUserDataPath = function()
{
    return this.csInterface.getSystemPath(SystemPath.USER_DATA);
};

App.prototype.getCommonFilesPath = function()
{
    return this.csInterface.getSystemPath(SystemPath.COMMON_FILES);
};

App.prototype.getMyDocumentPath = function()
{
    return this.csInterface.getSystemPath(SystemPath.MY_DOCUMENTS);
};

App.prototype.getHostApplicationPath = function()
{
    return this.csInterface.getSystemPath(SystemPath.HOST_APPLICATION);
};

/***********
 * 获取能力支持
 */
App.prototype.isSupportPanelMenu = function()
{
    var cap = this.csInterface.getHostCapabilities();
    return cap.EXTENDED_PANEL_MENU? true : false;
};

App.prototype.isSupportPanelIcons = function()
{
    var cap = this.csInterface.getHostCapabilities();
    return (cap.EXTENDED_PANEL_ICONS)? true : false;
};

App.prototype.isAppOnline = function()
{
    var preference = this.csInterface.getNetworkPreferences();
    return preference.isAppOnline;
};

App.prototype.isAdminOnline = function()
{
    var preference = this.csInterface.getNetworkPreferences();
    return preference.isAdminOnline;
};

App.prototype.isUserOnline = function()
{
    var preference = this.csInterface.getNetworkPreferences();
    return preference.isUserOnline;
};

App.prototype.isHtmlOnline = function()
{
    return navigator.onLine;    // html5 的方法
};

App.prototype.getInstallInfo = function()
{
    return this.csInterface.dumpInstallationInfo();
};

App.prototype.getOS = function()
{
    return this.csInterface.getOSInformation();
};

App.prototype.isMac = function()
{
    return (this.getOS().toLowerCase().indexOf('mac') > -1)? true : false;
};

App.prototype.isWin = function()
{
    return (this.getOS().toLowerCase().indexOf('win') > -1)? true : false;
};

App.prototype.openURL = function(url) {
    try {
        if (this.isWin()) {
            var rootDir = this.csInterface.getCommonFilesPath().substring(0, 3);
            processPath = rootDir + "Windows/explorer.exe";
            this.cep.process.createProcess(processPath, url);
        } else {
            this.csInterface.openURLInDefaultBrowser(url);
        }
    } catch(e) {
        var processPath = '/usr/bin/open';
        if (this.isWin()) {
            var rootDir = this.csInterface.getCommonFilesPath().substring(0, 3);
            processPath = rootDir + "Windows/explorer.exe";
            this.cep.process.createProcess(processPath, url);
        } else {
            this.cep.process.createProcess(processPath, '-a', 'Safari', url);
        }
    }
};


App.prototype.setCookie = function(cname,cvalue,exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname+"="+cvalue+"; "+expires;
};

App.prototype.getCookie = function(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
};

App.prototype.evalScript = function(script, callback)
{
    this.csInterface.evalScript(script, callback);
};

App.prototype.openDialog = function(title)
{
    return this.cep.fs.showOpenDialog(false, true, title, null, false);
};




var instance = null;
window.onload = function() {
    instance = new App('IconTemplate');
    instance.init();
};
