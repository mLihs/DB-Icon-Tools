
'use strict';

exports.name = 'myPlugin';
exports.type = 'perItem' // 'perItem', 'perItemReverse' or 'full'
exports.active = true;

exports.params = {
  color: {},
  useClass: true,
  tokenformat: "kebab"
};

const charSeperator = '-';


exports.asignParams = (extParams, params) => {
	Object.assign(params, extParams);
}


function cleanName (str){
	str = str.match(/[^\/]+$/g)[0];
	str = str.replace(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g, "")
	str = str.replace(/(^[-])/g, "")
	str = str.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/g, charSeperator).toLowerCase()
	return str
}


function buildToken(string, type){
	if (type == "camel"){
		return string.charAt(0).toUpperCase() + string.slice(1);
	} else if ("kebab"){
		return "-"+string;
	} else if ("snake"){
		return "_"+string;
	}
}


function getToken(params, value){

	value = value.toLowerCase();

	var tokenFound = findToken(params.color, value, params.tokenformat);
	if (tokenFound) {
		var token = tokenFound
		var addStyle = 'fill:'+ value + '; fill: var(--'+token+', '+ value +');';
		return addStyle;
	} else {
		return null;
	}
}

function findToken(obj, value, tokenformat, parentToken) {
	
    for(var token in obj) {
        if(obj[token] instanceof Object) {
        	
        	var newToken = token
        	if (parentToken){
        		newToken = parentToken + buildToken(token, tokenformat) 
        	}
            var recusiveToken = findToken(obj[token], value, tokenformat, newToken);
            if (recusiveToken) {
            	return recusiveToken;
            }
        } else {
            if (obj[token].toLowerCase() == value.toLowerCase()){
            	return parentToken;
            }
        };
    }
};




exports.fn = (item, params) => {

	

	if (item.name == "svg"){
		item.attributes.id = params.name
	}

	if(item.isElem() && item.hasAttr('id') && item.name != "svg"){

		let layerName = "";

		item.eachAttr( attr => {
			
			if(attr.name == "id"){
				// Remove Emoji
				layerName = cleanName (attr.value);
				attr.value = layerName
			}



			if(attr.name == "fill"){
				// Add Token and Styles
				var addStyle = getToken(params, attr.value);

				if (addStyle){
					item.attributes.style = addStyle
				}

			}
		})
		if (layerName && params.useClass){
			item.attributes.class = layerName;
			item.removeAttr('id');
		}
	}
}