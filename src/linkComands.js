//import sketch from 'sketch'

import * as GF from './globalfunctions.js'

var sketch = require('sketch/dom');
var UI = require('sketch/ui')
var document = sketch.getSelectedDocument()

function centerToLayer(obj){
  //document.centerOnLayer(obj)
  MSDocument.currentDocument().eventHandlerManager().currentHandler().zoomToSelection()
}


function unselectAllLayer(){
  let selectedLayersObject = document.selectedLayers
  let selectedLayersArray = selectedLayersObject.layers
  selectedLayersArray.forEach(function(layer){
    layer.selected = false;
  })
}


function focusOnLayer (id){
  var layer = document.getLayerWithID(id)
  if (layer){
    unselectAllLayer();
    layer.getParentPage().selected = true;
    layer.selected = true;
    centerToLayer(layer)
  }
}


export var setSelection = function (context) {
  let query = context.actionContext.query
  var theID = query.msg
  var theDoc = query.doc
  var docIsOpen = GF.setFocusOnDocuments(theDoc)
  if (docIsOpen){
    focusOnLayer (theID)
  } else {
    UI.alert('Document not Open', 'Please open '+ theDoc +' first.')
  }
}
