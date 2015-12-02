/* vim: set et sw=4 ts=4 sts=4 fdm=marker ff=unix fenc=utf8 nobomb: */

/**
 * filename.js
 *
 * @author xiaoqiang
 * @mail   qiang0902@126.com
 * @2014-10-17
 */


Constants = {
    position: ['TOP_LEFT', 'TOP_RIGHT', 'BOTTOM_RIGHT', 'BOTTOM_LEFT'],
    dimension: ['WIDTH_HEIGHT', 'WIDTH', 'HEIGHT', 'MIDDLE_VERTICAL'],
    edge: ['LEFT', 'RIGHT', 'BOTTOM', 'TOP'],
    distance: ['HORIZONTAL', 'VERTICAL'],
    padding: ['LEFT', 'RIGHT', 'TOP', 'BOTTOM']
};


/* 默认设置属性
 */
Setting = {
    mark: {     // 标注的样式
        foreground: 'ff0000',
        background: '', //new Color(255, 255, 255),
        fontSize: 12,
        dpi: 'XHPDI',
        unit: 'PX',
        colorType: 'HEX&RGB'
    },
    position: 0,    // -> Constants['postionType'][0]
    dimension: 0,
    edge: 0,
    distance: 0,
    text: {family:0, size: 1, color: 1, height: 0, shadow: 0, stroke: 0, direction: 'bottom'},   //标注文字属性
    color: {color: 1, opacity: 0, shadow: 0, stroke: 0, radius: 0},
    padding: [1, 1, 1, 1],     // All selected
    colorList: ['ff0000', 'ff9e00', '7eff00', '00c4ff'],             // 默认提供的颜色列表
    rect: {width:0, height:0, color: 'ff0000', opacity: 30}
};


(function() {

    // 把setting存成文件
    var settingFile = instance.getLocalDir() + '/setting.json';
    var ret = instance.readFile(settingFile);
    if (ret.err == 0) {
        Setting = JSON.parse(ret.data);
    } else {
        instance.writeFile(settingFile, JSON.stringify(Setting));
    }
    var mark = Setting.mark;
    instance.evalScript('parker.setting('+ mark.fontSize  +', "'+ mark.foreground +'","'+ mark.background +'","'+ mark.dpi +'","'+ mark.unit +'","'+ mark.colorType +'")', function(result){
        if (result == undefined || result == 'undefined') { return; }
        console.log('excute result: ' + result);
        /*
        result = JSON.parse(result);
        if (result.err != undefined) {
            // show err
        }

        if (result.exception != undefined) {
            // trance exception
        }
        */
    });

})();


/**
 * 颜色选择组件
 */
