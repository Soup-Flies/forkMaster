
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


var zillowZestimate = "http://www.zillow.com/webservice/GetZestimate.htm?";
var zillowSearch = "http://www.zillow.com/webservice/GetSearchResults.htm?";
var zillowGetComps = "http://www.zillow.com/webservice/GetDeepComps.htm?";
var zillowKey = "X1-ZWz195aafxhlor_4vl2o";
var googlePlacesKey = "AIzaSyBQCnwzPy31r3t741_zCN9LCy81753WDzw";
var googleKey = "AIzaSyAWE8SJk1mkR4Jlubw5Q5DoVepI2eIdh1I";
var initialLoad = true;
//search radius of 3 miles, 1609.344 is meters per mile
var searchRadius = (1609.344 * 3).toString();
var currentMap = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${currentSearch.lat},${currentSearch.long}&radius=${searchRadius}&type=${currentSearch.venueType}&key=${googlePlacesKey}`;
var searchInput = {};
var corsWorkaround = "https://cors-anywhere.herokuapp.com/";
var map;

function testUserInput() {
  //test what kind and if the user input was valid, then build object for search

  var addyDeets = { "address" : [
      {"zip" : ""},
      {"city" : ""},
      {"state" : ""}]
  };

  if ($("#inputState") == true) {
    this.val().function(initMap(addyDeets));
  } else {
    window.alert("Please enter a city!");
  };

  if ($("#inputZip").val().length() == 5) {
    this.val().function(initMap(addyDeets));
  } else {
    $("#inputZip").html("Please enter a 5 digit zip code");
  };

  if ($("#inputCity") == true) {
    this.val.function(initMap(addyDeets));
  } else if ($("#inputState") == true) {
    $("#inputState").val().function(initMap(addyDeets));
  } else {
    $("#inputZip").val().function(initMap(addyDeets));
  };

  if ($("#inputState") == true) {
    this.val().function(initMap(addyDeets));
  } else if ($("#inputCity") == true) {
    $("#inputCity").val().function(initMap(addyDeets));
  } else {
    $("#inputZip").val().function(initMap(addyDeets));
  };
};

//take in user input for the searches to happen
  function updateCurrentSearch(data) {
    searchInput = {};
    searchInput = {
      address: null,
      id : null,
      zip : $("#inputZip").val(),
      state : $("#inputState").val(),
      city : $("#inputCity").val(),
      type : data.value,
      venueType : "restaurant",
      price : "0-0_price"
    }
    //Make query to zillow.com with city and state from search
    zillowWebScrape();
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

//function to build the url based on user input data
function apiLinkBuild(apiType) {
  //build url for api depending on user input
  if (apiType == "zillowSearch") {
    var tempUrl = `${zillowSearch}zws-id=${zillowKey}&citystatezip=${searchInput.zip}&address=${searchInput.address}`;
    console.log(tempUrl);
    return tempUrl;
  } else if (apiType == "googlePlaces") {
    var tempUrl;
  }
};

//pulls the html from zillows page and interprets the scripts returned due to $.load() .
//The scripts need to be interpretted so that zpid's get put into the html
function zillowWebScrape() {
  let rent;
  if (searchInput.type == "rent") {
    rent = 'for_rent/';
  } else {
    rent = '';
  };
  let listType = "fsba,fsbo,fore,new_lt";
  var tempArray = [];
  // strict search few returns
  // var tempUrl = `${corsWorkaround}http://www.zillow.com/homes/${rent}${searchInput.city}-${searchInput.state}/${listType}/${searchInput.price}/house,condo,apartment_duplex,townhouse_type .zsg-photo-card-overlay-link`;
  var tempUrl = `${corsWorkaround}http://www.zillow.com/homes/${searchInput.city}-${searchInput.state}/ .zsg-photo-card-overlay-link`;

  console.log(tempUrl);
  $(".footer").load(tempUrl, function(data) {
    addressResidential(data);
  });
};

//Call api for zillow
function zillowApi(url) {
  console.log(url);
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
      console.log(data);
      //convert zillow returned xml into json format
      dataJSON = xmlToJson(data);
      console.log(dataJSON);
      //shortcut to maneuver the object more easily
      var temp = dataJSON["RegionChildren:regionchildren"].response.region;
      searchInput.lat = parseFloat(temp.latitude["#text"]);
      searchInput.long = parseFloat(temp.longitude["#text"]);
      console.log(searchInput);
      //update map with new lat and longitude from searchInput object
      initMap(searchInput.lat, searchInput.long)
    })
    .fail(function(data) {
      console.log("ERROR: ", data);
    })
};

