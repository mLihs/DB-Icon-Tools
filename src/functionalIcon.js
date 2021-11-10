import sketch from 'sketch'
// documentation: https://developer.sketchapp.com/reference/api/


import * as GF from './globalfunctions.js'
import * as HTML from './htmlframe.js'



const defaultStyleName = "1. Default"
const subfolderName = "export"


const iconPrefix = "ic-db"
const csvFileName = "icon-migration"
var fileType = 'csv';

var document = sketch.getSelectedDocument()
var layerStyles = document.sharedLayerStyles;
var UI = require('sketch/ui')

var Shape = require('sketch/dom').Shape
var Style = require('sketch/dom').Style


const errorLayerName = "Point-Error-Marker_Plugin";





function saveToFile({ filenamePrefix, content: string }) {
  // Configuring save panel
  var savePanel = NSSavePanel.savePanel();
  savePanel.allowedFileTypes = [fileType];
  savePanel.nameFieldStringValue = `${filenamePrefix}`;

  // Launching alert
  var result = savePanel.runModal();
  if (result == NSFileHandlingPanelOKButton) {
    var path = savePanel.URL().path();
    var success = string.writeToFile_atomically_encoding_error(path, true, NSUTF8StringEncoding, null);
    var alert;

    if (success) {
     /* alert = createAlert({
        text: 'The ' + FILETYPE.toUpperCase() + '-file is successfully saved to:\n `' + path + '`',
        buttons: ['OK'],
      });*/

      //alert("Shared Color Palette JSON Exported!", "Styls Exprtet");
    } else {
     /* alert = createAlert({
        text: `The file could not be saved.`,
        buttons: ['OK'],
      });*/
    }
    //alert("Shared Color Palette JSON Exported!", "Styls Not Exprtet");
    //alert.runModal();
  }
}








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


function checkShapePaht(object){

  const collisionPrecision = 0.25;
  var objCollisionPrecision = collisionPrecision;
  var objFrame = object.frame;
  var returnError = false;

  if (object.points){

    object.points.forEach(function(obj, i){


        if (i > 0) {

          var pointA = object.points[i].point;
          var pointB = object.points[i-1].point
          var  objCollusion = GF.checkCollusion(pointA, pointB, objFrame, objCollisionPrecision)

          if (objCollusion){

              GF.drawErrorRegion(pointA, pointB, objFrame, object, errorLayerName);

              returnError = true;

          } else {}


        }
    })
  }

  return returnError;

}




