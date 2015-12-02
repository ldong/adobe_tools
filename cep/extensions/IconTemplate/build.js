/* vim: set et sw=4 ts=4 sts=4 fdm=marker ff=unix fenc=utf8 nobomb: */

/**
 * filename.js
 *
 * @author xiaoqiang
 * @mail   qiang0902@126.com
 * @date
 */

var fs = require('fs');
var stat = fs.stat;


var dirs = ['css', 'CSXS', 'js', 'img', 'jsx', 'lib', 'index.html'];

/*
 * 复制目录中的所有文件包括子目录
 * @param{ String } 需要复制的目录
 * @param{ String } 复制到指定的目录
 */

var copyDone = null;

var copy = function( src, dst ){
    // 读取目录中的所有文件/目录
    fs.readdir( src, function( err, paths ){
        if( err ){ console.log(err); return;}
        paths.forEach(function( path ){
            if (!/^\./.test(path) && path != 'build') {
                var _src = src + '/' + path,
                    _dst = dst + '/' + path,
                    readable, writable;

                stat( _src, function( err, st ){
                    if( err ){ console.log(err); return}
                    // 判断是否为文件
                    if( st.isFile() ){
                        readable = fs.createReadStream( _src );// 创建读取流
                        writable = fs.createWriteStream( _dst );// 创建写入流
                        readable.pipe( writable );// 通过管道来传输流
                    } else if( st.isDirectory() ){// 如果是目录则递归调用自身
                        exists( _src, _dst, copy );
                    }
                });
            }
        });

        if (copyDone != null) {
            copyDone();
        }
    });
};

// 在复制目录前需要判断该目录是否存在，不存在需要先创建目录
var exists = function( src, dst, callback ){
    fs.exists( dst, function( exists ){
        // 已存在
        if( exists ){
            callback( src, dst );
        }  else {// 不存在
            fs.mkdir( dst, function(){
                callback( src, dst );
            });
        }
    });
};


copyDone = function() {
    var dir = './jsx/framework';
    fs.exists(dir, function(exists) {
        if (exists) {
            fs.readdir(dir, function(err, item){
                console.log(item);
            });
        }
    });
};

copy('../', './');



