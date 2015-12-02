/**
 *
 * Created by xiaoqiang on 5/21/15.
 */

/*********
 * 图层对象
 * @param id
 * @constructor
 */
Layer = function(id) {
    this.id = id;
};


/**
 * 静态方法，判断图层是否显示隐藏
 * @id  图层ID
 */
Layer.isVisible = function(id)
{
    var layerReference = new ActionReference();
    layerReference.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("Vsbl"));
    layerReference.putIdentifier(charIDToTypeID("Lyr "), id);
    var descriptor = executeActionGet(layerReference);
    if(descriptor.hasKey(charIDToTypeID("Vsbl")) == false) return false;
    return descriptor.getBoolean (charIDToTypeID("Vsbl"));
};

/**
 * 根据图层ID获取图层的次序
 */
Layer.prototype.getIndex = function()
{
    try {
        var layerReference = new ActionReference();
        layerReference.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("ItmI"));
        layerReference.putIdentifier(charIDToTypeID("Lyr "), this.id);
        var descriptor = executeActionGet(layerReference);
        return descriptor.getInteger(charIDToTypeID("ItmI"));
    } catch(e) {
        return 0;
    }
};


/**
 * 根据图层ID获取名称
 */
Layer.prototype.getName = function () {
    var layerReference = new ActionReference();
    layerReference.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("Nm  "));
    layerReference.putIdentifier(charIDToTypeID("Lyr "), this.id);
    var descriptor = executeActionGet(layerReference);
    return descriptor.getString(charIDToTypeID("Nm  "));
};

/**
 * 得到当前选中图层的尺寸
 * @returns {*}
 */
Layer.prototype.getBounds = function()
{
    var selectedLayerReference = new ActionReference();
    selectedLayerReference.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("bounds"));
    selectedLayerReference.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var selectedLayerDescriptor = executeActionGet(selectedLayerReference);
    return Rect.fromDescriptor(selectedLayerDescriptor);
};


/**
 * 获取单个、多个图层的尺寸
 */
Layer.getLayersBounds = function(doc, layers, merge)
{
    var getSelectedLayerBounds = function() {
        var selectedLayerReference = new ActionReference();
        selectedLayerReference.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("bounds"));
        selectedLayerReference.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        var selectedLayerDescriptor = executeActionGet(selectedLayerReference);
        return Rect.fromDescriptor(selectedLayerDescriptor);
    };

    var result = [];
    if(merge) {
        activeDocument.suspendHistory("Paker Layers merge",  "mesure.apply(this)");
        function mesure() {
            doc.setSelectedLayers(layers);
            executeAction(stringIDToTypeID("newPlacedLayer"), undefined, DialogModes.NO);
            result.push(getSelectedLayerBounds());
        }
    } else {
        activeDocument.suspendHistory("Parker Layers merge",  "mesure.apply(this)");
        function mesure() {
            for(var i = 0; i < layers.length ; i++) {
                doc.setSelectedLayers(layers[i]);
                executeAction(stringIDToTypeID("newPlacedLayer"), undefined, DialogModes.NO);
                result.push(getSelectedLayerBounds());
            }
        }
    }
    History.undo();
    return result;
};

/**
 * 获取文字图层的信息
 */
Layer.prototype.getTextLayerInfo = function(doc)
{
    function getTextScale(descriptor)
    {
        var textDescriptor = descriptor.getObjectValue(charIDToTypeID("Txt "));
        if(textDescriptor.hasKey(charIDToTypeID("Trnf")))
        {
            var transform = textDescriptor.getObjectValue(charIDToTypeID("Trnf"));
            return transform.getDouble (stringIDToTypeID("yy"));
        }
        return 1;
    }

    function getSafeValue(textItem, key, defaultValue)
    {
        if(typeof defaultValue  == "undefined") defaultValue = "";

        try { return textItem[key]; }
        catch(ex) { return defaultValue }
    }

    doc.setSelectedLayers(this);

    var textInfo = {};
    textInfo.antiAlising =  textInfo.fontName =  textInfo.fontStyle = textInfo.fontSize = textInfo.fontColor = "";

    try
    {
        var layer = activeDocument.activeLayer;

        var textItem = layer.textItem;
        textInfo.nntiAlising = getSafeValue(textItem,"antiAliasMethod", "None");

        textInfo.fontSize = getSafeValue(textItem,"size", 12);

        if(typeof textInfo.fontSize != "number") textInfo.fontSize = textInfo.fontSize.value;

        textInfo.lineHeight = getSafeValue(textItem,"leading", "Auto");
        if(typeof textInfo.lineHeight != "number") textInfo.lineHeight = Math.round(textInfo.lineHeight.value);

        var layerReference = new ActionReference();
        layerReference.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("Txt "));
        layerReference.putIdentifier(charIDToTypeID("Lyr "), this.id);
        var descriptor = executeActionGet(layerReference);
        var textScale = getTextScale(descriptor);
        textInfo.fontSize *= textScale;
        textInfo.fontSize = Math.round(textInfo.fontSize);

        if(typeof textInfo.lineHeight == "number")  textInfo.lineHeight *= textScale;

        textInfo.fontName = getSafeValue(textItem,"font", "MyriadPro-Regular");
        if(textInfo.fontName.indexOf('-') > 0) {
            var font = textInfo.fontName.split('-');
            textInfo.fontName = font[0];
            textInfo.fontStyle = font[1];
        } else {
            textInfo.fontStyle = "[Regular]";
        }

        if( getSafeValue(textItem,"fauxBold", false) == true) {
            textInfo.fontStyle += " [Bold]";
        }

        if( getSafeValue(textItem,"fauxItalic", false) == true) {
            textInfo.fontStyle += " [Italic]";
        }

        textInfo.fontColor = getSafeValue(textItem,"color", null);
        if(textInfo.fontColor != null) textInfo.fontColor = new Color(textInfo.fontColor.rgb.red, textInfo.fontColor.rgb.green, textInfo.fontColor.rgb.blue);
        else textInfo.fontColor = new Color(0,0,0);

        var effect = this.getLayerEffect();

        if(effect != null && effect.colorOverlay != null) {
            textInfo.fontColor = effect.colorOverlay;
        }

        if (effect != null && effect.dropShadow != null) {
            textInfo.dropShadow = effect.dropShadow;
        }

    }
    catch(ex) {
        console_error($.fileName, $.line, ex);
    }

    return textInfo;

};



