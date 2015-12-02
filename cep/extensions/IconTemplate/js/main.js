/* vim: set et sw=4 ts=4 sts=4 fdm=marker ff=unix fenc=utf8 nobomb: */

/**
 * filename.js
 *
 * @author xiaoqiang
 * @mail   qiang0902@126.com
 * @2014-10-17
 */

function init() {

    var platform = 'ios';
    var corner = 1;

    $('.tab button').click(function(){
        $('.tab div').removeClass('active');
        $(this).parent().addClass('active');
        platform = $(this).attr('platform');
    });

    $('#corner-switcher').change(function(){
        var check = $(this).is(':checked');
        corner = (check)? 1: 0;
    });

    $('#show-btn').click(function() {
        var dir = instance.getExtensionPath() + "/img/";
        instance.evalScript('instance.generate("'+dir+'", "'+platform+'", '+corner+')', function(result) {
            if (result != 'done') {
                showTip(result);
            }
        });
    });

    $('#export-btn').click(function() {
        try {
            var result = instance.openDialog("Select Save Path");
            if (result.err == 0) {
                console.log(result);
                var path = result.data[0];
                instance.evalScript('instance.export("'+ path +'","'+platform+'")');
            }
        } catch(e) {
            console.log(e);
        }
    });



}

function showTip(str) {
    $('#tip p').text(str);
    $('#cover').show();
    $('#tip').show();
}

function hideTip() {
    $('#cover').hide();
    $('#tip').hide();
}


init();
