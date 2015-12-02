/* vim: set et sw=4 ts=4 sts=4 fdm=marker ff=unix fenc=utf8 nobomb: */

/**
 * Application.js
 *
 * @author xiaoqiang
 * @mail   qiang0902@126.com
 * @2015-05-11
 */

/**
 * 整个插件对象，包含ps实例的一些基本操作
 *
 */
Application = function() {

    this.rulerUnits = null;
    this.typeUnits = null;

    function init() {
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("PbkO"));
        ref.putEnumerated(charIDToTypeID("capp"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        desc.putReference(charIDToTypeID("null"), ref );

        var pdesc = new ActionDescriptor();
        pdesc.putEnumerated(stringIDToTypeID("performance"), stringIDToTypeID("performance"), stringIDToTypeID("accelerated"));    
        desc.putObject(charIDToTypeID("T   "), charIDToTypeID("PbkO"), pdesc );
        executeAction(charIDToTypeID("setd"), desc, DialogModes.NO);
    }

    init();
}


/**
 * 改变面板的显示隐藏状态
 * @name  面板名称
 * @visible  显示、隐藏
 */
Application.prototype.togglePanel = function(name, visible) 
{
    try {
        var desc = new ActionDescriptor();
        var ref = new ActionReference(); 
        ref.putName( stringIDToTypeID( "classPanel" ), name ); 
        desc.putReference( charIDToTypeID( "null" ), ref ); 
        executeAction( stringIDToTypeID( visible ? "show" : "hide"), desc, DialogModes.NO );  
    } catch(ex) {
        console_error($.fileName, $.line, ex);
    }
};

/**
 * 获取当前活跃的文档
 */
Application.prototype.getActiveDocument = function()
{
    return new Document(this, this.getDocumentID());
};

/**
 * 判断是否有活跃的文档
 */
Application.prototype.hasActiveDocument = function()
{
    return (this.getDocumentID() != -1)? true : false;
};

/**
 * 获取文档的ID
 */
Application.prototype.getDocumentID = function() {
    try {
        var documentReference = new ActionReference();
        documentReference.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("DocI"));
        documentReference.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        var documentDescriptor = executeActionGet(documentReference);
        return documentDescriptor.getInteger(charIDToTypeID("DocI"));
    } catch (e) {
        return -1;
    }
};

/**
 * 设置某个文档未活跃文档
 * @document  document对象
 */
Application.prototype.seDocumentActive = function(document)
{
    var documentDescriptor = new ActionDescriptor();
    var documentReference = new ActionReference();
    documentReference.putIdentifier(typeID("Dcmn"), document.id);
    documentDescriptor.putReference(typeID("null"), documentReference);
    executeAction(typeID("slct"), documentDescriptor, DialogModes.NO);
};


/**
 * 获取标尺单位
 */
Application.prototype.getRulerUnits = function()
{
    return app.preferences.rulerUnits;
};

/**
 * 设置标尺单位
 */
Application.prototype.setRulerUnits = function(rulerUnits) 
{
    app.preferences.rulerUnits = rulerUnits;
};

/**
 * 获取类型单位
 */
Application.prototype.getTypeUnits = function () {
    return app.preferences.typeUnits;
};


/**
 * 设置类型单位
 */
Application.prototype.setTypeUnits = function (typeUnits) {
    app.preferences.typeUnits = typeUnits;
};


/**
 * 将文件以智能对象的方式加载进来
 * @param filename
 */
Application.prototype.loadFileAsSmartObject = function(filename)
{
    var b = new ActionDescriptor;
    b.putPath(app.charIDToTypeID("null"), new File(filename));
    b.putEnumerated(app.charIDToTypeID("FTcs"), app.charIDToTypeID("QCSt"), app.stringIDToTypeID("QCSAverage"));
    var c = new ActionDescriptor;
    c.putUnitDouble(app.charIDToTypeID("Hrzn"), app.charIDToTypeID("#Pxl"), 0);
    c.putUnitDouble(app.charIDToTypeID("Vrtc"), app.charIDToTypeID("#Pxl"), 0);
    b.putObject(app.charIDToTypeID("Ofst"), app.charIDToTypeID("Ofst"), c);
    app.executeAction(app.charIDToTypeID("Plc "), b, DialogModes.NO);
};


/**
 * 保存原有配置
 */
Application.prototype.saveInstance = function()
{
    this.rulerUnits = this.getRulerUnits();
    this.typeUnits = this.getTypeUnits();
    this.setRulerUnits(Units.PIXELS); 
    this.setTypeUnits(TypeUnits.PIXELS);
};


/**
 * 恢复配置
 */
Application.prototype.restoreInstance = function()
{
    this.setRulerUnits(this.rulerUnits);
    this.setTypeUnits(this.typeUnits);
};


/* ---------------------------------
 * ----- 获取设备的基本信息 ---------
 * ---------------------------------*/





/* ---------------------------------
 * ----- 文件目录操作 ---------
 * ---------------------------------*/
Application.deleteDir = function(path)
{
    var folder = new Folder(path);
    if (folder.exists) {
        // TODO
    }
};
