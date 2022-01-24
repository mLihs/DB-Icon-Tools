import fs from '@skpm/fs'
import dialog from '@skpm/dialog'
import UI from 'sketch/ui'
import { optimize } from 'svgo'

export function showAbout() {
  // Plugin was run from the menu, so let's open the about window
  const response = dialog.showMessageBox({
    message: "About SVGO Compressor",
    detail: "This Plugin uses SVGO to compress SVG assets exported from Sketch.\n\nIt works automatically whenever you export to SVG, so you don’t need to do anything special. Just work on your design as always, and enjoy smaller & cleaner SVG files."
  })
}

export function compress(context) {
  const exports = context.actionContext.exports
  let filesToCompress = 0
  exports.forEach(currentExport => {
    if (currentExport.request.format() == 'svg') {
      filesToCompress++
      let currentFile
      // This was broken momentarily between Sketch 76 and 77
      // so we need to use a workaround
      currentFile = currentExport.path
      if (currentExport.path.path !== undefined) {
        currentFile = currentExport.path.path()
      }
      const svgString = fs.readFileSync(currentFile, 'utf8')

      //EF.fn(currentExport);

      // Load external SVGO config, if it exists
      const homeDir = NSHomeDirectory()
      const configFile = homeDir + '/Library/Application\ Support/com.bohemiancoding.sketch3/Plugins/svgo.config.js'
      let externalConfig = {}
      if (fs.existsSync(configFile)) {
        // Do not explode if the file is not valid JS
        try {
          externalConfig = eval(fs.readFileSync(configFile, 'utf8'))
        } catch (error) {
          console.log("Error: " + error.message)
        }
      }

    
      
      var rawPluginPath = context.scriptPath.replace(/( )/g, '\ ');    
      var pluginPhat = rawPluginPath.split("/")
      var settingsPhat = pluginPhat.slice(0, pluginPhat.length-2).join("/") + "/Resources/tokens.js";
      var pluginSetting = {};

      if (fs.existsSync(settingsPhat)) {
        // Do not explode if the file is not valid JS
        try {
          pluginSetting = JSON.parse(fs.readFileSync(settingsPhat))

        } catch (error) {
          console.log("Settingspfad kaputt: " + settingsPhat)
        }
      }

     // pluginSetting.paht = currentFile

     var fileID = currentFile.match(/[ \w-]+?(?=\.)/)[0]
     
     var cleanMapObj = {"_":"-", "ic-db-il_":"", "ic-db_":""}

     var cleanRegEx = new RegExp(Object.keys(cleanMapObj).join("|"),"gi");
     fileID = fileID.replace(cleanRegEx,matched =>{
      return cleanMapObj[matched];
     });


      var atomaticCustomPlugin = require('./extraexport.js');

      atomaticCustomPlugin.params.name = fileID

    /*  Object.assign(atomaticCustomPlugin.params, pluginSetting) */



      

      const defaultConfig = {
        path: currentFile,
        multipass: true,
        js2svg: {
          indent: 2, // string with spaces or number of spaces. 4 by default
          pretty: true, // boolean, false by default
        },
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                inlineStyles: true,
                convertStyleToAttrs: true,
                cleanupListOfValues: true,
                removeViewBox: false,
                cleanupEnableBackground: false,
                removeHiddenElems: false,
                convertShapeToPath: false,
                moveElemsAttrsToGroup: false,
                moveGroupAttrsToElems: false,
                convertPathData: false,
                sortAttrs: true,
                cleanupIDs: false,
                convertPathData: {"params": { "floatPrecision": 3, "transformPrecision": 5, "noSpaceAfterFlags": false}}
              }
            }
          },
          atomaticCustomPlugin
        ],
      }

    

      const config = {...defaultConfig, ...externalConfig }
      const result = optimize(svgString, config)

      

      fs.writeFileSync(currentFile, result.data, 'utf8')
    }
  })
  UI.message(`SVGO Compressor: ${filesToCompress} file${filesToCompress == 1 ? '' : 's'} compresseds`)
}