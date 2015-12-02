/* vim: set et sw=4 ts=4 sts=4 fdm=marker ff=unix fenc=utf8 nobomb: */

/**
 * Canvas.js
 *
 * @author xiaoqiang
 * @mail   qiang0902@126.com
 * @date
 */

Canvas = function(doc) {
    this.document = doc;
    this.fontSize = 12;
    this.AntiAliasing = 'None';
    this.foreground = new Color(255, 0, 156);
    this.background = '';
    this.fontFamily = 'Verdana';
    this.bold = true;
    this.textAlignment = charIDToTypeID('Left');
    this.opacity = 100;
    this.strokeColor = new Color(255, 255, 255);
    this.dpi = 'XHDPI';
    this.unit = 'px';
    this.colorType = 'HEX&RGB';

    this.shapes = [];
    this.shapeLayers = [];
};


/**
 * 往画布中添加一条线
 */
Canvas.prototype.addLine = function(x, y, length, horizontal)
{
    this.shapes.push(new Line(x, y, length, horizontal));
};


/**
 * 往画布中添加一个矩形
 */
Canvas.prototype.addRectangle = function(x, y, width, height, radius)
{
    this.shapes.push(new Rectangle(x, y, width, height, radius));
};

/**
 * 往画布中添加一个椭圆
 */
Canvas.prototype.addEllipse = function(x, y, width, height)
{
    this.shapes.push(new Ellipse(x, y, width, height));
};

/**
 * 把新生成的图层记录起来
 */
Canvas.prototype.addLayerItem = function()
{
    var selectedLayers = this.document.getSelectedLayers();
    for (var i in selectedLayers) {
        this.shapeLayers.push(selectedLayers[i]);
    }
    return selectedLayers[0];
};

/**
 * 把生成的图层都结合起来
 */
Canvas.prototype.collapse = function(groupName)
{
    if (this.shapeLayers.length == 0) { return; }
    var root = this.document.getRootGroup();
    if (root != null) {
        var subGroup =  root.layerSets.add();
        subGroup.name = groupName;
        var result = this.document.getSelectedLayers();
        var groupIdx = result[0].getIndex() - 1;

        // 选中需要链接的图层
        this.document.setSelectedLayers(this.shapeLayers);

        // 暂时不做图层链接的事情
        /*
        if (this.shapeLayers.length > 1 && this.background == '') {
            var desc11 = new ActionDescriptor();
            var ref7 = new ActionReference();
            ref7.putEnumerated( charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ) );
            desc11.putReference( charIDToTypeID( "null" ), ref7 );
            executeAction( stringIDToTypeID( "linkSelectedLayers" ), desc11, DialogModes.NO );
        }
        */

        // 移动图层
        this.moveLayer(groupIdx);
    }

    this.shapeLayers.length = 0;
};


/**
 * 移动某个图层到目标图层下面
 * @param index
 */
Canvas.prototype.moveLayer = function(index)
{
    var desc9 = new ActionDescriptor();
    var ref5 = new ActionReference();
    ref5.putEnumerated( charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ) );
    desc9.putReference( charIDToTypeID( "null" ), ref5 );
    var ref6 = new ActionReference();
    ref6.putIndex(charIDToTypeID("Lyr "), index);
    desc9.putReference( charIDToTypeID( "T   " ), ref6 );
    desc9.putBoolean( charIDToTypeID( "Adjs" ), false );
    desc9.putInteger( charIDToTypeID( "Vrsn" ), 5 );
    executeAction( charIDToTypeID( "move" ), desc9, DialogModes.NO );
}

/**
 * 开始画各种形状
 */