ColorPicker = function() {
    var obj = this;
    var callback= null;

    this.render = function() {
        var html = '';
        for (var i=0; i<Setting.colorList.length; i++) {
            var color = Setting.colorList[i];
            html += '<li><a class="color-list" data-color="'+color+'" style="background: #'+color+'" href="#">#'+color+'</a> <a href="#" class="delete"></a> </li>';
        }
        $('#color-picker ul').html(html);
        if (Setting.colorList.length == 5) {
            $('#color-picker .add').hide();
            $('#color-picker .max').show();
        }

        $('#color-picker .delete').click(function() {
            $(this).parent().remove();
            var color = $(this).prev().attr('data-color');
            var idx = Setting.colorList.indexOf(color);
            if (idx != -1) {
                Setting.colorList.splice(idx, 1);
                var settingFile = instance.getLocalDir() + '/setting.json';
                instance.writeFile(settingFile, JSON.stringify(Setting));
                if (Setting.colorList.length < 5) {
                    $('#color-picker .add').show();
                    $('#color-picker .max').hide();
                }
            }
        });

        $('#color-picker .color-list').click(function(){
            var color = $(this).attr('data-color');
            if (callback) {
                callback(color);
            }
            obj.hide();
        });
    };

    obj.render();

    $('#color-picker .close').click(function(){
        obj.hide();
    });

    $('#color-picker .add button').click(function(){
        if (Setting.colorList.length >= 5){ return; }
        console.log('button click');
        var text = $(this).prev().val().trim();
        if (text != '' && /^#\w{6}/.test(text)) {
            var color = text.replace(/^#/, '');
            Setting.colorList.push(color);
            obj.render();
            var settingFile = instance.getLocalDir() + '/setting.json';
            instance.writeFile(settingFile, JSON.stringify(Setting));
            if (Setting.colorList.length == 5) {
                $('#color-picker .add').hide();
                $('#color-picker .max').show();
            }
        }

    });

    this.show = function(cb) {
        callback = cb;
        $('#big-cover').show();
        $('#color-picker').show();
    };

    this.hide = function() {
        $('#big-cover').hide();
        $('#color-picker').hide();
    };
};

ColorPicker.show = function(onSelect) {
    if (ColorPicker.instance == undefined) {
        ColorPicker.instance = new ColorPicker();
    }
    ColorPicker.instance.show(onSelect);
};


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


Selector = function(key, select) {
    var list = {
        dpi: ['XXXHDPI', 'XXHDPI', 'XHDPI', 'HDPI', 'MDPI', 'LDPI'],
        unit: ['PX', 'PT', 'DP'],
        colorType:['HEX&RGB', 'HEX', 'RGB']
    };
    var arr = list[key];
    var html = '';
    for (var i=0; i<arr.length; i++) {
        html += '<a href="#">' + arr[i] + '</a>';
    }
    $('#options').html(html).removeClass().addClass('options').addClass(key).show();

    var obj = this;
    $('#options a').click(function() {
        obj.hide();
        if (select) {
            select($(this).text())
        }
    });

    this.hide = function() {
        $('#options').removeClass(key).hide();
    }
};
Selector.show = function(key, callback) {
    if ($('#options').hasClass(key)) {
        $('#options').removeClass(key).hide();
    } else {
        new Selector(key, callback);
    }
};


// 根据设置初始化界面
function initView() {

    // 检查更新
    if (!instance.isNetConnected()) {
        instance.showToast("您的PS无法连接网络，将不能登录帐号");
    } else {
        var url = 'http://www.cutterman.cn/client/checkupdate?t=' + (new Date()).getTime();
        var param = {
            app: instance.id,
            email: config.email,
            version: config.version,
            licence: config.licence
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
                        instance.openURL('http://www.cutterman.cn/parker');
                    }, "去更新");
                }
            }
        });
    }

    // 用户信息
    if (user.isLogin()) {
        $('#account').text(config.email);
        $('#current-version').text('当前版本: ' + config.version);
        if (config.code != null) {
            $('#licence').html('已通过授权码成功授权');
            if (config.email == 'account@demo.com') {
                $('#logout-btn').hide();
                $('#buy').text('绑定帐号').click(function() {
                    instance.openURL('http://www.cutterman.cn/auth/bind?code='+config.code);
                });
            } else {
                $('.buy').hide();
            }
        } else {
            if (config.licence == null) {   // 没有授权
                var trial_start = config.trial_start*1000;   // 试用起始时间
                var now = (new Date()).getTime();       // 当前时间
                if (now - trial_start > 30*24*3600*1000) { // 试用期30天
                    Dialog.show('试用期已结束，您需要购买后才能继续使用。<br/>如果已经购买，请<a href="#" onclick="location.reload(true)">刷新</a>', function() {
                        instance.openURL('http://www.cutterman.cn/parker/buy');
                    }, '去购买');
                    $('#licence').html('试用期已结束，不能继续使用');
                } else {
                    var left = parseInt((trial_start + 30*24*3600*1000 - now)/(24*3600*1000));
                    $('#licence').text('试用阶段，剩余' + left + '天');
                }
                $('#buy').click(function() {
                    instance.openURL('http://www.cutterman.cn/parker/buy');
                });
            } else {
                $('#licence').text('已授权，终生使用');
                $('.buy').hide();
            }
        }
    }


    // 提示用户引导
    var showGuide = cookie.get('SHOW_GUIDE');
    if (showGuide == null) {
        var text = '还不知道如何使用此款神器？<br/>快去看看使用教程吧~';
        var d = Dialog.show(text, function() {
            cookie.set('SHOW_GUIDE', '1', 10000);
            d.hide();
            instance.openURL('http://www.cutterman.cn/parker');
        }, "去看看");
    }


    // 系统设置
    $('#draw-size').val(Setting.mark.fontSize);
    $('#forecolor').attr('data-color', Setting.mark.foreground).css('background', '#' + Setting.mark.foreground);
    if (Setting.mark.background != '') {
        $('#draw-color').removeClass('uncheck').addClass('checked');
        $('#bgcolor').show();
        $('#backcolor').attr('data-color', Setting.mark.background).css('background', '#' + Setting.mark.background);
    }
    $('#setting-panel .text').eq(0).text(Setting.mark.dpi);
    $('#setting-panel .text').eq(1).text(Setting.mark.unit);
    $('#setting-panel .text').eq(2).text(Setting.mark.colorType);



    // 点击按钮
    /*
    var btns = ['position-action', 'dimension-action', 'edge-action', 'distance-action'];
    $.each(btns, function(idx, item){
        var key = item.split('-')[0];
        var value = Setting[key];
        var className = key + '-' + Constants[key][value].replace(/_/, '-').toLowerCase();
        $('#' + item).removeClass().addClass('btn-action').addClass(className);

        $('#' + key + '-layer a').removeClass('selected').each(function(){
            if (parseInt($(this).attr('data-index')) == value) {
                $(this).addClass('selected');
            }
        });
    });
    */


    $.each(Setting.padding, function(idx, item){
        var ele = $('#padding-layer a').eq(idx);
        if (item == 1) {
            ele.addClass('selected');
        } else {
            ele.removeClass('selected');
        }
    });

    $.each(Setting.text, function(key, value) {
        $('#font-layer input').each(function(){
            var name = $(this).attr('name');
            if (name == key) {
                if (value == 1) {
                    $(this).removeClass('uncheck').addClass('checked');
                } else {
                    $(this).removeClass('checked').addClass('uncheck');
                }
            }
        });
    });

    $.each(Setting.color, function(key, value){
         $('#color-layer input').each(function(){
            var name = $(this).attr('name');
            if (name == key) {
                if (value == 1) {
                    $(this).removeClass('uncheck').addClass('checked');
                } else {
                    $(this).removeClass('checked').addClass('uncheck');
                }
            }
        });
    });

    // rect
    if (Setting.rect.width > 0) {
        $('#rect-width').val(Setting.rect.width);
    }
    if (Setting.rect.height > 0) {
        $('#rect-height').val(Setting.rect.height);
    }
    $('#rect-color').attr('data-color', Setting.rect.color).css('background', '#' + Setting.rect.color);
    $('#rect-opacity').val(Setting.rect.opacity + '%');

}

