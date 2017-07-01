
//this is just for static testing
var currentSearch = {
  id : "",
  lat : 39.764339,
  long : -104.85511,
  zip : "80215",
  venueType : "restaurant",
  state : "Colorado",
  city : "Denver"
}

var zillowRegionChildren = "http://www.zillow.com/webservice/GetRegionChildren.htm?";
var zillowEstimate = "http://www.zillow.com/webservice/GetSearchResults.htm";
var zillowKey = "X1-ZWz195aafxhlor_4vl2o";
var googlePlacesKey = "AIzaSyBQCnwzPy31r3t741_zCN9LCy81753WDzw";
var googleKey = "AIzaSyAWE8SJk1mkR4Jlubw5Q5DoVepI2eIdh1I";
var initialLoad = true;
//search radius of 3 miles, 1609.344 is meters per mile
var searchRadius = (1609.344 * 3).toString();
var currentMap = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${currentSearch.lat},${currentSearch.long}&radius=${searchRadius}&type=${currentSearch.venueType}&key=${googlePlacesKey}`;
var searchInput = {};
var corsWorkaround = "https://cors-anywhere.herokuapp.com/";

//take in user input for the searches to happen
  function updateCurrentSearch(data) {
    searchInput = {};
    searchInput = {
      id : "",
      zip : data.zip,
      state : data.state,
      city : data.city,
      type : data.type,
      venueType : "restaurant"
    }
    console.log(searchInput);
    zillowApi(apiLinkBuild("zillowRegion", searchInput));
  };


// Changes XML to JSON -- Needed for all Zillow Searches
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

function apiLinkBuild(apiType) {
  //update to switch for clarity?
  //build url for api depending on user input
  if (apiType == "zillowRegion") {
    var tempUrl = `${zillowRegionChildren}zws-id=${zillowKey}&state=${searchInput.state}&city=${searchInput.city}&childtype=neighborhood`;
    return tempUrl;
  } else if (apiType == "googlePlaces") {
    var tempUrl;
  }

}

//Call api for zillow
function zillowApi(url) {
  var url = `${corsWorkaround}${url}`;

  var apiUrl = url;
  $.ajax({
    method: "GET",
    url: apiUrl,
    headers: {
      "Accept": "application/json"
    }
  })
    .done(function(data) {
      dataJSON = xmlToJson(data);
      console.log("Zillow Api Return information", dataJSON);
      var temp = dataJSON["RegionChildren:regionchildren"].response.region;
      searchInput.id = temp.id["#text"];
      searchInput.lat = parseFloat(temp.latitude["#text"]);
      searchInput.long = parseFloat(temp.longitude["#text"]);
      console.log(searchInput);
      initMap()
    })
    .fail(function(data) {
      console.log("ERROR: ", data);
    })
};


//Callback function from HTML to start the google map
function initMap() {
  // console.log(currentSearch);
  if (initialLoad) {
    var geoLocation = {lat: 39.764339, lng: -104.85511};
  } else {
    var geoLocation = {lat: searchInput.lat, lng: searchInput.long};
  }
    map = new google.maps.Map(document.getElementById('map'), {
      center: geoLocation,
      zoom: 13
    });
    if (initialLoad) {
      initialLoad = false;
    } else {
      newPlaces();
    }

}

//New api call to google for the map information
  function newPlaces() {
    if (searchInput.lat) {
      currentMap = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${searchInput.lat},${searchInput.long}&radius=${searchRadius}&type=${searchInput.venueType}&key=${googlePlacesKey}`;
    } else {
      currentMap = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${currentSearch.lat},${currentSearch.long}&radius=${searchRadius}&type=${currentSearch.venueType}&key=${googlePlacesKey}`;
    }

    currentMap = `${corsWorkaround}${currentMap}`;
    $.ajax({
      url: currentMap,
       type: 'GET',
       crossDomain: true,
       success: function(response) {
         console.log(response);
         var data = response.results;
         console.log('Google Places Response Information', response.results);
         updateMap(data);
       },
    })
  };


//New call to update maps with search parameters passed by user
function updateMap(data) {
  console.log(data);
  $.each(data, function(index, value) {
    var temp = data[index].geometry.location;
    var loc = {
      lat: temp.lat,
      lng: temp.lng
    };
    var temp = data[index];
    var markerData = {
      name : temp.name,
      id : temp.id,
      pricing : temp.price_level,
      rating : temp.rating,
      type : temp.types,
      address : temp.vicinity
    }
    var marker = new google.maps.Marker({
      position: loc,
      map: map,
      customInfo: markerData
    });
    marker.addListener('click', function() {
    infowindow.open(map, marker);
    });
    var contentString =  "<h4>" + markerData.name + "</h4>" + "<p>" + markerData.pricing + "</p>" + "<p>" + markerData.rating + "</p>"
    + "<p>" + markerData.type + "</p>" + "<p>" + markerData.pricing + "</p>";
    var infowindow = new google.maps.InfoWindow({
      content: contentString
    });
    marker.addListener('mouseover', function() {
    infowindow.open(map, marker);
    });
    marker.addListener('mouseout', function() {
    infowindow.close();
    });
  });
    var contentString = "quotes";
    var infowindow = new google.maps.InfoWindow({
      content: contentString
    });
  }

  function placesData() {
    var request = {
      placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4"
    };
    service = new google.maps.places.PlacesService(map);
    service.getDetails(request, function(place, status) {
        console.log(place, status);
    });
  }

  $(function () {
      $('[data-toggle="tooltip"]').tooltip()
    })

  $(document).ready(function() {
    var map;

    //click handling for search button
    $(".submitChild").click("on", function(event) {
      console.log('button was clicked', $(this));
      console.log('the button type is', $(this).text());

      var submitData = {
        city: $('#inputCity').val(),
        state: $('#inputState').val(),
        zip: $('#inputZip').val(),
        type: $(this).text()
      }

      if (submitData.state) {
        //  The user has input their state
        updateCurrentSearch(submitData);
      } else {
        //  The user has not added a state, and they need to
        $('.tooltipHolder').tooltip("show");
        $('#inputState').css({"border":"1px solid red"});
        console.log('add your state');
      }

      // var stateInput = $('#inputState').val();
      // console.log('state input', stateInput);
      // if (!stateInput) {
      //   console.log('You need to input a state');
      // }


      // event.preventDefault();
      //userinputvalidation
      //updateCurrentSearch(submitData);
      // newPlaces();


      // zillowApi($("#userSelection").val())
    });
    //enter key handling for search button
    $("#keys").on("keyup", function(event) {
      event.preventDefault();
      console.log(this);
      // updateCurrentSearch(this);
      console.log(event.keyCode);
    });
    newPlaces();

  })
