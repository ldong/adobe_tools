/* vim: set et sw=4 ts=4 sts=4 fdm=marker ff=unix fenc=utf8 nobomb: */

/**
 * filename.js
 *
 * @author xiaoqiang
 * @mail   qiang0902@126.com
 * @date
 */

IT = function () {
    this.version = 1.0;
    this.sizes = {
        ios: {
            base: [1024],
            itunes: [512],
            carplay: [120],
            ipad: [152, 76, 144, 72, 100, 50, 80, 40, 58, 29],
            iphone: [180, 120, 114, 57, 120, 80, 87, 58, 29]
        },
        android: {
            base: [512],
            xxxhdpi: [192],
            xxhdpi: [144],
            xhdpi: [96],
            hdpi: [72],
            mdpi: [48],
            ldpi: [36]
        }
    };
    this.err = null;
    this.document = null;
    this.app = null;
};

/**
 * 初始化参数
 */
IT.prototype.init = function()
{
    this.app = new Application();
    this.document = this.app.getActiveDocument();
    this.err = new ErrorMsg();
};


/**
 * 生成模板文件
 * @param root
 * @returns {*}
 */
IT.prototype.generate = function(root, platform, corner)
{
    if (!this.app.hasActiveDocument()) { return this.err.fire('NO_FILE_OPEN');  }
    if (!this.document.isSaved()) { return this.err.fire('FILE_NOT_SAVED'); }

    this.document = this.app.getActiveDocument();

    try {
        var fullName = activeDocument.fullName;
        var docName = activeDocument.name;
        var docSize = this.document.getSize();
        if (docSize.width == docSize.height) {
            var dpi = this.document.getResolution();
            if (parseInt(dpi) == 72) {
                var templateFile = new File(root + platform + '-template.psd');
                if (templateFile.exists) {
                    // 加载模板文件
                    var tempDoc = app.open(templateFile);
                    app.activeDocument = tempDoc;
                    tempDoc.activeLayer = tempDoc.layers[0];
                    // 编辑智能对象
                    var layer = this.document.getSelectedLayers();
                    layer[0].editSmartLayer();
                    // 加载目标文件
                    this.app.loadFileAsSmartObject(fullName);
                    this.document = this.app.getActiveDocument();
                    layer = this.document.getSelectedLayers();
                    layer[0].rasterize();   // 删格化目标图层
                    // 处理图标尺寸不是1024的情况
                    var r = layer[0].getBounds();
                    var max = (platform == 'ios')? 1024 : 512;
                    if (r.width != max) {
                        layer[0].transform(max*100/r.width, max*100/r.height);
                    }

                    if (corner == 1) {
                        this.document.selectLayerByName('RoundedLayer');
                        this.document.toSelection();
                        this.document.inverseSelection();
                        layer[0].hide();

                        this.document.selectFrontLayer();
                        this.document.deleteLayerContent();
                        this.document.deselectSelection();
                    }

                    var tt = this.app.getActiveDocument();
                    tt.saveAndClose();
                    return 'done';
                }
            } else {
                return this.err.fire('DOC_DPI_NOT_MATCH');
            }
        } else {
            return this.err.fire('DOC_SIZE_NOT_MATCH');
        }

    } catch (ex) {
        console_error($.fileName, $.line, ex);
        return ex;
    }
};

IT.prototype.export = function(dir, platform) {
    if (!this.app.hasActiveDocument()) { return this.err.fire('NO_FILE_OPEN');  }
    if (!this.document.isSaved()) { return this.err.fire('FILE_NOT_SAVED'); }

    try {
        var doc = app.activeDocument;
        var filename = doc.name.replace(/\.psd|png/, '');
        if (doc.name == platform + '-template.psd') {
            var layer = doc.layers[0];
            var layer = this.document.getSelectedLayers()[0];
            if (layer.getName() == 'EDIT ICON') {
                layer.editSmartLayer();
                var dd = app.activeDocument;
                this.doExport(platform, dir, filename);
                dd.close(SaveOptions.DONOTSAVECHANGES);
            }
        } else {
            this.doExport(platform, dir, filename);
        }
    } catch (e) {
        console_error($.fileName, $.line, e);
    }
};

IT.prototype.doExport = function(platform, dir, filename) {
    var doc = this.app.getActiveDocument();
    var list = this.sizes[platform];
    for (var m in list) {
        var path = (m == 'base')? dir : dir +'/'+ m;
        var folder = new Folder(path);
        if (!folder.exists) { folder.create(); }
        for (var i=0; i<list[m].length; i++) {
            var s = parseInt(list[m][i]);
            doc.resize(s);
            var prefix = (platform == 'ios')? '-'+s : '';
            this.saveImage(folder.absoluteURI, filename + prefix);
            History.back(2);
        }
    }
};

IT.prototype.saveImage = function(path, filename) {
    try {
        var options = new ExportOptionsSaveForWeb();
        options.format = SaveDocumentType.PNG;
        options.PNG8 = false;
        options.quality = 100;
        var file = new File(path + "/" + filename + ".png");
        activeDocument.exportDocument(file, ExportType.SAVEFORWEB, options);
    } catch (e) {
        console_error($.fileName, $.line, e);
    }
};

