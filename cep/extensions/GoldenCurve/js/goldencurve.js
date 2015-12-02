/**
 * Created by xiaoqiang on 7/22/15.
 */

function action(name)
{
    //console.log('action: ' + name);
    instance.evalScript("goldenCurve."+name+"()");
}

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

window.onload = function() {

    if (user.isLogin()) {
      $('#left').text('已授权，终生使用');
    }
};

