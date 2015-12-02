/* vim: set et sw=4 ts=4 sts=4 fdm=marker ff=unix fenc=utf8 nobomb: */

/**
 * Document.js
 *
 * @author xiaoqiang
 * @mail   qiang0902@126.com
 * @2015-05-11
 */


/**
 * 当前文档对象模型
 * @application  应用对象
 * @id  文档ID
 */
Document = function(application, id) {
    this.id = id;
    this.App = application;
    this.size = null;
    this.rootGroupName = '@parker';
};


/**
 * 获取文档的某个属性值
 * @name  属性名称
 */
Document.prototype.getProperty = function(name)
{
    var documentReference = new ActionReference();
    documentReference.putProperty(charIDToTypeID("Prpr"), charIDToTypeID(name));
    documentReference.putIdentifier(charIDToTypeID("Dcmn"), this.id);
    var documentDescriptor = executeActionGet(documentReference);
    return documentDescriptor.getInteger(charIDToTypeID(name));
};


/**
 * 获取当前分辨率
 */
Document.prototype.getResolution = function()
{
    return this.getProperty('Rslt');
};

/**
 * 设置分辨率
 * @resolution
 */
Document.prototype.setResolution = function(resolution)
{
    var desc122 = new ActionDescriptor();
    desc122.putUnitDouble( charIDToTypeID( "Rslt" ), charIDToTypeID( "#Rsl" ), resolution);
    executeAction( charIDToTypeID( "ImgS" ), desc122, DialogModes.NO );
};

/**
 * 获取文档的尺寸
 */
Document.prototype.getSize = function()
{
    //if (this.size == null || this.id != this.App.getDocumentID()) { }
    var docRef = app.activeDocument;
    this.size = new Size(docRef.width.value, docRef.height.value);
    return this.size;
};


/**
 * 文档缩放，按照指定的宽
 * @param width
 */
Document.prototype.resize = function(width)
{
    var action = new ActionDescriptor();
    action.putUnitDouble(app.charIDToTypeID("Wdth"), app.charIDToTypeID("#Pxl"), width);
    action.putBoolean(app.stringIDToTypeID("scaleStyles"), true);
    action.putBoolean(app.charIDToTypeID("CnsP"), true);
    action.putEnumerated(app.charIDToTypeID("Intr"), app.charIDToTypeID("Intp"), app.charIDToTypeID('Blnr'));
    app.executeAction(app.charIDToTypeID("ImgS"), action, DialogModes.NO);
}

/**
 * 复制一份文档
 */
Document.prototype.duplicate = function()
{
    var documentDescriptor = new ActionDescriptor();
    var documentReference = new ActionReference();
    documentReference.putEnumerated( charIDToTypeID( "Dcmn" ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Frst" ) );
    documentDescriptor.putReference( charIDToTypeID( "null" ), documentReference );
    executeAction( charIDToTypeID( "Dplc" ), documentDescriptor, DialogModes.NO );
};

/**
 * 获取全局光的角度
 */
Document.prototype.getGlobalLight = function()
{
    var ref = new ActionReference();
    ref.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("globalAngle"));
    ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var descriptor = executeActionGet(ref);
    return descriptor.getInteger(stringIDToTypeID("globalAngle"));
};


/**
 * 选中最上面的哪个图层
 */
Document.prototype.selectFrontLayer = function()
{
    var layerDescriptor = new ActionDescriptor();
    var layerReference = new ActionReference();
    layerReference.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Frnt"));
    layerDescriptor.putReference( charIDToTypeID( "null" ), layerReference );
    layerDescriptor.putBoolean( charIDToTypeID( "MkVs" ), false );
    executeAction( charIDToTypeID( "slct" ), layerDescriptor, DialogModes.NO );
};


/**
 * 根据图层名称选中图层
 * @param name
 */
Document.prototype.selectLayerByName = function(name)
{
    var desc8 = new ActionDescriptor();
        var ref5 = new ActionReference();
            ref5.putName( charIDToTypeID( "Lyr " ), name );
        desc8.putReference( charIDToTypeID( "null" ), ref5 );
        desc8.putBoolean( charIDToTypeID( "MkVs" ), false );
    executeAction( charIDToTypeID( "slct" ), desc8, DialogModes.NO );
};

/**
 * 获取当前选中的图层ID
 * @return [layers list]
 */
Document.prototype.getSelectedLayers = function()
{
    var selectedLayers = [];
    try {
        var targetLayersTypeId = stringIDToTypeID("targetLayers");

        var selectedLayersReference = new ActionReference();
        selectedLayersReference.putProperty(charIDToTypeID("Prpr"), targetLayersTypeId);
        selectedLayersReference.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));        
        var descriptor = executeActionGet(selectedLayersReference);

        if(descriptor.hasKey(targetLayersTypeId) == false) {            
            selectedLayersReference = new ActionReference();
            selectedLayersReference.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("LyrI"));                
            selectedLayersReference.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            descriptor = executeActionGet(selectedLayersReference);
            var id = descriptor.getInteger(charIDToTypeID("LyrI"));                    

            if(Layer.isVisible(id)) selectedLayers.push (new Layer(id));
        } else {
            var hasBackground = this.hasBackgroundLayer() ? 0 : 1;

            var list = descriptor.getList(targetLayersTypeId);
            for (var i = 0; i < list.count; i++) {
                var selectedLayerIndex = list.getReference(i).getIndex() + hasBackground;
                var selectedLayersReference = new ActionReference();
                selectedLayersReference.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("LyrI"));
                selectedLayersReference.putIndex(charIDToTypeID("Lyr "), selectedLayerIndex);
                descriptor = executeActionGet(selectedLayersReference);

                var id = descriptor.getInteger(charIDToTypeID("LyrI"));                    
                if(Layer.isVisible(id)) selectedLayers.push (new Layer(id));
            }
        }  
    } catch(ex) { 
        console_error($.fileName, $.line, ex);
    }
    return selectedLayers;
};


