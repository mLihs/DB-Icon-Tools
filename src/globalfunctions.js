
import sketch from 'sketch'
var document = sketch.getSelectedDocument()
var layerStyles = document.sharedLayerStyles;
var UI = require('sketch/ui')

var Shape = require('sketch/dom').Shape
var Style = require('sketch/dom').Style


var FILETYPE = 'html';
let LINKINPUT = "sketch://plugin/com.atomatic.icon-quality-tools/"
let LAYERSHOWFUNCTION = "element.show"



export function saveToFile({ filenamePrefix, content: string, fileType }) {
  // Configuring save panel
  var savePanel = NSSavePanel.savePanel();
  savePanel.allowedFileTypes = ["*"];
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


export function getPluginPath (context) {
  let path = context.scriptPath.split('/');
  path.splice(-3, 3);
  return path.join('/');
}


export function documentName(context){

  if (context.document.fileURL() == null) { 
    return "unsaved_Doument";
  } else {
    return context.document.fileURL().path().replace(/\.sketch$/, '')
  }

}


export function setFocusOnDocuments(neededDocument){
  
  var openDocuments = sketch.getDocuments();
  var docExsits = false;
  openDocuments.forEach(x => {
    var name = x.path
    if (name){
      
      var fileName = decodeURIComponent(name)
      fileName = fileName.match(/(?:.+\/)(.+)/)[1];
      fileName = fileName.replace(/\.sketch$/, '');

      if (neededDocument == fileName){
        x.sketchObject.window().makeKeyAndOrderFront(nil)
        docExsits = true;
      }
    }
  })

  return docExsits;

}




export function createLink(uri, doc){
  // encodeURIComponent(URI)

  return LINKINPUT+LAYERSHOWFUNCTION+"?msg="+encodeURIComponent(uri)+"&doc="+encodeURIComponent(doc);

}

export function createNiceHTMLLink( niceName,link){
  return '<a href="'+link+'">'+niceName+'</a>';
}


export function createNiceHTMLName(name){
  var lastName = name.split("/")
  lastName = lastName[lastName.length -1];
  return "<td><span class='block'>"+lastName+"</span><span class='block smallText'>"+name+"</span></td>";
}














export function checkCollusion(pointA, pointB, objFrame, objCollisionPrecision) {

  var objX1 = pointA.x * objFrame.width;
  var objY1 = pointA.y * objFrame.height;

  var objX2 = pointB.x * objFrame.width;
  var objY2 = pointB.y * objFrame.height; 

  if (objX1 < objX2 + objCollisionPrecision &&
      objX1 + objCollisionPrecision > objX2 &&
      objY1 < objY2 + objCollisionPrecision &&
      objCollisionPrecision + objY1 > objY2) {
      return true;
  } else {
      return false;
  }

}



export function drawErrorRegion (pointA, pointB, objFrame, object, name){
  var fillStyle = {
                  "borders":
                    [{
                      color: '#FF00F7CC',
                      fillType: Style.FillType.Color,
                      thickness: 0.5
                    }]
                  }
  var absolutePosX = object.sketchObject.absoluteRect().x() - object.getParentArtboard().sketchObject.absoluteRect().x();
  var absolutePosY = object.sketchObject.absoluteRect().y() - object.getParentArtboard().sketchObject.absoluteRect().y();

  var newShape = sketch.Shape;
  var errorPosX = pointA.x*objFrame.width + absolutePosX;
  var errorPosY = pointA.y*objFrame.height + absolutePosY;
  var errorDimension = 2;

  

  var mySquare = new newShape({
    name: name,
    parent: object.getParentArtboard(), 
    frame: { x:errorPosX -1, y:errorPosY-1, width: errorDimension, height: errorDimension},
    style: fillStyle
  })


  mySquare.layers[0].points.forEach(radius => {
    radius.cornerRadius = errorDimension/2;

  })
}



export function findSysnoyms(){

  fetch("https://api-free.deepl.com/v2/translate?auth_key=e4977bb9-0a12-dc25-714c-278288c82c36%3Afx&text=Hello%20World&target_lang=de", {
    "method": "GET"
  })
  .then(response => {
    console.log(response.text());
  })
  .catch(err => {
    console.error(err);
  });

}


