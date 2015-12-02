/* vim: set et sw=4 ts=4 sts=4 fdm=marker ff=unix fenc=utf8 nobomb: */

/**
 * common.js
 *
 * @author xiaoqiang
 * @mail   qiang0902@126.com
 * @date
 */

/********************************
 * Rect类
 ********************************/
Rect = function (x, y, width, height) {
    this.X = x;
    this.Y = y;
    this.width = width;
    this.height = height;

    this.right = function () {
        return this.X + this.width;
    };
    this.bottom = function() {
        return this.Y + this.height;
    };
    this.isEmpty = function() {
        if (this.width > 0) {
            return (this.height <= 0);
        }
        return true;
    };
    this.size = function() {
        return new Size(this.width, this.height);
    };
    this.intersectsWith = function(rect) {
        return ((((rect.X < (this.X + this.width)) && (this.X < (rect.X + rect.width))) && (rect.Y < (this.Y + this.height))) && (this.Y < (rect.Y + rect.height)));
    };
    this.contains = function(rect) {
        return ((((this.X <= rect.X) && ((rect.X + rect.width) <= (this.X + this.width))) && (this.Y <= rect.Y)) && ((rect.Y + rect.height) <= (this.Y + this.height)));
    };

}

Rect.prototype.toString = function() {
    return this.X + "," + this.Y + "," + this.width + "," + this.height;
};

Rect.prototype.fixDocumentEdge = function(documentSize)
{
    if (this.X < 0) {
        this.width = this.width + this.X;
        this.X = 0;
    }
    if (this.Y < 0) {
        this.height = this.height + this.Y;
        this.Y = 0;
    }
    if (this.right() > documentSize.width) {
        this.width = documentSize.width - this.X;
    }
    if (this.bottom() > documentSize.height) {
        this.height = documentSize.height - this.Y;
    }
};

Rect.prototype.toDescriptor = function () {
    var result = new ActionDescriptor();
    result.putUnitDouble(charIDToTypeID("Left"), charIDToTypeID("#Pxl"), this.X);
    result.putUnitDouble(charIDToTypeID("Top "), charIDToTypeID("#Pxl"), this.Y);
    result.putUnitDouble(charIDToTypeID("Rght"), charIDToTypeID("#Pxl"), this.right());
    result.putUnitDouble(charIDToTypeID("Btom"), charIDToTypeID("#Pxl"), this.bottom());
    return result;
};

Rect.prototype.intersect = function(b) {
    var a = this;
    var x = Math.max(a.X, b.X);
    var num2 = Math.min((a.X + a.width), (b.X + b.width));
    var y = Math.max(a.Y, b.Y);
    var num4 = Math.min((a.Y + a.height), (b.Y + b.height));
    if ((num2 >= x) && (num4 >= y)) {
        return new Rect(x, y, num2 - x, num4 - y);
    }
    return null;
};

Rect.fromDescriptor = function (descriptor) {
    var boundsStringId = stringIDToTypeID("bounds");
    var rectangle = descriptor.getObjectValue(boundsStringId);
    var left = rectangle.getUnitDoubleValue(charIDToTypeID("Left"));
    var top = rectangle.getUnitDoubleValue(charIDToTypeID("Top "));
    var right = rectangle.getUnitDoubleValue(charIDToTypeID("Rght"));
    var bottom = rectangle.getUnitDoubleValue(charIDToTypeID("Btom"));
    return new Rect(left, top, (right - left), (bottom - top));
};

Rect.arrange = function(r1, r2, direction) {
    if (direction == 'HORIZONTAL') {
        var left, right, isIntersect;
        left = (r1.X <= r2.X)? r1 : r2;
        right = (r1.X <= r2.X)? r2 : r1;
        isIntersect = (left.right() < right.X)? false : true;
        return [left, right, isIntersect];
    }
    if (direction == 'VERTICAL') {
        var top, bottom, isIntersect;
        top = (r1.Y <= r2.Y)? r1 : r2;
        bottom = (r1.Y < r2.Y)? r2 : r1;
        isIntersect = (top.bottom() < bottom.Y)? false : true;
        return [top, bottom, isIntersect];
    }
};