(function($){

    var settingFile = instance.getLocalDir() + '/setting.json';

    // 这里做timeout是为了让页面先显示出来
    setTimeout(function(){
        initView();
    }, 300);

    $('.btn-option').click(function(){
        var target = $(this).attr('data-target');
        showLayer(target);
    });


    $('#font-layer label').click(function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        var checkbox = $(this).prev();
        checkbox.toggleClass('checked').toggleClass('uncheck');
    });

    $('#font-layer .right').click(function() {
        if (!$(this).hasClass('right-select')) {
            $('#font-layer .bottom').removeClass('bottom-select');
            $(this).addClass('right-select');
        }
    });
    $('#font-layer .bottom').click(function() {
        if (!$(this).hasClass('bottom-select')) {
            $('#font-layer .right').removeClass('right-select');
            $(this).addClass('bottom-select');
        }
    });

    $('#color-layer label').click(function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        var checkbox = $(this).prev();
        checkbox.toggleClass('checked').toggleClass('uncheck');
    });
    $('input[type=checkbox]').click(function() {
        $(this).toggleClass('checked').toggleClass('uncheck');
    });


    $('#layers .btn-action').click(function(){
        var ul = $(this).parent().parent();
        var selectType = ul.attr('data-select');
        var action = ul.attr('data-action');
        if (selectType == 'single') {   // 单选
            var idx = $(this).attr('data-index');
            instance.evalScript('parker.'+action+'("'+ Constants[action][idx] +'")', actionCallback);
        } else {
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected');
            } else {
                $(this).addClass('selected');
            }
        }
    });

    $('.color-picker-btn').click(function(){
        var btn = $(this);
        ColorPicker.show(function(color){
            btn.attr('data-color', color);
            btn.css('background', '#' + color);
        });
    });

    // 点击下拉选项按钮
    $('#layers .confirm button').click(function(){
        var target = $(this).attr('data-target');
        hideLayer(target);
        if ($(this).attr('data-type') == 'cancel') { return; }

        var actionBtn = $(this).attr('data-action');
        switch (target) {
            case 'position-layer':
            case 'dimension-layer':
            case 'edge-layer':
            case 'distance-layer':
                console.log('xxx');
                break;
            case 'padding-layer':
                $('#padding-layer a').each(function() {
                    var idx = parseInt($(this).attr('data-index'));
                    Setting.padding[idx] = $(this).hasClass('selected')? 1 : 0;
                });
                instance.writeFile(settingFile, JSON.stringify(Setting));
                break;
            case 'description-layer':
                var text = $('#description-text').val().trim();
                if (text != '') {
                    text = text.replace(/[\r\n]/g, '*_*');
                    instance.evalScript('parker.description("'+ text +'")');
                } else {
                    instance.showToast("请输入描述文字");
                }
                break;
            case 'font-layer':
                $('#font-layer input').each(function() {
                    var check = $(this).hasClass('checked');
                    var key = $(this).attr('name');
                    Setting.text[key] = (check)? 1 : 0;
                });
                if ($('#font-layer .right').hasClass('right-select')) {
                    Setting.text.direction = 'right';
                }
                if ($('#font-layer .bottom').hasClass('bottom-select')) {
                    Setting.text.direction = 'bottom';
                }
                instance.writeFile(settingFile, JSON.stringify(Setting));
                break;
            case 'color-layer':
                $('#color-layer input').each(function() {
                    var check = $(this).hasClass('checked');
                    var key = $(this).attr('name');
                    Setting.color[key] = (check)? 1 : 0;
                });
                instance.writeFile(settingFile, JSON.stringify(Setting));
                break;
            case 'rect-layer':
                var w = $('#rect-width').val();
                w = (w == '' || !/\d+/.test(w))? 0 : parseInt(w);
                var h = $('#rect-height').val();
                h = (h == '' || !/\d+/.test(h))? 0 : parseInt(h);
                var color = $('#rect-color').attr('data-color');
                color = (color == '' || color == undefined)? 'ff0000' : color;
                var opacity = $('#rect-opacity').val().replace(/%/, '');
                opacity = (opacity == '' || opacity == undefined)? 30 : opacity;
                Setting.rect.width = w;
                Setting.rect.height = h;
                Setting.rect.color = color;
                Setting.rect.opacity = opacity;
                instance.writeFile(settingFile, JSON.stringify(Setting));
                break;
        }
    });


    // 点击动作按钮
    $('#buttons .btn-action').click(function(){
        var t = $(this).attr('id');
        console.log(t);
        switch (t) {
            case 'position-action':
                instance.evalScript('parker.position("'+ Constants.position[0] +'")', actionCallback);
                break;
            case 'dimension-action':
                instance.evalScript('parker.dimension("'+ Constants.dimension[0]+'")', actionCallback);
                break;
            case 'edge-action':
                instance.evalScript('parker.edge("'+ Constants.edge[0]+'")', actionCallback);
                break;
            case 'distance-action':
                instance.evalScript('parker.distance("'+ Constants.distance[0]+'")', actionCallback);
                break;
            case 'description-action':
                showLayer('description-layer');
                break;
            case 'font-action':
                var text = Setting.text;
                var script = 'parker.text('+text.family+','+text.size+','+text.color+','+text.height+','+text.shadow+','+text.stroke+', "'+text.direction+'")';
                instance.evalScript(script, actionCallback);
                break;
            case 'color-action':
                var color = Setting.color;
                instance.evalScript('parker.color('+color.color+','+color.opacity+','+color.shadow+','+color.stroke+','+ color.radius +')', actionCallback);
                break;
            case 'padding-action':
                instance.evalScript('parker.padding('+Setting.padding.join(',')+')', actionCallback);
                break;
            case 'rect-action':
                var rect = Setting.rect;
                if (rect.width > 0 && rect.height > 0) {
                    instance.evalScript('parker.guideBox('+ rect.width +', '+ rect.height +',"'+ rect.color +'",'+ rect.opacity +')', actionCallback);
                } else {
                    instance.showToast("请输入宽和高");
                }
                break;
        }
    });


    $('#user-icon').click(function() {
        var icon = $(this);
        if (!icon.hasClass('checked')){
            $('#user-panel').show();
            $('#main-panel').addClass('main-panel-left').animate({left: '190px'}, 'fast', 'swing', function() {
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

    $('#export-btn').click(function(){
        instance.evalScript('parker.getPath()', function(result) {
            var ret = instance.openDialog('请选择导出位置', result);
            if (ret.err == 0) {
                var path = ret.data[0];
                instance.evalScript('parker.export("'+ path +'")', function(result) {
                    if (result == undefined || result == '') {
                        instance.showToast("标注图导出成功!");
                    } else {
                        actionCallback(result);
                    }
                });
            } else {
                instance.showToast('目录选择失败，请联系作者反馈问题');
            }
        });
    });

    $('#logout-btn').click(function() {
        var settingFile = instance.getLocalDir() + '/setting.json';
        instance.deleteFile(settingFile);
        user.logout();
    });



    $('#setting-icon').click(function() {
        var icon = $(this);
        if (!icon.hasClass('checked')){
            $('#setting-panel').show();
            $('#main-panel').addClass('main-panel-right').animate({right: '190px'}, 'fast', 'swing', function() {
                icon.addClass('checked');
            });
        } else {
            // 关闭设置面板，存储设置信息
            Setting.mark.fontSize = $('#draw-size').val();
            Setting.mark.foreground = $('#forecolor').attr('data-color');
            if ($('#draw-color').hasClass('checked')) {
                Setting.mark.background = $('#backcolor').attr('data-color');
            } else {
                Setting.mark.background = '';
            }
            instance.writeFile(settingFile, JSON.stringify(Setting));
            var mark = Setting.mark;
            instance.evalScript('parker.setting('+ mark.fontSize  +', "'+ mark.foreground +'","'+ mark.background +'","'+ mark.dpi +'","'+ mark.unit +'","'+ mark.colorType +'")', actionCallback);

            $('#main-panel').animate({right: 0}, 'fast', 'swing', function() {
                $(this).removeClass('main-panel-right').css('right', 'inherit');
                icon.removeClass('checked');
                $('#setting-panel').hide();
            })
        }
    });

    $('#draw-color').click(function() {
        if ($(this).hasClass('checked')) {
            $('#bgcolor').show();
        } else {
            $('#bgcolor').hide();
        }
    });

    $('#setting-panel .selector').click(function() {
        var key  = $(this).attr('data-key');
        var thiz = this;
        Selector.show(key, function(val){
            $(thiz).find('.text').text(val);
            Setting.mark[key] = val;
            instance.writeFile(settingFile, JSON.stringify(Setting));
        });
    });

    function showLayer(target) {
        $('#cover').show();
        $('#' + target).show();
        $('#layers').show().animate({top: '40px'}, 'fast', 'swing');
    }

    function hideLayer(target) {
        $('#cover').hide();
        $('#layers').animate({top: '-90px'}, 'fast', 'swing', function() {
            $(this).hide();
            $('#' + target).hide();
        });
    }


    function actionCallback(result) {
        if (result == undefined || result == 'undefined') { return; }
        result = JSON.parse(result);
        if (result.err != undefined) {
            Dialog.show(decodeURI(result.err));
        }

        if (result.exception != undefined) {
            instance.trace({app: instance.id, type: 'execption', line: result.line, message: result.exception.message, email: config.email});
            //Dialog.show('出现错误啦，可以反馈给Cut君哇~。错误信息: [' + result.line + '][' + result.exception.message + ']');
        }
    }


})(jQuery);