export var checkHiddenPoints = function(context){

  var selectedPage = selectPage(document)

  
  var checkOutput = "";
  var htmlHeader = HTML.header;
  var htmlFooter = HTML.footer;

  var docName = GF.documentName(context)
  var docNameArray = docName.split("/");
  docName = docNameArray[docNameArray.length - 1];

  let htmlDocHeader = "<h1>Icon Design Consistency Check</h1><p class='subline'>"+docName+"</p>"
  let htmlTableHeader = `<table>
                        <thead>
                          <tr>
                            <th width="200px">Icon</th>
                            <th>Vector Quality</th>
                            <th>Vector Closed</th>
                          </tr>
                        </thead>`

  function checkSingeleShape (object) {
    var objName = object.name;
    var objNameArray = objName.split("/")
    var objLastName = objNameArray[objNameArray.length -1];
 
    var objArtboard = object.getParentArtboard();
    var objArtboardName = "No Artboard"

    if (objArtboard){
      objArtboardName = objArtboard.name;
    }

    var link = GF.createLink(object.id)
    objName = "<td><span class='block'>"+GF.createNiceHTMLLink(objLastName, link)+"</span><span class='block smallText'>"+objArtboardName+"</span></td>";
    


    // Check Point Collision
    var outPutVectorError = "<td>✅</td>"
    var checkResult = checkShapePaht(object);

    if(checkResult){
      outPutVectorError = "<td class='error'>Points to Close</td>"
    }

    var checkCloseResult = object.closed ? 1:0

    var outPutClosed = "<td>✅</td>"
    if (checkCloseResult == 0){
      outPutClosed = "<td class='error'>Shape is Open</td>"
    }


    var errorExist = false;
    if (checkResult || !checkCloseResult) {
      errorExist = true;
    }

    return {"error": errorExist, "export": (objName + outPutVectorError + outPutClosed)};

  }



  

  function deleteAllErrorPoints(object) {
    
    if (object.name == "Point-Error-Marker_Plugin"){
      object.remove();
    }

    if (object.layers && object.layers.length) {
      object.layers.forEach(deleteAllErrorPoints);
    }
  }



  function runThruPoints(object) {

    if (object.type == "Shape"){

      var objName = object.name;
      var objNameArray = objName.split("/")
      var objLastName = objNameArray[objNameArray.length -1];
 
      var objArtboard = object.getParentArtboard();
      var objArtboardName = objLastName + "  !No Artboard"
      var artBoardError = true;

      if (objArtboard){
        artBoardError = false;
        var artboardArray = objArtboard.name.split("/");
        objArtboardName = artboardArray[artboardArray.length-1];
      }
      
      var detailTable = "";
      var detailError = false;

      detailTable+="<tbody class='table-to-hide'>"
      object.layers.forEach(shape => {
        
        var checkDetailResult = checkSingeleShape(shape)

        if (checkDetailResult.error){
          detailError = true;
        }

        detailTable+="<tr>";
        detailTable+=checkDetailResult.export;
        detailTable+="</tr>";
        
      })
      detailTable+="</tbody>"


      var mainErrorClass = "<tr>"
      if (detailError){
        mainErrorClass = "<tr class='error'>"
      }

      if (artBoardError){
        mainErrorClass = "<tr class='warning'>"
      }

      

      checkOutput+="<tbody>"
      checkOutput+=mainErrorClass;
      checkOutput+="<td colspan='2'><label class='clicklabel'><input type='radio' name='accountin' class='hideandshow' data-toggle='toggle' onclick='hideAndShowTable(this)'><span>"+objArtboardName +"</span></label><td/>"
      checkOutput+="</tr>";
      checkOutput+="</tbody>"

      checkOutput+= detailTable;



    }  else if (object.type == "ShapePath" && object.parent.type != "Shape"){

      checkOutput+="<tbody>"
      checkOutput+="<tr>";
      checkOutput+=checkSingeleShape(object).export;
      checkOutput+="</tr>";
      checkOutput+="</tbody>"

    }



    if (object.layers && object.layers.length) {
      object.layers.forEach(runThruPoints);
    }

  }

  //

  document.pages.forEach(deleteAllErrorPoints)
  document.getLayersNamed(selectedPage).forEach(runThruPoints)

  //document.pages.forEach(runThruPoints)

  var exportToFile = htmlHeader + htmlDocHeader + htmlTableHeader;
  exportToFile +=checkOutput;
  exportToFile += htmlFooter;


  GF.saveToFile({
    filenamePrefix: docName+"-Symbol-Structure-Test.html",
    content: NSString.stringWithString(exportToFile)
  });

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
      cleanName.shift();

      var width = object.frame.width;
      var absoluteName = iconPrefix+"_"+cleanName.join("_")+"_"+width;
      
      CSVOutPut+= absoluteName+".svg;Icon;0;0;"+objNiceName+" "+width+"dp;;Functionale Icon;"+objTags+";Icon Library\n";

    }

    if (object.layers && object.layers.length) {
      object.layers.forEach(doSomething);
    }
  }

  if (selectedPage){
    document.getLayersNamed(selectedPage).forEach(doSomething)

    saveToFile({
      filenamePrefix: docName+"IconLib.csv",
      content: NSString.stringWithString(CSVOutPut)
    });
  }
}



export var setSliceFunctionalIcon = function() {

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
      cleanName.shift();

      var objFolderName = cleanName.slice();
      objFolderName.pop()

      var width = object.frame.width;

      var absoluteName = iconPrefix+"_"+cleanName.join("_")+"_"+width;
      var reducedAbsoluteName = objFolderName.join("/")+"/"+iconPrefix+"_"+objCleanNiceName+"_"+width
     
   
      var exportname = ["export/absolute_folder/"+width+"_dp/"+absoluteName,
                        "export/absolute_filename/"+reducedAbsoluteName]
      exportname.forEach(phat => setSlice(object, phat))


    } else if (object.type == "Shape"){
        object.name = "🎨 Color"
        object.style.syncWithSharedStyle(defaultStyleID);
    }

    if (object.layers && object.layers.length) {
      object.layers.forEach(doSomething);
    }
  }

  if (selectedPage){
    getDefaultLayerStyle();
    document.getLayersNamed(selectedPage).forEach(doCleanup);
    document.getLayersNamed(selectedPage).forEach(doSomething);
  }
}