Canvas.prototype.drawShapes = function()
{
    if (this.shapes.length == 0) { return; }
    activeDocument.suspendHistory ("Render Canvas Drawing", "OnRender.apply(this)");
    function OnRender()
    {

        var fg = this.foreground;
        if (this.background != '') {
            this.foreground = this.background;
        }


        var desc448 = new ActionDescriptor();
        var ref321 = new ActionReference();
        ref321.putClass( stringIDToTypeID( "contentLayer" ));
        desc448.putReference( charIDToTypeID( "null" ), ref321 );

        var layerDescriptor = new ActionDescriptor();
        
        var solidColorLayerDescriptor = new ActionDescriptor();
        solidColorLayerDescriptor.putObject(charIDToTypeID("Clr "), charIDToTypeID("RGBC"), this.foreground.toDescriptor());        
        layerDescriptor.putUnitDouble(charIDToTypeID("Opct"), charIDToTypeID("#Prc"), this.opacity);
        layerDescriptor.putObject(charIDToTypeID("Type"),stringIDToTypeID( "solidColorLayer" ), solidColorLayerDescriptor);
        layerDescriptor.putObject( charIDToTypeID( "Shp " ), this.shapes[0].descriptorType, this.shapes[0].createDescriptor());
                
        desc448.putObject( charIDToTypeID( "Usng" ), stringIDToTypeID( "contentLayer" ), layerDescriptor );
        executeAction( charIDToTypeID( "Mk  " ), desc448, DialogModes.NO );


        for(var i = 1; i < this.shapes.length ; i++)
        {
            var desc453 = new ActionDescriptor();
            var ref322 = new ActionReference();
            ref322.putEnumerated( charIDToTypeID( "Path" ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ) );
            desc453.putReference( charIDToTypeID( "null" ), ref322 );           
            desc453.putObject( charIDToTypeID( "T   " ), this.shapes[i].descriptorType, this.shapes[i].createDescriptor() );
            executeAction( charIDToTypeID( "AddT" ), desc453, DialogModes.NO );        
        }

        /*
        if(this.RasterizeVectorMask)
        {
            var desc = new ActionDescriptor();
            var ref = new ActionReference();
            ref.putEnumerated( charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );
            desc.putReference( charIDToTypeID('null'), ref );
            desc.putEnumerated( charIDToTypeID('What'), stringIDToTypeID('rasterizeItem'), stringIDToTypeID('vectorMask') );
            executeAction( stringIDToTypeID('rasterizeLayer'), desc, DialogModes.NO );        
        }
        
        */

        this.foreground = fg;
        this.addLayerItem();
    }

    this.shapes.length = 0;

};


/**
 * 画一条长度线段
 */
Canvas.prototype.drawLength = function(x, y, length, horizontal)
{
    this.textAlignment = (horizontal)? charIDToTypeID("Cntr") : charIDToTypeID("Left");

    var horizontalOffset = horizontal ? (length/2) : 1;
    var verticalOffset = horizontal ? 6 + this.fontSize*0.5 : (length*0.5) + this.fontSize / 2;
    if(horizontal) {
        y += 6;
        this.addLine(x, y-5, 11, false);    
        this.addLine(x+length-1, y-5, 11, false);    
    } else {
        x += 6;
        this.addLine(x - 5,y,11, true);    
        this.addLine(x -5,y + length - 1,11, true);    
    }

    this.addLine(x,y,length - 1, horizontal);
    this.drawShapes();
    this.drawText(x + horizontalOffset, y + verticalOffset, this.fixUnit(length));
    this.textAlignment = charIDToTypeID("Left");

};

/**
 * 画文本内容
 * @x  横坐标
 * @y  众坐标
 * @text    文本内容
 */
