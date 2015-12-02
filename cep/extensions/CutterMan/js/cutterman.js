
/**
 * AppRouter
 * @type {void|*}
 */
var AppRouter = Backbone.Router.extend({
    current: '',
    common: null,
    initialize: function() {
        console.log('app router initialize');
        settingView = new SettingView();
    },
    getCurrent: function() {
        return current;
    },
    routes: {
        'ios': 'ios',
        'android': 'android',
        'web': 'web'
    },
    ios: function() {
        this.current = 'ios';
        cookie.set('platform', 'ios', 360);
        $('.tab li').removeClass('active').eq(0).addClass('active');
        this.reset('ios-view');
        if (iosView == null) {
            iosView = new IosView();
        }
    },
    android: function() {
        this.current = 'android';
        cookie.set('platform', 'android', 360);
        $('.tab li').removeClass('active').eq(1).addClass('active');
        this.reset('android-view');
        if (androidView == null) {
            androidView = new AndroidView();
        }
    },
    web: function() {
        this.current = 'web';
        cookie.set('platform', 'web', 360);
        $('.tab li').removeClass('active').eq(2).addClass('active');
        this.reset('web-view');
        if (webView == null) {
            webView = new WebView();
        }
    },
    reset: function(target) {
        $.each(['ios-view', 'android-view', 'web-view', 'ios-setting', 'android-setting', 'web-setting'], function(idx, item) {
            $('#' + item).hide();
        });
        $('#' + target).show();
    }
});



/**
 * 对话框对象
 */
Dialog = function(text,btnText) {
    var callback = null;

    $('#dialog p').html(text);
    $('#dialog button').unbind().click(function() {
        if (btnText == undefined) {
            $('#cover').hide();
            $('#dialog').hide();
        }
        if (callback != null) {
            callback();
        }
    });

    $('#dialog button').text((btnText != undefined)? btnText : "确定");

    this.show = function(onConfirm) {
        callback = onConfirm;
        $('#cover').show();
        $('#dialog').show();
    }

    this.hide = function() {
        $('#cover').hide();
        $('#dialog').hide();
    }
};

Dialog.show = function(text, onConfirm, btnText) {
    var dialog = new Dialog(text, btnText);
    onConfirm = (onConfirm == undefined)? null : onConfirm;
    dialog.show(onConfirm);
    return dialog;
};

var Selector = function(ele, onselect) {
    this.selector = $(ele);
    $(ele).click(function() {
        var thiz = this;
        var ul = $(this).find('ul');
        ul.toggle();
        ul.find('a').unbind().click(function(evt){
            evt.preventDefault();
            evt.stopPropagation();
            $(thiz).find('.text').text($(this).text());
            $(thiz).attr('data-selected', $(this).text());
            ul.hide();
            if (onselect) {
                onselect($(this).text());
            }
        });
    });

    this.set = function(val) {
        this.selector.find('.text').text(val);
        this.selector.attr('data-selected', val);
    }
};

var Tab = function(ele, onchange) {
    this.tab = $(ele);
    $(ele).find('button').click(function(){
        $(this).parent().children().removeClass('active');
        $(this).addClass('active');
        if (onchange) {
            onchange($(this).attr('data-val'));
        }
    });

    this.set = function(val) {
        this.tab.find('button').each(function(idx, item) {
            $(item).removeClass('active');
            if ($(item).attr('data-val') == val) {
                $(item).addClass('active');
            }
        });
    };
};

var Checkbox = function(ele, onchange) {
    this.checkbox = $(ele);
    $(ele).click(function(){
        var checked = false;
        if (!$(this).hasClass('checked')) {
            checked = true;
            $(this).addClass('checked');
        } else {
            checked = false;
            $(this).removeClass('checked');
        }
        if (onchange) {
            onchange(checked);
        }
    });

    this.set = function(checked) {
        if (checked) {
            this.checkbox.addClass('checked');
        } else {
            this.checkbox.removeClass('checked');
        }
    }
};





