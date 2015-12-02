$._ext_PHXS={
    open : function (path, name) {
            // 保存原生配置
        var originalRulerUnits = app.preferences.rulerUnits;
        var originalTypeUnits = app.preferences.typeUnits;
        app.preferences.rulerUnits = Units.PIXELS;
        app.preferences.typeUnits = TypeUnits.PIXELS;

        try {
            app.displayDialogs = DialogModes.NO;
            var currDoc = null;
            if (app.documents.length > 0) {
                currDoc = app.activeDocument;
            }
            var tmpDoc = app.open(new File(path));			
            if (currDoc != null) {
                var newLayer = tmpDoc.layers[0].duplicate(currDoc);		
                tmpDoc.close(SaveOptions.DONOTSAVECHANGES);
                activeDocument.activeLayer.name = name;
                $._ext_PHXS.resizeLayer();
                $._ext_PHXS.placeLayer();
            } else {
                currDoc = tmpDoc;
                app.activeDocument = currDoc;
                activeDocument.activeLayer.name = name;
                $._ext_PHXS.resizeLayer();
                $._ext_PHXS.resizeCanvas();
            }

            app.preferences.rulerUnits = originalRulerUnits;
            app.preferences.typeUnits = originalTypeUnits;
        } catch (e) {
            console_error($.fileName, $.line, e);
        }
    },
    resizeLayer: function() {
            var layer = activeDocument.activeLayer;
            var w = layer.bounds[2].value - layer.bounds[0].value;
            var h = layer.bounds[3].value - layer.bounds[1].value;
            var ratew = 300/w;
            var rateh = 300/h;
            var rate = (ratew > rateh)? ratew : rateh;
            layer.resize(rate*100, rate*100, AnchorPosition.MIDDLECENTER);
    },
    resizeCanvas: function() {
            var layer = activeDocument.activeLayer;
            var w = layer.bounds[2].value - layer.bounds[0].value;
            var h = layer.bounds[3].value - layer.bounds[1].value;
            activeDocument.resizeCanvas(w + 100, h + 100, AnchorPosition.MIDDLECENTER);
            var deltaX = layer.bounds[0].value - 50;
            var deltaY = layer.bounds[1].value - 50;
            layer.translate(deltaX, deltaY);
    },
    placeLayer: function() {
                    var w = activeDocument.width.value;
                    var h = activeDocument.height.value;
                    var layer = activeDocument.activeLayer;
                    var w1 = layer.bounds[2].value - layer.bounds[0].value;
                    var h1 = layer.bounds[3].value - layer.bounds[1].value;
                    var deltaX = 50 - layer.bounds[0].value;
                    var deltaY = 50 - layer.bounds[1].value;
                    layer.translate(deltaX, deltaY);
                }

};
