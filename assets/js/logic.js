var currentSearch = {
  id : "",
  lat : 39.764339,
  long : -104.85511,
  venueType : "restaurant"
}

var zillowApi = "http://www.zillow.com/webservice/GetRegionChildren.htm";
var zillowKey = "X1-ZWz195aafxhlor_4vl2o";
var googlePlacesKey = "AIzaSyBQCnwzPy31r3t741_zCN9LCy81753WDzw";
var googleKey = "AIzaSyAWE8SJk1mkR4Jlubw5Q5DoVepI2eIdh1I";
var currentMap = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${currentSearch.lat},${currentSearch.long}&radius=1609.344&type=${currentSearch.venueType}&key=${googlePlacesKey}`;

// Changes XML to JSON
function xmlToJson(xml) {

	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
		obj["@attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
	}

	// do children
	if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof(obj[nodeName]) == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	return obj;
};

function zillowApi() {
  var apiUrl = zillowApi + "?state=colorado&city=denver&zws-id=" + zillowKey;
  $.ajax({
    method: "GET",
    url: apiUrl,
    headers: {
      "Accept": "application/json"
    }
  })
    .done(function(data) {
      console.log(data);
      dataJSON = xmlToJson(data);
      console.log(dataJSON);
      var temp = dataJSON["RegionChildren:regionchildren"].response.region;
      currentSearch.id = temp.id["#text"];
      currentSearch.lat = parseFloat(temp.latitude["#text"]);
      currentSearch.long = parseFloat(temp.longitude["#text"]);
      console.log(currentSearch);
      initMap()
    })
    .fail(function(data) {
      console.log("ERROR: " + data);
    })
}

function initMap() {
  var geoLocation = {lat: currentSearch.lat, lng: currentSearch.long};
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: currentSearch.lat, lng: currentSearch.long},
      zoom: 13
    });
    $.each(response.results, function(index, value) {

    })
    var marker = new google.maps.Marker({
      position: geoLocation,
      map: map
    })
  }

  function newPlaces() {
    currentMap = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${currentSearch.lat},${currentSearch.long}&radius=1609.344&type=${currentSearch.venueType}&key=${googlePlacesKey}`;
    $.ajax({
      url: currentMap,
       type: 'GET',
       crossDomain: true,
       success: function(response) {
         var data = response.results;
         console.log(currentMap);
         console.log(currentSearch.lat, currentSearch.long);
         console.log(' What is the data???', response);
         console.log(' WHAT IS OUR RESPONSE DATA', response.results);
       },
    })
  };


  $(document).ready(function() {
    var map;

    //click handling for search button
    $("#click").click("on", function(event) {
      newPlaces(event);
      event.preventDefault();
      zillowApi($("#userSelection").val())
      // runAPI function with input parameters
    });
    //enter key handling for search button
    $("#keys").on("keyup", function(event) {
      event.preventDefault();
      console.log(event.keyCode);
    });
  })