/**
 * 图层效果是否可见
 */
Layer.prototype.isEnabledLayerEffect = function()
{
    var layerReference = new ActionReference();
    layerReference.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("layerFXVisible"));
    layerReference.putIdentifier(charIDToTypeID("Lyr "), this.id);
    var layerDescriptor = executeActionGet(layerReference);

    if(layerDescriptor.hasKey( stringIDToTypeID("layerFXVisible")) == false) return false;

    return layerDescriptor.getBoolean(stringIDToTypeID("layerFXVisible"));
};

/**
 * 获取图层效果
 */
Layer.prototype.getLayerEffect = function()
{
    var hasEffect = this.isEnabledLayerEffect();
    if(hasEffect == false) return null;

    var layerReference = new ActionReference();
    layerReference.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("layerEffects"));
    layerReference.putIdentifier(charIDToTypeID("Lyr "), this.id);
    var layerDescriptor = executeActionGet(layerReference);

    if(layerDescriptor.hasKey( stringIDToTypeID("layerEffects")) == false) return null;

    var effectDescriptor = layerDescriptor.getObjectValue( stringIDToTypeID("layerEffects"));

    var result = {};

    // drop shadow
    if(effectDescriptor.hasKey(stringIDToTypeID("dropShadow"))) {
        var dropShadow = effectDescriptor.getObjectValue(stringIDToTypeID("dropShadow"));

        if(dropShadow.hasKey(charIDToTypeID("enab")) && dropShadow.getBoolean(charIDToTypeID("enab")) )
            result.dropShadow  = DropShadow.fromDescriptor(dropShadow);
        else
            result.dropShadow  = null;
    } else {
        result.dropShadow = null;
    }

    // color overlay
    if(effectDescriptor.hasKey(charIDToTypeID("SoFi"))) {
        var colorOverlay = effectDescriptor.getObjectValue(charIDToTypeID("SoFi"));

        if(colorOverlay.hasKey(charIDToTypeID("enab")) && colorOverlay.getBoolean(charIDToTypeID("enab")) )
            result.colorOverlay  = Color.fromDescriptor(colorOverlay.getObjectValue(charIDToTypeID("Clr ")));
        else
            result.colorOverlay  = null;
    } else {
        result.colorOverlay = null;
    }

    // stroke
    if (effectDescriptor.hasKey(charIDToTypeID('FrFX'))) {
        var stroke = effectDescriptor.getObjectValue(charIDToTypeID('FrFX'));
        if (stroke.hasKey(charIDToTypeID('enab')) && stroke.getBoolean(charIDToTypeID('enab'))) {
            result.stroke = Stroke.fromDescriptor(stroke);
        } else {
            result.stroke = null;
        }
    } else {
        result.stroke = null;
    }

    return result;
};


/**
 * 获取形状图层的信息
 * @param layerID
 */
Layer.prototype.getLayerInfo = function(doc)
{
    doc.setSelectedLayers(this);
    var info = {
        color: new Color(0, 0, 0),
        opacity: 100,
        shadow: null,
        stroke: null
    };
    var layer = activeDocument.activeLayer;
    var effect = this.getLayerEffect();
    if (layer.kind == LayerKind.SOLIDFILL) {
        if (effect != null && effect.colorOverlay != null) {
            info.color = effect.colorOverlay;
        } else {
            info.color = this.getFillColor(doc);
        }

        if (effect != null && effect.dropShadow != null) {
            info.shadow = effect.dropShadow;
        }

        if (effect != null && effect.stroke != null) {
            info.stroke = effect.stroke;
        }

        if (layer.fillOpacity != 100)  { info.opacity = Math.round(layer.fillOpacity); }
        if (layer.opacity != 100)  { info.opacity = Math.random(layer.opacity); }

    }

    return info;
};

