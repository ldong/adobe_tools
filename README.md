# How to pack and sign an adobe photoshop extension

1. After development, sign via

   ```
	ZXPSignCmd -selfSignedCert <countryCode> <stateOrProvince> <organization> <commonName> <password> <outputPath.p12>
	./ZXPSignCmd -selfSignedCert US California Hello "John Doe" myPassword myCertificate.p12
    ./ZXPSignCmd -sign ../cep/packer_unsigned cutterman myCertificate.p12 myPassword
    ```

2. rename `cutterman.zxp` to `cutterman.zip`
3. unzip cutterman.zip
4. create directory for unzipped files
5. All extentions are inside of `~/Library/Application Support/Adobe/CEP` 

# Reference

1. [CEP 6 HTML Extension Cookbook for CC 2015 · Adobe-CEP/CEP-Resources Wiki](https://github.com/Adobe-CEP/CEP-Resources/wiki/CEP-6-HTML-Extension-Cookbook-for-CC-2015)
2. [A Short Guide to HTML5 Extensions | Adobe Developer Connection](http://www.adobe.com/devnet/creativesuite/articles/a-short-guide-to-HTML5-extensions.html)
3. [Download Extension Builder 3 - Adobe Labs](http://labs.adobe.com/downloads/extensionbuilder3.html)
4. [Adobe CEP Samples](https://github.com/Adobe-CEP/Samples)