/********************************
 * Size类
 ********************************/
Size = function (width, height) {
    this.width = width;
    this.height = height;
}
Size.prototype.toString = function() {
    return this.width + "," + this.height;
};
Size.prototype.ToDescriptor = function () { };
Size.fromDescriptor = function (descriptor, ratio) {
    if (ratio == null) ratio = 1;
    var width = descriptor.getUnitDoubleValue(charIDToTypeID("Wdth")) * ratio;
    var height = descriptor.getUnitDoubleValue(charIDToTypeID("Hght")) * ratio;
    return new Size(width, height);
};


/********************************
 * Point类
 ********************************/
Point = function(x, y) {
    this.X = x;
    this.Y = y;
}

Point.prototype.toString = function() {
    return this.X + "," + this.Y;
};

Point.prototype.toDescriptor = function (pointType) {
    if(pointType == null) pointType = charIDToTypeID("#Pxl");
    var result = new ActionDescriptor();
    result.putUnitDouble(charIDToTypeID("Hrzn"), pointType, this.X);
    result.putUnitDouble(charIDToTypeID("Vrtc"), pointType, this.Y);
    return result;
};


/********************************
 * Color类
 ********************************/
Color = function (r, g, b) {
    this.R = r;
    this.G = g;
    this.B = b;
    this.A = 255.0;
    this.Hex = function() {
        return ("#" + componentToHex(this.R) + componentToHex(this.G) + componentToHex(this.B)).toUpperCase();
    };
    this.RGB = function() {
        return ("(" + Math.round(this.R) + "," + Math.round(this.G) + "," + Math.round(this.B) + ")");
    };
    this.toString = function() {
        
        if(typeof ColorType == "undefined") ColorType = "";
        
        if(ColorType == "RGB") return this.RGB();
        else if(ColorType == "HEX") return this.Hex();
        else return (this.Hex() + " / " + this.RGB());        
    };
    function componentToHex(c) {
        c = Math.round(c);
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
}

Color.prototype.toDescriptor = function() {    
    var result = new ActionDescriptor();
    result.putDouble(charIDToTypeID("Rd  "), this.R);
    result.putDouble(charIDToTypeID("Grn "), this.G);
    result.putDouble(charIDToTypeID("Bl  "), this.B);
    return result;    
};

Color.fromDescriptor = function (descriptor) {
    var r = descriptor.getDouble(charIDToTypeID("Rd  "));
    var g = descriptor.getDouble(charIDToTypeID("Grn "));
    var b = descriptor.getDouble(charIDToTypeID("Bl  "));
    return new Color(r, g, b);
};



/********************************
 * Line类
 * 画线
 ********************************/
Line = function(x, y, length, horizontal) {
    this.X = x;
    this.Y = y;
    this.length = length;
    this.horizontal = horizontal;
};
Line.prototype.descriptorType = charIDToTypeID("Ln  ");
Line.prototype.createDescriptor = function()
{
    var lineDescriptor = new ActionDescriptor();

    var x1 = this.X + (this.horizontal == false ? 0.5 : 0);
    var y1 = this.Y + (this.horizontal ? 0.5 : 0);
    
    var x2 = x1 + (this.horizontal ? this.length : 0);
    var y2 = y1 + (this.horizontal == false ? this.length : 0);
    
    lineDescriptor.putObject( charIDToTypeID( "Strt" ), charIDToTypeID( "Pnt " ), new Point(x1, y1).toDescriptor());       
    lineDescriptor.putObject( charIDToTypeID( "End " ), charIDToTypeID( "Pnt " ), new Point(x2, y2).toDescriptor());   
    lineDescriptor.putUnitDouble( charIDToTypeID( "Wdth" ), charIDToTypeID( "#Pxl" ), 1.000000 );
    
    return lineDescriptor;
}


/********************************
 * Rectangle类
 * 画方形相关
 ********************************/
Rectangle = function(x, y, width, height, radius) {
    if(typeof radius == "undefined") radius = 0;
    this.X = x; 
    this.Y = y; 
    this.width = width; 
    this.height = height; 
    this.radius = radius;    
};
Rectangle.prototype.descriptorType = charIDToTypeID( "Rctn");
Rectangle.prototype.createDescriptor = function()
{
    var rectangleDescriptor = new Rect(this.X, this.Y, this.width, this.height).toDescriptor();
    if(this.radius > 0) {
        rectangleDescriptor.putUnitDouble( charIDToTypeID( "Rds " ), charIDToTypeID( "#Pxl" ), this.radius);
    }
    return rectangleDescriptor;
}

/********************************
 * Ellipse类
 * 画椭圆相关
 ********************************/
Ellipse = function (x, y, width, height) {
    Rectangle.apply(this, arguments);         
}
Ellipse.prototype.descriptorType = charIDToTypeID("Elps");
Ellipse.prototype.createDescriptor = Rectangle.prototype.createDescriptor;


/********************************
 * DropShadow类
 * 阴影相关
 ********************************/
DropShadow = function () {
    this.color = null;
    this.distance = 0;
    this.size = 0;
    this.angle = 0;
	this.opacity = 0;
}
DropShadow.prototype.toString = function() {       
    return this.color.toString() + " " + this.distance + "px " + this.size + "px (" + Math.round(this.angle) + "')";
};
DropShadow.fromDescriptor = function (dropShadow, globalLight) {
    
    var result = new DropShadow();
    if(globalLight == null) globalLight = 120;
    
    if(dropShadow.getBoolean(stringIDToTypeID("enabled")))
    {
        
        if(dropShadow.hasKey(charIDToTypeID("Clr "))) {
            result.color = Color.fromDescriptor(dropShadow.getObjectValue(charIDToTypeID("Clr ")));
        }

        if(dropShadow.hasKey(charIDToTypeID("Dstn"))) {
            result.distance = dropShadow.getDouble(charIDToTypeID("Dstn"));
        }

        if(dropShadow.hasKey(charIDToTypeID("blur"))) {
            result.size = dropShadow.getDouble(charIDToTypeID("blur"));
        }            

        if(dropShadow.hasKey(charIDToTypeID("Opct"))) {
            result.opacity = dropShadow.getDouble(charIDToTypeID("Opct"));
        }            

        if(dropShadow.getBoolean(charIDToTypeID("uglg"))) {
            result.angle = globalLight;
        } else {
            result.angle = dropShadow.getDouble(charIDToTypeID("lagl"));
        }
                       
        return result;
        
    }

    return null;
    
};

/********************************
 * 描边样式类
 * @constructor
 ********************************/
Stroke = function() {
    this.size = 0;
    this.color = null;
    this.opacity = 100;
};

Stroke.fromDescriptor = function(descriptor)
{
    var result = new Stroke();
    if (descriptor.hasKey(charIDToTypeID('enab')) && descriptor.getBoolean(charIDToTypeID('enab')) ) {

        if (descriptor.hasKey(charIDToTypeID('Sz  '))) {
            result.size = descriptor.getDouble(charIDToTypeID('Sz  '));
        }

        if (descriptor.hasKey(charIDToTypeID('Opct'))) {
            result.opacity = descriptor.getDouble(charIDToTypeID('Opct'));
        }

        if (descriptor.hasKey(charIDToTypeID('Clr '))) {
            result.color = Color.fromDescriptor(descriptor.getObjectValue(charIDToTypeID('Clr ')));
        }

        return result;
    }

    return null;
};

Stroke.prototype.toString = function()
{
    return this.size + ' ' + this.opacity + '% ' + this.color.toString();
};

/********************************
 * 颜色取样器对象
 * @constructor
 ********************************/
ColorSampler = function() {
    this.color = null;
    this.position = null;
};


/********************************
 * 操作历史对象
 ********************************/
History = {};

History.suspend = function(historyString, javaScriptString)
{
    app.activeDocument.suspendHistory(historyString,  javaScriptString);
};

History.undo = function()
{
    executeAction( charIDToTypeID( "undo" ), undefined, DialogModes.NO );
};

History.back = function(step)
{
    step = (step == undefined)? 1 : step;
    var doc = activeDocument;
    doc.activeHistoryState = doc.historyStates[doc.historyStates.length - step];
}