/**
 * 选中多个图层
 */
Document.prototype.setSelectedLayers = function(layers)
{
    if(layers.constructor != Array) layers = [layers];
    if(layers.length == 0) return;
    var current = new ActionReference();
    for(var i = 0; i < layers.length;i++) {
        current.putIdentifier(charIDToTypeID("Lyr "), layers[i].id);
    }

    var desc  = new ActionDescriptor();
    desc.putReference (charIDToTypeID("null"), current);
    executeAction( charIDToTypeID( "slct" ), desc , DialogModes.NO );
};

/**
 * 隐藏图层
 * @param selectedLayers
 * @constructor
 */
Document.prototype.hideLayer = function(selectedLayers)
{

    if(selectedLayers.constructor === Number) selectedLayers = [selectedLayers];

    var current = new ActionReference();
    for(var i = 0; i < selectedLayers.length;i++) current.putIdentifier(charIDToTypeID("Lyr "), selectedLayers[i]);

    var idHd = charIDToTypeID( "Hd  " );
    var desc242 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
    var list10 = new ActionList();
    list10.putReference( current );
    desc242.putList( idnull, list10 );
    executeAction( idHd, desc242, DialogModes.NO );
};


/**
 * 删除图层在选区中的内容
 */
Document.prototype.deleteLayerContent = function()
{
    var idDlt = charIDToTypeID( "Dlt " );
    executeAction( idDlt, undefined, DialogModes.NO );
};


/**
 * 获取当前的选区
 */
Document.prototype.getSelection = function()
{
    try {
        var selection = activeDocument.selection.bounds;
        return new Rect(selection[0].value, selection[1].value, selection[2].value - selection[0].value, selection[3].value - selection[1].value);
    } catch (ex) {
        return null;
    }
};

/**
 * 选中某个选区
 */
Document.prototype.setSelection = function (bounds) {
    var size = this.getSize();
    var documentBounds = new Rect(0, 0, size.width, size.height);
    var bounds = documentBounds.intersect(bounds);
    if(bounds == null) return null;

    var selectionMode = /*isAppend ? charIDToTypeID("AddT") : */charIDToTypeID("setd");
    var selectionDescriptor = new ActionDescriptor();
    var selectionReference = new ActionReference();
    selectionReference.putProperty(charIDToTypeID("Chnl"), charIDToTypeID("fsel"));
    selectionDescriptor.putReference(charIDToTypeID("null"), selectionReference);
    selectionDescriptor.putObject(charIDToTypeID("T   "), charIDToTypeID("Rctn"), bounds.toDescriptor());
    executeAction(selectionMode, selectionDescriptor, DialogModes.NO);

    return bounds;    
};

Document.prototype.deselectSelection = function () {
    var selectionDescriptor = new ActionDescriptor();
    var selectionReference = new ActionReference();
    selectionReference.putProperty(charIDToTypeID("Chnl"), charIDToTypeID("fsel"));
    selectionDescriptor.putReference(charIDToTypeID("null"), selectionReference);
    selectionDescriptor.putEnumerated(charIDToTypeID("T   "), charIDToTypeID("Ordn"), charIDToTypeID("None"));
    executeAction(charIDToTypeID("setd"), selectionDescriptor, DialogModes.NO);

};


