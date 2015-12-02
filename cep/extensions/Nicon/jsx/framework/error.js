/* vim: set et sw=4 ts=4 sts=4 fdm=marker ff=unix fenc=utf8 nobomb: */

/**
 * ErrorMsg.js
 *
 * @author xiaoqiang
 * @mail   qiang0902@126.com
 * @date
 */

ErrorMsg = function() {
    this.msg = {
        'NO_FILE_OPEN': [1000, '您还没有打开任何文档，不能继续'],
        'NO_LAYER_SELECTED': [1001, '你还没有选择图层'],
        'MUST_TWO_LAYERS_SELECTED': [1002, '必须选择2个图层噢'],
        'NO_TEXT_LAYER_SELECTED': [1003, '必须选择一个文字图层'],
        'NO_DESCRIPTION_INPUT': [1003, '请输入描述文字'],
        'ONE_MUST_CONTAIN_ANOTHER': [1004, '图层必须是包含关系'],
        'DOC_SIZE_NOT_MATCH': [1005, 'LOGO的长宽必须是一致的才行噢~'],
        'DOC_DPI_NOT_MATCH': [1006, '文档的分辨率必须是72才行哦'],
        'FILE_NOT_SAVED': [1007, '文档没有保存，不能继续滴干活~']
    };
}

ErrorMsg.prototype.fire = function(key)
{
    //console_debug(this.msg[key][1]);
    return JSON.stringify({err: encodeURI(this.msg[key][1])});
};