Canvas.prototype.drawText = function(x, y, text)
{
    if (text == null || text == '') { return; }
    if (typeof text != 'String') { text = text.toString(); }

    var docSize = this.document.getSize();
    x = (typeof x !== 'undefined' ? x : 0) / docSize.width * 100;
    y = (typeof y !== 'undefined' ? y : 0) / docSize.height * 100;

    var textLayerDescriptor = new ActionDescriptor();
    var textLayerTypeReference = new ActionReference();
        textLayerTypeReference.putClass(charIDToTypeID("TxLr"));
    textLayerDescriptor.putReference(charIDToTypeID("null"), textLayerTypeReference);


    var styleRangeDescriptor = new ActionDescriptor();
        styleRangeDescriptor.putString(charIDToTypeID("Txt "), text);   // text
        styleRangeDescriptor.putObject(charIDToTypeID("TxtC"), charIDToTypeID("#Pxl"), new Point(x, y).toDescriptor()); // position
        styleRangeDescriptor.putEnumerated( charIDToTypeID( "AntA" ), charIDToTypeID( "Annt" ), this.getAntiAliasing(this.AntiAliasing));   // anti alising

    var styleDescriptor = new ActionDescriptor();
        styleDescriptor.putUnitDouble(charIDToTypeID("Sz  "), charIDToTypeID("#Pxl"), this.fontSize); // font size
        styleDescriptor.putObject(charIDToTypeID("Clr "), charIDToTypeID("RGBC"), this.foreground.toDescriptor()); // foreground
        styleDescriptor.putString( stringIDToTypeID( "fontPostScriptName" ), this.getPostScriptFontName(this.fontFamily) );    // font family
        styleDescriptor.putBoolean( stringIDToTypeID( "syntheticBold" ), this.bold);    // bold

    var textStyleDescriptor = new ActionDescriptor();
        textStyleDescriptor.putInteger(charIDToTypeID("From"), 0);
        textStyleDescriptor.putInteger(charIDToTypeID("T   "), text.length);
        textStyleDescriptor.putObject(charIDToTypeID("TxtS"), charIDToTypeID("TxtS"), styleDescriptor);

    var textStyleList = new ActionList();
        textStyleList.putObject(charIDToTypeID("Txtt"), textStyleDescriptor);

    styleRangeDescriptor.putList(charIDToTypeID("Txtt"), textStyleList);                 

    var paragraphStyles = new ActionList();
    var paragraphStyleDescriptor = new ActionDescriptor();
        paragraphStyleDescriptor.putInteger(charIDToTypeID("From"), 0);
        paragraphStyleDescriptor.putInteger(charIDToTypeID("T   "), text.length);

    // alignment
    var alignmentDescriptor = new ActionDescriptor();        
        alignmentDescriptor.putEnumerated(charIDToTypeID("Algn"), charIDToTypeID("Alg "), this.textAlignment);                  
    paragraphStyleDescriptor.putObject(stringIDToTypeID("paragraphStyle"), stringIDToTypeID("paragraphStyle"), alignmentDescriptor);                

    paragraphStyles.putObject(stringIDToTypeID("paragraphStyleRange"), paragraphStyleDescriptor);
    styleRangeDescriptor.putList(stringIDToTypeID("paragraphStyleRange"), paragraphStyles);
    textLayerDescriptor.putObject(charIDToTypeID("Usng"), charIDToTypeID("TxLr"), styleRangeDescriptor);
    executeAction(charIDToTypeID("Mk  "), textLayerDescriptor, DialogModes.NO);

    if (this.background == '') {
        this.stroke();
    }
    this.addLayerItem();

    if (this.background != '') {
        var selectedLayerReference = new ActionReference();
        selectedLayerReference.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("bounds"));
        selectedLayerReference.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        var selectedLayerDescriptor = executeActionGet(selectedLayerReference);
        var bounds = Rect.fromDescriptor(selectedLayerDescriptor);

        /*
        var current = { foreground : this.foreground, opacity : this.opacity };

        this.foreground = this.background;
        this.opacity = 100;
        */

        this.addRectangle(bounds.X - 1, bounds.Y - 1, bounds.width + 2, bounds.height + 2);
        this.drawShapes();

        //this.foreground = current.foreground;

        var idmove = charIDToTypeID( "move" );
        var desc70 = new ActionDescriptor();
        var ref51 = new ActionReference();
        ref51.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        desc70.putReference( charIDToTypeID( "null" ), ref51 );

        var ref52 = new ActionReference();
        ref52.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Prvs"));
        desc70.putReference(charIDToTypeID( "T   " ), ref52 );
        executeAction( idmove, desc70, DialogModes.NO );

        this.addLayerItem();

    }

};