/**
 * AndroidView
 * @type {void|*}
 */
var AndroidView = Backbone.View.extend({
    el: $('#android-view'),
    dpiList: null,
    mergeLayer: false,
    exportLocation: '',
    selectedDpi: ['XXHDPI', 'XHDPI'],
    initialize: function() {
        var thiz = this;
        if (cookie.get('android_exportLocation') != null) {
            thiz.exportLocation = cookie.get('android_exportLocation')
        }
        if (cookie.get('android_mergeLayer') != null) {
            thiz.mergeLayer = cookie.get('android_mergeLayer')
        }
        if (cookie.get('android_selected_dpi') != null) {
            thiz.selectedDpi = JSON.parse(cookie.get('android_selected_dpi'));
        }

        var mergeLayer = new Checkbox(this.$el.find('.checkbox'), function(on) {
            thiz.mergeLayer = on;
            cookie.set('android_mergeLayer', on, 360);
        });
        mergeLayer.set(thiz.mergeLayer);

        this.$el.find('.clear').click(function(){
            $(this).parent().find('input').val('');
        });

        this.$el.find('.export-dpi button').each(function(){
            var text = $(this).text().replace(/@/, '');
            if ($.inArray(text, thiz.selectedDpi) != -1) {
                $(this).addClass('active');
            } else {
                $(this).removeClass('active');
            }
        }).click(function() {
            var text = $(this).text().replace(/@/, '');
            if ($(this).hasClass('active')) {
                $(this).removeClass('active');
                var idx = $.inArray(text, thiz.selectedDpi)
                if (idx != -1) {
                    thiz.selectedDpi.splice(idx, 1);
                }
            } else {
                $(this).addClass('active');
                thiz.selectedDpi.push(text);
            }
            cookie.set('android_selected_dpi', JSON.stringify(thiz.selectedDpi), 360);
        });

        var location = (this.exportLocation == '')? 'path/to/output' : decodeURIComponent(this.exportLocation.replace( /.*\//, ''));
        this.$el.find('.location-btn').text(location).click(function(){
            var ele = this;
            instance.evalScript('cutterman.selectOutputDir("'+ thiz.exportLocation +'")', function(result){
                if (result == "cancel") { return; }
                if (result == "null") {
                    result = instance.csInterface.getSystemPath(SystemPath.MY_DOCUMENTS);
                }
                thiz.exportLocation = result;
                cookie.set('android_exportLocation', result, 360);
                $(ele).text(decodeURIComponent(result.replace( /.*\//, '')));
            });
        });


        this.$el.find('.open-dir').click(function(){
            if (thiz.exportLocation != '') {
                instance.evalScript('cutterman.openDir("'+thiz.exportLocation+'")', function(result) {
                    if (result == 'null') {
                        instance.showToast("该路径已经不存在");
                    }
                });
            } else {
                Dialog.show("请先选择输出位置");
            }
        });

        this.$el.find('button.export').click(function() {
            if (thiz.exportLocation == '') {
                Dialog.show("请先选择输出位置");
                return;
            }
            if (thiz.selectedDpi.length == 0) {
                Dialog.show('您必须至少选择一个输出分辨率');
                return;
            }

            var width = thiz.$el.find('input[name=width]').val();
            var height = thiz.$el.find('input[name=height]').val();
            width = (width == '')? 0 : parseInt(width);
            height = (height == '')? 0 : parseInt(height);

            var setting = settingView.getSetting();
                setting['format'] = 'PNG-24';
                setting['output'] = thiz.exportLocation;
                setting['merge'] = thiz.mergeLayer;
                setting['target'] = thiz.selectedDpi;
                setting['bounds'] = [width, height];
            console.log(JSON.stringify(setting));
            instance.evalScript('cutterman.export("'+ encodeURI(JSON.stringify(setting)) +'","android")', thiz.statistics);
        });

        this.$el.find('#ninepatch').click(function(){
            if (thiz.exportLocation == '') {
                Dialog.show("请先选择输出位置");
                return;
            }
            var setting = settingView.getSetting();
                setting['format'] = 'PNG-24';
                setting['output'] = thiz.exportLocation;
                setting['merge'] = thiz.mergeLayer;
                setting['target'] = thiz.selectedDpi;
                setting['bounds'] = [0, 0];
            instance.evalScript('cutterman.ninePatch("'+ encodeURI(JSON.stringify(setting)) +'", "android")', thiz.statistics);
        });
    },
    statistics: function(result) {
        console.log(result);
        var data = JSON.parse(result);
        if (data.err == 0) {
            var count = parseInt(data.msg);
            if (count > 0) {
                $.post('http://www.cutterman.cn/rank/submit', {email: config.email, uid: config.uid, num: count}, function(result) {
                });
            }
        } else {
            Dialog.show(decodeURI(data.err));
        }
    }
});


var IosView = Backbone.View.extend({
    el: $('#ios-view'),
    selectedDpi: ['3X', '2X'],
    mergeLayer: false,
    exportLocation: '',
    initialize: function() {
        var thiz = this;
        if (cookie.get('ios_exportLocation') != null) {
            thiz.exportLocation = cookie.get('ios_exportLocation')
        }
        if (cookie.get('ios_mergeLayer') != null) {
            thiz.mergeLayer = cookie.get('ios_mergeLayer')
        }
        if (cookie.get('ios_selectedDpi') != null) {
            this.selectedDpi = JSON.parse(cookie.get('ios_selectedDpi'));
        }

        this.$el.find('.export-dpi button').each(function(){
            var text = $(this).text().replace(/@/, '');
            if ($.inArray(text, thiz.selectedDpi) != -1) {
                $(this).addClass('active');
            } else {
                $(this).removeClass('active');
            }
        }).click(function() {
            var text = $(this).text().replace(/@/, '');
            if ($(this).hasClass('active')) {
                $(this).removeClass('active');
                var idx = $.inArray(text, thiz.selectedDpi)
                if (idx != -1) {
                    thiz.selectedDpi.splice(idx, 1);
                }
            } else {
                $(this).addClass('active');
                thiz.selectedDpi.push(text);
            }
            cookie.set('ios_selectedDpi', JSON.stringify(thiz.selectedDpi), 360);
        });

        var mergeLayer = new Checkbox(this.$el.find('.checkbox'), function(on) {
            thiz.mergeLayer = on;
            cookie.set('ios_mergeLayer', on, 360);
        });
        mergeLayer.set(thiz.mergeLayer);

        this.$el.find('.clear').click(function(){
            $(this).parent().find('input').val('');
        });

        var location = (this.exportLocation == '')? 'path/to/output' : decodeURIComponent(this.exportLocation.replace( /.*\//, ''));
        thiz.$el.find('.location-btn').text(location).click(function(){
            var ele = this;
            instance.evalScript('cutterman.selectOutputDir("'+ thiz.exportLocation +'")', function(result){
                if (result == "cancel") { return; }
                if (result == "null") {
                    result = instance.csInterface.getSystemPath(SystemPath.MY_DOCUMENTS);
                }
                thiz.exportLocation = result;
                cookie.set('ios_exportLocation', result, 360);
                $(ele).text(decodeURIComponent(result.replace( /.*\//, '')));
            });
        });


        this.$el.find('.open-dir').click(function(){
            if (thiz.exportLocation != '') {
                instance.evalScript('cutterman.openDir("'+thiz.exportLocation+'")', function(result) {
                    if (result == 'null') {
                        instance.showToast("该路径已经不存在");
                    }
                });
            }
        });

        this.$el.find('button.export').click(function() {
            if (thiz.exportLocation == '') {
                Dialog.show("请先选择输出位置");
                return;
            }
            if (thiz.selectedDpi.length == 0) {
                Dialog.show('您必须至少选择一个输出分辨率');
                return;
            }

            var width = thiz.$el.find('input[name=width]').val();
            var height = thiz.$el.find('input[name=height]').val();
            width = (width == '')? 0 : parseInt(width);
            height = (height == '')? 0 : parseInt(height);

            var setting = settingView.getSetting();
                setting['format'] = 'PNG-24';
                setting['output'] = thiz.exportLocation;
                setting['merge'] = thiz.mergeLayer;
                setting['target'] = thiz.selectedDpi;
                setting['bounds'] = [width, height];
            console.log(JSON.stringify(setting));
            instance.evalScript('cutterman.export("'+ encodeURI(JSON.stringify(setting)) +'","ios")', thiz.statistics);
        });
    },
    selected: function() {
        return this.selectedDpi;
    },
    statistics: function(result) {
        console.log(result);
        var data = JSON.parse(result);
        if (data.err == 0) {
            var count = parseInt(data.msg);
            if (count > 0) {
                $.post('http://www.cutterman.cn/rank/submit', {email: config.email, uid: config.uid, num: count}, function(result) {
                });
            }
        } else {
            Dialog.show(decodeURI(data.err));
        }
    }
});


var WebView = Backbone.View.extend({
    el: $('#web-view'),
    exportLocation: '',
    mergeLayer: false,
    format: 'PNG',
    quality: 'PNG-24',
    initialize: function() {
        var thiz = this;
        if (cookie.get('web_format') != null) {
            this.format = cookie.get('web_format');
        }
        if (cookie.get('web_quality') != null) {
            this.quality = cookie.get('web_quality');
        }
        if (cookie.get('web_exportLocation') != null) {
            this.exportLocation = cookie.get('web_exportLocation');
        }
        if (cookie.get('web_mergeLayer') != null) {
            this.mergeLayer = cookie.get('web_mergeLayer');
        }
        var mergeLayer = new Checkbox(this.$el.find('.checkbox'), function(on) {
            thiz.mergeLayer = on;
            cookie.set('web_mergeLayer', on, 360);
        });
        mergeLayer.set(thiz.mergeLayer);

        var formatTab = new Tab(this.$el.find('.format .option-tab'), function(result) {
            thiz.format = result;
            thiz.toggleTabs(result);
            cookie.set('web_format', result, 360);
        });
        formatTab.set(this.format);
        thiz.toggleTabs(this.format);

        var pngQualityTab = new Tab(this.$el.find('.quality-png'), function(result){
            thiz.quality = result;
            cookie.set('web_quality', result, 360);
        });
        if (/^PNG/.test(this.quality)) {
            pngQualityTab.set(this.quality);
        }

        var gifQualityTab = new Tab(this.$el.find('.quality-gif'), function(result) {
            thiz.quality = result;
            cookie.set('web_quality', result, 360);
        });
        if (/^\d/.test(this.quality)) {
            gifQualityTab.set(this.quality);
        }


        this.$el.find('.clear').click(function(){
            $(this).parent().find('input').val('');
        });

        var location = (this.exportLocation == '')? 'path/to/output' : decodeURIComponent(this.exportLocation.replace( /.*\//, ''));
        thiz.$el.find('.location-btn').text(location).click(function(){
            var ele = this;
            instance.evalScript('cutterman.selectOutputDir("'+ thiz.exportLocation +'")', function(result){
                if (result == "cancel") { return; }
                if (result == "null") {
                    result = instance.csInterface.getSystemPath(SystemPath.MY_DOCUMENTS);
                }
                thiz.exportLocation = result;
                cookie.set('web_exportLocation', result, 360);
                $(ele).text(decodeURIComponent(result.replace( /.*\//, '')));
            });
        });

        this.$el.find('.open-dir').click(function(){
            if (thiz.exportLocation != '') {
               instance.evalScript('cutterman.openDir("'+thiz.exportLocation+'")', function(result) {
                    if (result == 'null') {
                        instance.showToast("该路径已经不存在");
                    }
                });
            }
        });

        this.$el.find('button.export').click(function() {
            if (thiz.exportLocation == '') {
                Dialog.show("请先选择输出位置");
                return;
            }

            var width = thiz.$el.find('input[name=width]').val();
            var height = thiz.$el.find('input[name=height]').val();
            width = (width == '')? 0 : parseInt(width);
            height = (height == '')? 0 : parseInt(height);

            var setting = settingView.getSetting();
            var jpgQuality = thiz.$el.find('.quality-jpg input').val().replace(/%/, '');
            jpgQuality = (jpgQuality == '')? 0 : parseInt(jpgQuality);
            console.log(thiz.format);
            setting['format'] = (/^PNG/.test(thiz.format))? thiz.quality : thiz.format;
            setting['quality'] = (/^JPEG/.test(thiz.format))? jpgQuality : thiz.quality;
            setting['output'] = thiz.exportLocation;
            setting['merge'] = thiz.mergeLayer;
            setting['target'] = ['web'];
            setting['bounds'] = [width, height];
            console.log(JSON.stringify(setting));
            instance.evalScript('cutterman.export("'+ encodeURI(JSON.stringify(setting)) +'","web")', thiz.statistics);
        });
    },
    toggleTabs: function(target) {
        this.$el.find('.quality .option-tab').hide();
        if (target == 'PNG') {
            this.$el.find('.quality .quality-png').show();
        } else if (target == 'JPEG') {
            this.$el.find('.quality .quality-jpg').show();
        } else {
            this.$el.find('.quality .quality-gif').show();
        }
    },
    statistics: function(result) {
        var data = JSON.parse(result);
        if (data.err == 0) {
            var count = parseInt(data.msg);
            if (count > 0) {
                $.post('http://www.cutterman.cn/rank/submit', {email: config.email, uid: config.uid, num: count}, function(result) {
                });
            }
        } else {
            Dialog.show(decodeURI(data.err));
        }
    }
});


var SettingView = Backbone.View.extend({
    el: $('#setting-panel'),
    setting: {
        samefile: 'cover',
        androidCurrentDpi: '不设置',
        iosCurrentDpi: '不设置',
        androidDpi: {
            XXXHDPI: 1440,
            XXHDPI: 1080,
            XHDPI: 720,
            HDPI: 540,
            MDPI: 360
        },
        iosDpi: {
            '3X': 960,
            '2X': 640,
            '1X': 320
        }
    },
    initialize: function() {
        var thiz = this;
        if (cookie.get('setting') != null) {
            thiz.setting = JSON.parse(cookie.get('setting'));
        }
        var tabs = new Tab(this.$el.find('.same-file-tab'), function(result) {
            thiz.setting.samefile = result;
            cookie.set('setting', JSON.stringify(thiz.setting), 360);
        });
        tabs.set(this.setting.samefile);

        var platformTab = new Tab(this.$el.find('.platform-tab'), function(result) {
            $('.android-setting').hide();
            $('.ios-setting').hide();
            $('.' + result + "-setting").show();
        });

        var androidCurrentDpi = new Selector(this.$el.find('.android-setting .current-dpi-list'), function(result) {
            thiz.setting.androidCurrentDpi = result;
            cookie.set('setting', JSON.stringify(thiz.setting), 360);
        });
        androidCurrentDpi.set(this.setting.androidCurrentDpi);

        var iosCurrentDpi = new Selector(this.$el.find('.ios-setting .current-dpi-list'), function(result) {
            thiz.setting.iosCurrentDpi = result.replace(/@/,'');
            cookie.set('setting', JSON.stringify(thiz.setting), 360);
        });
        iosCurrentDpi.set(this.setting.iosCurrentDpi);

        $.each(this.$el.find('.android-setting .custom-dpi-list input'), function(idx, item){
            var key = $(item).attr('name');
            $(this).val(thiz.setting.androidDpi[key]);
        });

        $.each(this.$el.find('.ios-setting .custom-dpi-list input'), function(idx, item){
            var key = $(item).attr('name');
            $(this).val(thiz.setting.iosDpi[key]);
        });
    },
    getSetting: function() {
        var thiz = this;
        $.each(this.$el.find('.android-setting .custom-dpi-list input'), function(idx, item){
            var key = $(item).attr('name');
            thiz.setting.androidDpi[key] = $(item).val();
        });
        $.each(this.$el.find('.ios-setting .custom-dpi-list input'), function(idx, item){
            var key = $(item).attr('name');
            thiz.setting.iosDpi[key] = $(item).val();
        });
        cookie.set('setting', JSON.stringify(thiz.setting), 360);
        return this.setting;
    }
});


var AppView = Backbone.View.extend({
    el: $('#wrapper'),
    initialize: function() {
        $('#user').click(function(){
            var icon = $(this);
            if (!icon.hasClass('checked')){
                $('#user-panel').show();
                $('#main-panel').addClass('main-panel-left').animate({left: '180px'}, 'fast', 'swing', function() {
                    icon.addClass('checked');
                });
            } else {
                $('#main-panel').animate({left: 0}, 'fast', 'swing', function() {
                    $(this).removeClass('main-panel-left').css('left', 'inherit');
                    icon.removeClass('checked');
                    $('#user-panel').hide();
                })
            }
        });
        $('#setting').click(function(){
            var icon = $(this);
            if (!icon.hasClass('checked')){
                $('#setting-panel').show();
                $('#main-panel').addClass('main-panel-right').animate({right: '190px'}, 'fast', 'swing', function() {
                    icon.addClass('checked');
                });
            } else {
                $('#main-panel').animate({right: 0}, 'fast', 'swing', function() {
                    $(this).removeClass('main-panel-right').css('right', 'inherit');
                    icon.removeClass('checked');
                    $('#setting-panel').hide();
                })
            }
        });
        $('#account').text(config.email);
        $('#buy').click(function(){
            Dialog.show('<p>用支付宝扫描二维码<br/>请CUT君喝杯咖啡吧~</p><img src="./img/qrcode.png" />', '用用再说');
        });
        $('#current-version').text('当前版本: ' + config.version);
        /*
        $('#achievement').click(function() {
            var url = 'http://www.cutterman.cn/client/achieve?email='+config.email;
            instance.request(url, instance.buildParam({uid: config.uid, app: instance.id}), function(result){
                if (result.errno == 0) {
                    var count = result.count;
                    console.log(count);
                }
            });
        });
        */

        $('#logout-btn').click(function() {
            cookie.clear();
            user.logout();
            location.reload(true);
        });

        var thiz = this;
        setTimeout(function(){
            thiz.checkupdate();
        }, 3000);
    },
    checkupdate: function() {
        if (instance.isNetConnected()) {
            var url = 'http://www.cutterman.cn/client/checkupdate?t=' + (new Date()).getTime();
            var param = {
                app: instance.id,
                email: config.email,
                version: config.version,
                licennce: config.licence
            };
            instance.request(url, instance.buildParam(param), function(result) {
                if (result.update == 1) {
                    var showUpdate = cookie.get('SHOW_UPDATE');
                    if (showUpdate == null)  {
                        cookie.set('SHOW_UPDATE', '1', 1);
                        var text = "有新版本出来啦：" + result.version + "<br/>";
                        text+= result.change_log.join('<br/>');
                        var d = Dialog.show(text, function() {
                            d.hide();
                            instance.openURL('http://www.cutterman.cn/v2/cutterman');
                        }, "去更新");
                    }
                }
            });
        }
    }

});


//var cookie = {
//    set: function() {},
//    get: function() {}
//};
//
//var config = {
//    email: "xxx",
//};

/* ------  trigger -------- */
var iosView, androidView, webView, settingView;
var router = new AppRouter();
var app = new AppView();
Backbone.history.start();
var platform = cookie.get('platform');
platform = (platform == null)? 'android' : platform;
router.navigate(platform, {trigger: true, replace: true});
