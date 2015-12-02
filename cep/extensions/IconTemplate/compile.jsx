#target estoolkit#dbg
var fileIn = File("/Users/xiaoqiang/Git/app/IconTemplate/jsx/framework/canvas.jsxbin");
fileIn.open("r");
var s = fileIn.read();
fileIn.close();
var t = app.deCompile(s);
var fileOut = File( fileIn.absoluteURI + "bin.de" ) ;
fileOut.open("w");
fileOut.write(t);