/**
 * 获取当前的文档的颜色取样器
 */
Document.prototype.getColorSamplers = function()
{
    var result = [];
    var cs = activeDocument.colorSamplers;
    if (cs.length > 0) {
        for (var i = 0; i < cs.length; i++) {
            var colorSampler = new ColorSampler();
            colorSampler.color = (cs[i] == null)? new Color(0, 0, 0) : new Color(cs[i].color.rgb.red, cs[i].color.rgb.green, cs[i].color.rgb.blue);
            colorSampler.position = new Point(cs[i].position[0], cs[i].position[1]);
            result.push(colorSampler);
        }
    }
    return result;
};

/**
 * 删除所有颜色取样器
 */
Document.prototype.removeColorSamplers = function()
{
    var idDlt = charIDToTypeID( "Dlt " );
    var desc30 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
    var ref19 = new ActionReference();
    var idClSm = charIDToTypeID( "ClSm" );
    var idOrdn = charIDToTypeID( "Ordn" );
    var idAl = charIDToTypeID( "Al  " );
    ref19.putEnumerated( idClSm, idOrdn, idAl );
    desc30.putReference( idnull, ref19 );
    executeAction( idDlt, desc30, DialogModes.NO );
};

/**
 * 当前文档是否有背景图层
 */
Document.prototype.hasBackgroundLayer = function()
{
    var backgroundReference = new ActionReference();
    backgroundReference.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("Bckg"));
    backgroundReference.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Back"));
    var backgroundDescriptor = executeActionGet(backgroundReference);
    var hasBackground = backgroundDescriptor.getBoolean(charIDToTypeID("Bckg"));

    if(hasBackground == false) {
        try
        {
            var layerReference = new ActionReference();
            layerReference.putIndex(charIDToTypeID("Lyr "), 0);
            var zero = executeActionGet(layerReference);
            hasBackground = true;
        } catch(ex) {

        }
    }
    return hasBackground;
};


/**
 * 根据图层转换成选区
 */
Document.prototype.toSelection = function()
{
    var desc3 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putProperty( charIDToTypeID( "Chnl" ), charIDToTypeID( "fsel" ));
    desc3.putReference( charIDToTypeID( "null" ), ref1 );
    var ref2 = new ActionReference();
    ref2.putEnumerated( charIDToTypeID( "Path" ), charIDToTypeID( "Path" ), stringIDToTypeID( "vectorMask" ));
    ref2.putEnumerated( charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ));
    desc3.putReference( charIDToTypeID( "T   " ), ref2 );
    desc3.putInteger( charIDToTypeID( "Vrsn" ), 1 );
    desc3.putBoolean( stringIDToTypeID( "vectorMaskParams" ), true );
    executeAction( charIDToTypeID( "setd" ), desc3, DialogModes.NO );
};


/**
 * 反转选区
 */
Document.prototype.inverseSelection = function()
{
    var idInvs = charIDToTypeID( "Invs" );
    executeAction( idInvs, undefined, DialogModes.NO );
};

/**
 * 获取parker的根目录
 */
Document.prototype.getRootGroup = function()
{
    var root = null;
    try {
        root = activeDocument.layerSets.getByName(this.rootGroupName);
    } catch (e) {
        root = activeDocument.layerSets.add();
        root.name = this.rootGroupName;
    }
    return root;
};


/**
 * 判断当前文档是否已经保存了
 * @returns {boolean}
 */
Document.prototype.isSaved = function()
{
    var a = new ActionReference;
    a.putEnumerated(app.charIDToTypeID("Dcmn"), app.charIDToTypeID("Ordn"), app.charIDToTypeID("Trgt"));
    return app.executeActionGet(a).hasKey(app.stringIDToTypeID("fileReference")) ? true: false;
}


/**
 * 关闭当前文档，不保存
 */
Document.prototype.close = function()
{
    var desc904 = new ActionDescriptor();
    desc904.putEnumerated( charIDToTypeID( "Svng" ), charIDToTypeID( "YsN " ), charIDToTypeID( "N   " ) );
    executeAction( charIDToTypeID( "Cls " ), desc904, DialogModes.NO );
};


/**
 * 保存并关闭当前文档
 */
Document.prototype.saveAndClose = function()
{
    var desc904 = new ActionDescriptor();
    desc904.putEnumerated( charIDToTypeID( "Svng" ), charIDToTypeID( "YsN " ), charIDToTypeID( "Ys  " ) );
    executeAction( charIDToTypeID( "Cls " ), desc904, DialogModes.NO );
};