function addressResidential(zpidData) {
  //very large log, only uncomment when necessary
  // console.log(zpidData);

  //this is the "Regex" a method in programming to search through strings
  //This string of "Regex" will read the returned information from Zillow website and pull out:
  //Full address, city, state, zipcode, bath, bed, square footage, latitude, and longitude
  var myRe = /(?:streetAddress">)([0-9]+[^<]*)(?:\D*Locality">)([^<]*)(?:\D*Region">)([^<]*)(?:\D*)([0-9]*)(?:\D*)([-0-9.]*)(?:\D*")([-0-9.]*)(?:.+?o">)([^<]*)(?:.+?span>)([^<]*)(?:.+?span>)([^<]*)/g;
  //put results into an array
  var addresses = [];

  //find matches of the regex string within the zpidData
  match = myRe.exec(zpidData);
  //until there are no more matches
  while (match != null) {
    //build the substring matches into an object and push to the array to display on page later
    addresses.push({
      street: match[1].trim(),
      city: match[2].trim(),
      state: match[3].trim(),
      zipcode: match[4].trim(),
      lat: parseFloat(match[5].trim()),
      long: parseFloat(match[6].trim()),
      bed: match[7].trim(),
      bath: match[8].trim(),
      sqft: match[9].trim()
    });
    //re-define match for next match set
    match = myRe.exec(zpidData);
  }
  console.log(addresses);
  appendResidential(addresses);
}

//build and display the returned properties from fetchData
function appendResidential(filteredProperties) {
  console.log(filteredProperties);
  //empty previous results to populate with new results
  $("#individualProps").empty();
  //loop over the properties returned from Comp data to populate into individualProps element
  $.each(filteredProperties, function(index, value) {
    var $div = $("<div class='prop border'>");
    $div.attr("data-json", JSON.stringify(value));
    //store object data into the div element for later use to populate specific details
    var $p = $("<p>");
    $p.html((index + 1 ) + ": " + value.street);
    $p.append(`<br>${value.city}, ${value.state} ${value.zipcode}`);
    $div.append($p);
    $("#individualProps").append($div);
  })
}

//=========================================== DEPRECATED ================================================================================
/*
//interpret returned data from zillowWebScrape to grab zpids - uses regex to parse the returned string
// then runs a recursive function (a function that calls itself until expected result in this case)
function zillowResidential(zpidData) {
  console.log(zpidData);
  var tempArray = [];
  //this is the "Regex" a method in programming to search through strings
  var myRe = /(?: data-zpid=")(\d+)" /g;
  //put results into an array
  var myArray = zpidData.match(myRe);
  //run a loop on returned array to remove excess information from the regex return
  $.each(myArray, function(index, value) {
    //slices excess information
    tempArray.push(value.slice(12, (value.length -2)))
  })

//recursive function mentioned above
//this will call itself until the errorTest statement comes back with a "0" error code
  var fetchData = function(tempArray) {
    console.log("RETURNED ARRAY", tempArray);
    //choose first index from tempArray
    searchInput.id = tempArray[0];
    tempUrl = `${zillowGetComps}zws-id=${zillowKey}&zpid=${searchInput.id}&count=25&rentzestimate=true`;
    console.log(tempUrl);
    //different notation to concatenate strings (ES6 implementation)
    var apiUrl = `${corsWorkaround}${tempUrl}`;
    //standard ajax call
    $.ajax({
      method: "GET",
      url: apiUrl,
      headers: {
        "Accept": "application/json"
      }
    })
    .done(function(data) {
      data = xmlToJson(data);
      //Test for a "0" message code being returned from above ajax call - this means no errors
      var errorTest = data["Comps:comps"].message.code["#text"];
      //if the errorcode is anything but "0" we need to run this function again
      if (errorTest != "0") {
        console.log("ERROR DETECTED: ", errorTest);
        //slice the first entry off of the array
        //which is the bad result
        var slicedArray = tempArray.slice(1);
        //and pass it back into the "fetchData" function - this is the recursive part where a function calls itself from inside itself.
        fetchData(slicedArray);
      } else {
        //if we did not have an error, proceed in appending returned data to our page
        appendResidential(data);
      }
    })
    .fail(function(data) {
      //failure on making the actual call - this is a failure in communication with the server in this case
      console.log("ERROR: ", data);
    })
  }
  //initial call of the fetchData function. All other calls are inside of the scope of the function
  fetchData(tempArray);
}



//build and display the returned properties from fetchData
function appendResidential(filteredProperties) {
  console.log(filteredProperties);
  //make a shortcut inside the filteredProperties object to save on typing out the full path
  var property = filteredProperties["Comps:comps"].response.properties.comparables.comp;
  console.log(property);
  //empty previous results to populate with new results
  $("#individualProps").empty();
  //loop over the properties returned from Comp data to populate into individualProps element
  $.each(property, function(index, value) {
    var $div = $("<div class='prop border'>");
    //store object data into the div element for later use to populate specific details
    $div.attr("json-data", JSON.stringify(value));
    var $p = $("<p>");
    $p.html((index + 1 ) +": " + value.address.street["#text"]);
    $p.append(`<br>${value.address.city["#text"]}, ${value.address.state["#text"]} ${value.address.zipcode["#text"]}`);
    $div.append($p);
    $("#individualProps").append($div);
  })

}
*/
//=========================================== END DEPRECATED ================================================================================

//Callback function from HTML to start the google map
function initMap(lati, long) {
  if (initialLoad) {
    //sets a default location for map to run on the first load of the page
    var geoLocation = {lat: 39.764339, lng: -104.85511};
  } else {
    //if the user has searched, we will set the lat and long to the users search
    var geoLocation = {lat: lati, lng: long};
  }
  //googles method of updating the map to selected geoLocation
    map = new google.maps.Map(document.getElementById('map'), {
      center: geoLocation,
      zoom: 15
    });
    //if this is the first time initMap is run since the page has loaded
    if (initialLoad) {
      //update the boolean to false so that next time initMap is run, geoLocation will be set to users search parameters
      initialLoad = false;
    } else {
      //if the user has searched then update the google places information
      newPlaces();
    }
}

//New api call to google for the map information
  function newPlaces() {
    var baseUrl = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=";
    if (searchInput.lat) {
      currentMap = `${baseUrl}${searchInput.lat},${searchInput.long}&radius=${searchRadius}&type=${searchInput.venueType}&key=${googlePlacesKey}`;
    } else {
      currentMap = `${baseUrl}${currentSearch.lat},${currentSearch.long}&radius=${searchRadius}&type=${currentSearch.venueType}&key=${googlePlacesKey}`;
    }
    currentMap = `${corsWorkaround}${currentMap}`;
    // console.log(currentMap);
    $.ajax({
      url: currentMap,
       type: 'GET',
       crossDomain: true,
       success: function(response) {
         var data = response.results;
         console.log('Google Places return data', response.results);
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
      customInfo: markerData,
      zIndex: 1
    });
    marker.addListener('click', function() {
    infowindow.open(map, marker);
    });
    var contentString =  "<h4>" + markerData.name + "</h4>" + "<p>" + markerData.pricing + "</p>" + "<p>" + markerData.rating + "</p>"
    + "<p>" + markerData.type + "</p>" + "<p>" + markerData.pricing + "</p>";
    var infowindow = new google.maps.InfoWindow({
      content: contentString
    });
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

  $(document).ready(function() {
    //click handling for search button
    $(".submitButtons").click("on", function(event) {
      event.preventDefault();

      //userinputvalidation();
      updateCurrentSearch(this);

    });
      //use delegated click to link onto each property in the list
      $("#individualProps").on('click', '.prop',  function() {
        //log the object information for clicked property
        var propertyData = JSON.parse($(this).attr("data-json"));
        console.log(propertyData);

        searchInput.address = encodeURI(propertyData.street);
        searchInput.zip = encodeURI(propertyData.zipcode);
        var lat = propertyData.lat;
        var long = propertyData.long;

        initMap(parseFloat(lat), parseFloat(long));
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(lat, long),
	        icon: './assets/images/house.png',
          size: new google.maps.Size(10,10),
          map: map,
          zIndex: 0
    });
        searchInput.lat = parseFloat(lat);
        searchInput.long = parseFloat(long);

        //call zillow api with zpid scraped from page
        zillowApi(apiLinkBuild("zillowSearch"));
        //we now need to populate this data into the fullDetails element
        newPlaces();
      });
  })