/**
 * 获取形状图层的填充颜色
 */
Layer.prototype.getFillColor = function(doc)
{
    doc.setSelectedLayers(this);
    var ref = new ActionReference();
    ref.putEnumerated( stringIDToTypeID( "contentLayer" ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ));
    var ref1= executeActionGet( ref );
    var list =  ref1.getList( charIDToTypeID( "Adjs" ) ) ;
    var solidColorLayer = list.getObjectValue(0);
    var color = solidColorLayer.getObjectValue(charIDToTypeID('Clr '));
    var r = color.getDouble(charIDToTypeID('Rd  '));
    var g = color.getDouble(charIDToTypeID('Grn '));
    var b = color.getDouble(charIDToTypeID('Bl  '));
    return new Color(r, g, b);
};


/**
 * 是否是文字图层
 */
Layer.prototype.isTextLayer = function()
{
    var layerReference = new ActionReference();
    layerReference.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("Txt "));
    layerReference.putIdentifier(charIDToTypeID("Lyr "), this.id);
    var descriptor = executeActionGet(layerReference);
    return descriptor.hasKey(charIDToTypeID("Txt "));
};


/**
 * 设置图层的圆角
 * @param radius
 */
Layer.prototype.setRadius = function(radius)
{
    var desc15 = new ActionDescriptor();
        desc15.putInteger( stringIDToTypeID( "keyOriginType" ), 1 );
        var desc16 = new ActionDescriptor();
            desc16.putInteger( stringIDToTypeID( "unitValueQuadVersion" ), 1 );
            desc16.putUnitDouble( stringIDToTypeID( "topRight" ), charIDToTypeID( "#Pxl" ), radius );
            desc16.putUnitDouble( stringIDToTypeID( "topLeft" ), charIDToTypeID( "#Pxl" ), radius );
            desc16.putUnitDouble( stringIDToTypeID( "bottomLeft" ), charIDToTypeID( "#Pxl" ), radius );
            desc16.putUnitDouble( stringIDToTypeID( "bottomRight" ), charIDToTypeID( "#Pxl" ), radius );
        desc15.putObject( stringIDToTypeID( "keyOriginRRectRadii" ), stringIDToTypeID( "radii" ), desc16 );
        desc15.putInteger( stringIDToTypeID( "keyActionRadiiSource" ), 1 );
        desc15.putBoolean( stringIDToTypeID( "keyActionChangeAllCorners" ), true);
    executeAction( stringIDToTypeID( "changePathDetails" ), desc15, DialogModes.NO );

};

/**
 * 编辑智能对象图层
 */
Layer.prototype.editSmartLayer = function()
{
    var idplacedLayerEditContents = app.stringIDToTypeID( "placedLayerEditContents" );
    var desc47 = new ActionDescriptor();
    app.executeAction( idplacedLayerEditContents, desc47, DialogModes.NO );
};


/**
 * 删格化当前图层
 */
Layer.prototype.rasterize = function()
{
    var desc7 = new ActionDescriptor();
    var ref4 = new ActionReference();
    ref4.putEnumerated( charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ));
    desc7.putReference( charIDToTypeID( "null" ), ref4 );
    executeAction( stringIDToTypeID( "rasterizeLayer" ), desc7, DialogModes.NO );
};

/**
 * 自由变化图层大小
 * @param width 是百分比
 * @param height 是百分比
 */
Layer.prototype.transform = function(width, height)
{
    var desc11 = new ActionDescriptor();
        var ref5 = new ActionReference();
            ref5.putEnumerated( charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ));
        desc11.putReference( charIDToTypeID( "null" ), ref5 );
        desc11.putEnumerated( charIDToTypeID( "FTcs" ), charIDToTypeID( "QCSt" ), charIDToTypeID( "Qcsa" ));
        var desc12 = new ActionDescriptor();
            desc12.putUnitDouble( charIDToTypeID( "Hrzn" ), charIDToTypeID( "#Pxl" ), 0.000000 );
            desc12.putUnitDouble( charIDToTypeID( "Vrtc" ), charIDToTypeID( "#Pxl" ), 0.000000 );
        desc11.putObject( charIDToTypeID( "Ofst" ), charIDToTypeID( "Ofst" ), desc12 );
        desc11.putUnitDouble( charIDToTypeID( "Wdth" ), charIDToTypeID( "#Prc" ), width );
        desc11.putUnitDouble( charIDToTypeID( "Hght" ), charIDToTypeID( "#Prc" ), height );
        desc11.putEnumerated( charIDToTypeID( "Intr" ), charIDToTypeID( "Intp" ), charIDToTypeID( "Bcbc" ));
    executeAction( charIDToTypeID( "Trnf" ), desc11, DialogModes.NO );
};



Layer.prototype.hide = function()
{
    var current = new ActionReference();
    current.putIdentifier(charIDToTypeID("Lyr "), this.id);

    var idHd = charIDToTypeID( "Hd  " );
    var desc242 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
    var list10 = new ActionList();
    list10.putReference( current );
    desc242.putList( idnull, list10 );
    executeAction( idHd, desc242, DialogModes.NO );
}