Canvas.prototype.stroke = function()
{
    var desc32 = new ActionDescriptor();
    var ref14 = new ActionReference();
    ref14.putProperty( charIDToTypeID( "Prpr" ), charIDToTypeID( "Lefx" ));
    ref14.putEnumerated( charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ));
    desc32.putReference( charIDToTypeID( "null" ), ref14 );
    var desc33 = new ActionDescriptor();
    desc33.putUnitDouble( charIDToTypeID( "Scl " ), charIDToTypeID( "#Prc" ), 100.000000 );
    var desc34 = new ActionDescriptor();
    desc34.putBoolean( charIDToTypeID( "enab" ), true );
    desc34.putEnumerated( charIDToTypeID( "Styl" ), charIDToTypeID( "FStl" ), charIDToTypeID( "OutF" ));
    desc34.putEnumerated( charIDToTypeID( "PntT" ), charIDToTypeID( "FrFl" ), charIDToTypeID( "SClr" ));
    desc34.putEnumerated( charIDToTypeID( "Md  " ), charIDToTypeID( "BlnM" ), charIDToTypeID( "Nrml" ));
    desc34.putUnitDouble( charIDToTypeID( "Opct" ), charIDToTypeID( "#Prc" ), 100.000000 );
    desc34.putUnitDouble( charIDToTypeID( "Sz  " ), charIDToTypeID( "#Pxl" ), 1.000000 );
    var desc35 = new ActionDescriptor();
    desc35.putDouble( charIDToTypeID( "Rd  " ), this.strokeColor.R );
    desc35.putDouble( charIDToTypeID( "Grn " ), this.strokeColor.G );
    desc35.putDouble( charIDToTypeID( "Bl  " ), this.strokeColor.B );
    desc34.putObject( charIDToTypeID( "Clr " ), charIDToTypeID( "RGBC" ), desc35 );
    desc33.putObject(charIDToTypeID( "FrFX" ), charIDToTypeID( "FrFX" ), desc34 );
    desc32.putObject( charIDToTypeID( "T   " ), charIDToTypeID( "Lefx" ), desc33 );
    executeAction( charIDToTypeID( "setd" ), desc32, DialogModes.NO );
};

Canvas.prototype.getAntiAliasing = function(antiAliasing)
{
    if(antiAliasing == null || antiAliasing == "None") return stringIDToTypeID("antiAliasNone");
    else if(antiAliasing == "Sharp") return stringIDToTypeID("antiAliasSharp");
    else if(antiAliasing == "Crisp") return stringIDToTypeID("antiAliasCrisp");
    else if(antiAliasing == "Strong") return stringIDToTypeID("antiAliasStrong");
    else if(antiAliasing == "Smooth") return stringIDToTypeID("antiAliasSmooth");
    
}

Canvas.prototype.getPostScriptFontName = function(fontName)
{
    var fonts = app.fonts;
    var count = fonts.length;
    var similarFonts = [];
    for(var i=0;i<count; i++) {
        if(fonts[i].name == fontName || fonts[i].name.indexOf (fontName) == 0) return fonts[i].postScriptName;        
    }
    return "MicrosoftYaHei";
};

Canvas.prototype.fixUnit = function(value, sp)
{
    var result = value;
    if (this.unit == 'px')  return result + this.unit;
    else if (this.unit == 'pt') return parseInt(result/2) + this.unit;
    else if (this.dpi == "LDPI") result = value * (160.0 / 120.0);
    else if (this.dpi == "MDPI") result = value * (160.0 / 160.0);
    else if (this.dpi == "HDPI") result = value * (160.0 / 240.0);
    else if (this.dpi == "XHDPI") result = value * (160.0 / 320.0);
    else if (this.dpi == "XXHDPI") result = value * (160.0 / 480.0);
    else if (this.dpi == "XXXHDPI") result = value * (160.0 / 640.0);


    var unit = (sp == undefined)? this.unit : 'sp';

    return parseInt(result) + unit;
};

