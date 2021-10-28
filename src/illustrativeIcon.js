import sketch from 'sketch'

import * as GF from './globalfunctions.js'

const defaultStyleName = "1. Default"
const subfolderName = "export"

const iconPrefix = "ic-db"
const csvFileName = "icon-migration"

var fileType = 'csv';

var document = sketch.getSelectedDocument()
var layerStyles = document.sharedLayerStyles;
var UI = require('sketch/ui')


function setSlice(object, exportname){
  var newSlice = sketch.Slice
  object = object;
  let mySquare = new newSlice({
    name: exportname,
    parent: object, 
    frame: { x: 0, y:0, width: object.frame.width, height: object.frame.height },
    index: 0,
    exportFormats:[{"fileFormat":"svg"}]
  })
}


function selectPage(theDocument){
  var pageNames = new Array();
  var curentpage = null;

  theDocument.pages.forEach(page => {
    pageNames.push(page.name);
  })

  UI.getInputFromUser(
  "What's your Icon Page?",
    {
      type: UI.INPUT_TYPE.selection,
      possibleValues: pageNames,
    },
    (err, value) => {
      if (err) {
        // most likely the user canceled the input
        return
      }
      curentpage = value;
    }
  )

  return curentpage;
}




export var exportBrandsCape = function() {

  var selectedPage = selectPage(document)
  var docName = context.document.fileURL().lastPathComponent().split(".sketch")[0];
  var CSVOutPut = "Original filename;resource_type;status;access;Title;Short Description;Categories;Free Tags;Realm\n";

  function doSomething(object) {

    if(object.type == "SymbolMaster"){
    	
      var objName = object.name;
      var objTags = objName.split("/").join(",")
      var objNiceName = objName.split("/").pop();

      var cleanName = object.name
      cleanName = cleanName.toLowerCase().replace(/ /gi,"-").split("/");
      var objCleanNiceName = cleanName[cleanName.length -1];

      var absoluteName = iconPrefix+"_"+cleanName.join("_");
      
      CSVOutPut+= absoluteName+".svg;Icon;0;0;"+objNiceName+";;Illustrative Icon;"+objTags+";Icon Library\n";

    }

    if (object.layers && object.layers.length) {
      object.layers.forEach(doSomething);
    }
  }

  if (selectedPage){
    document.getLayersNamed(selectedPage).forEach(doSomething)

    GF.saveToFile({
      filenamePrefix: docName+"IconLib.csv",
      content: NSString.stringWithString(CSVOutPut)
    });
  }
}















export var setSliceIllustrativeIcon = function() {

  var defaultStyleID = null;
  var selectedPage = selectPage(document)

  function getDefaultLayerStyle(){
    var defaultStyle = layerStyles.find(x => x.name == defaultStyleName);
    defaultStyleID = defaultStyle;
  }


  function doCleanup (object) {
    
    if(object.type == "Slice" && object.parent.type == "SymbolMaster"){
      object.remove();
    }

    if (object.layers && object.layers.length) {
      object.layers.forEach(doCleanup)
    }  

  }


  function doSomething(object) {

    if(object.type == "SymbolMaster"){
      var objName = object.name;
      var objNiceName = objName.split("/").pop();

      var cleanName = object.name
      cleanName = cleanName.toLowerCase().replace(/ /gi,"-").split("/");
      var objCleanNiceName = cleanName[cleanName.length -1];

      var objFolderName = cleanName.slice();
      objFolderName.pop()


      var absoluteName = iconPrefix+"_"+cleanName.join("_");;
      var reducedAbsoluteName = objFolderName.join("/")+"/"+iconPrefix+"_"+objCleanNiceName;
     
   
      var exportname = ["export/absolute_folder/"+absoluteName,
                        "export/absolute_filename/"+reducedAbsoluteName]
      exportname.forEach(phat => setSlice(object, phat))


    } /*else if (object.type == "Shape"){
        object.name = "🎨 Color"
        object.style.syncWithSharedStyle(defaultStyleID);
    }*/

    if (object.layers && object.layers.length) {
      object.layers.forEach(doSomething);
    }
  }

  if (selectedPage){
    document.getLayersNamed(selectedPage).forEach(doCleanup);
    document.getLayersNamed(selectedPage).forEach(doSomething);
  }
}