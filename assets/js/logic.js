
//This object populates default values for initial load
var currentSearch = {
  id : "",
  lat : 39.764339,
  long : -104.85511,
  zip : "80215",
  venueType : "bar",
  state : "Colorado",
  city : "Denver"
}

const zillowZestimate = "http://www.zillow.com/webservice/GetZestimate.htm?";
const zillowSearch = "http://www.zillow.com/webservice/GetDeepSearchResults.htm?";
const zillowGetComps = "http://www.zillow.com/webservice/GetDeepComps.htm?";
const zillowKey = "X1-ZWz195aafxhlor_4vl2o";
const googlePlacesKey = "AIzaSyBQCnwzPy31r3t741_zCN9LCy81753WDzw";
const googleKey = "AIzaSyAWE8SJk1mkR4Jlubw5Q5DoVepI2eIdh1I";
const corsWorkaround = "https://cors-anywhere.herokuapp.com/";
var currentMap = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${currentSearch.lat},${currentSearch.long}&radius=${searchRadius}&type=${currentSearch.venueType}&key=${googlePlacesKey}`;
//search radius of 1 mile, 1609.344 is meters per mile
var searchRadius = (1609.344 * 2).toString();
var firstSearch = true;
var initialLoad = true;
var searchInput = {};
var map;

function amenitiesBar(type) {
    searchInput.venueType = type;
    console.log('searchInput.venueType',searchInput.venueType);
    newPlaces();
  /*types of amenities google accepts that are useful for us -- best to limit to maybe 3
  bar - cafe - church - gym - hospital
  library - night_club - park - restaurant - school\
  */
}


//take in user input for the searches to happen
  function updateCurrentSearch(data) {
    console.log(data);
    searchInput = {};
    searchInput = {
      address: null,
      id : null,
      state : $("#inputState").val(),
      city : $("#inputCity").val(),
      type : data.value,
      venueType : "cafe",
      price : null
    }
    //venueType is changeable to view other types of ammenities.
    console.log(searchInput);
    //Make call for the html from zillow.com with city and state from search
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
    var tempUrl = `${zillowSearch}zws-id=${zillowKey}&citystatezip=${searchInput.zip}&address=${searchInput.address}&rentzestimate=true`;
    return tempUrl;
  } else if (apiType == "googlePlaces") {
    var tempUrl;
  }
};

//pulls the html from zillows page and interprets the scripts returned due to $.load() .
//The scripts need to be interpretted so that zpid's get put into the html
function zillowWebScrape() {
  let rent;
  let listType = "fsba,fsbo,fore,new_lt";
  var tempArray = [];

  if (searchInput.type == "rent") {
    rent = 'for_rent/';
    searchInput.price = '0-5000_price';
  } else {
    rent = '';
    searchInput.price = "15000-10000000_price";
  };
  console.log(searchInput.type);
  var tempUrl = `${corsWorkaround}http://www.zillow.com/homes/${rent}${searchInput.city}-${searchInput.state}/${searchInput.price}/ .zsg-photo-card-content`;
  console.log(tempUrl);
  $("#zillowLoad").load(tempUrl, function(data) {
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
      var temp = dataJSON["SearchResults:searchresults"].response.results.result;
      console.log(temp);
      //we now need to populate this data into the fullDetails element
      fullDetails(temp);
    })
    .fail(function(data) {
      console.log("ERROR: ", data);
    })
};

//recursive function to manipulate the input object and wrap everything with a KO observable
function knockoutObservable(obj) {
  var newObj = obj;
  console.log(newObj);
  $.each(obj, function(i, v) {
    if (typeof(newObj[i]) === 'object') {
      console.log('another object recursion time!');
      knockoutObservable(newOj[i]);
    } else {
      console.log('base value');
      newObj[i] = ko.observable(v);
    }
  })
  return newObj;
};

function fullDetails(property) {
  $(".fullDetails").css("display", "inline");
  var $div = $("<div class='col-xs-6'>");
  var $divTwo = $("<div class='col-xs-6'>");
  var $row = $("<div class='row'>");
  var $facts = $("<div>");
  var rent;
  if (searchInput.type === "rent") {
    rent = true;
  }
  var value = property.taxAssessment["#text"].slice(0, property.taxAssessment["#text"].length - 2);
  $div.html(`
    <h2>${property.address.street["#text"]},<br>
    ${property.address.city["#text"]}, ${property.address.state["#text"]} ${property.address.zipcode["#text"]}
    </h2>
    <h3>${property.bedrooms["#text"]} bed &middot; ${property.bathrooms["#text"]} bath &middot; ${property.finishedSqFt["#text"]} sqft </h3>
    `);
  $divTwo.html(`
    <h3>
    ${(rent ? `Estimated rent is:<br> <strong>$${property.rentzestimate.amount["#text"]}</strong>` : `Property value:<br> <strong>$${value}</strong>`)}
    </h3>
    `);
  $facts.html(`

    `);

    $(".fullDetails").empty();
    $($row).append($facts);
    $(".fullDetails").append($div, $divTwo, $row);
}

function addressResidential(zpidData) {
  //very large log, only uncomment when necessary
  // console.log(zpidData);

  //this is the "Regex" a method in programming to search through strings
  //This string of "Regex" will read the returned information from Zillow website and pull out:
  //Full address, city, state, zipcode, bath, bed, square footage, latitude, and longitude
  var myRe = /(?:streetAddress">)([0-9]+[^<]*)(?:\D*Locality">)([^<]*)(?:\D*Region">)([^<]*)(?:\D*)([0-9]*)(?:\D*)([-0-9.]*)(?:\D*")([-0-9.]*)(?:.+?o">)([^<]*)(?:.+?span>)([^<]*)(?:.+?span>)([^<]*)(?:.+?data-src=")(.+?)"/g;
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
      sqft: match[9].trim(),
      img: match[10].trim()
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
    //appending the returned object as json string to not need a global variable
    $div.attr("data-json", JSON.stringify(value));
    //store object data into the div element for later use to populate specific details
    var $p = $("<p class='addressProp'>");
    var $img = $("<img class='propImg' alt='Property Image' onerror='appendDefault(this)'>");
    $img.attr("src", value.img);
    $p.html((index + 1 ) + " of " + filteredProperties.length + ":<br>");
    $p.append(value.street);
    $p.append(`<br>${value.city}, ${value.state} ${value.zipcode}`);
    $p.append("<br><strong>Click for more info</strong>");
    $div.append($p);
    $div.append($img);
    $("#individualProps").append($div);
  })
}

function appendDefault(img) {
  $(img).attr("src", "./assets/images/propDefault.gif");
}

//Callback function from HTML to start the google map
function initMap(lati, long) {
  if (initialLoad) {
    //sets a default location for map to run on the first load of the page
    var geoLocation = {lat: 39.764339, lng: -104.85511};
    //update the boolean to false so that next time initMap is run, geoLocation will be set to users search parameters
    initialLoad = false;
  } else {
    //if the user has searched, we will set the lat and long to the users search
    var geoLocation = {lat: lati, lng: long};
  }
  //googles method of updating the map to selected geoLocation
    map = new google.maps.Map(document.getElementById('map'), {
      center: geoLocation,
      zoom: 15
    });
}

//New api call to google for the map information
  function newPlaces() {
    var baseUrl = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=";
    if (searchInput.lat) {
      currentMap = `${baseUrl}${searchInput.lat},${searchInput.long}&radius=${searchRadius}&type=${searchInput.venueType}&key=${googlePlacesKey}`;
      console.log(currentMap);
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

//determine which icon to use depending on user search variables from amenities bar
  var iconType;
  switch  (searchInput.venueType) {
    case "restaurant":
      iconType = './assets/images/restaurant.png';
      break;
    case "bar":
      iconType = './assets/images/bar.png';
      break;
    case "gym":
      iconType = './assets/images/gym.png';
      break;
    case "school":
      iconType = './assets/images/school.png';
      break;
    case "cafe":
      iconType = './assets/images/cafe.png';
      break;
    default:
      iconType = null;

  }
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
      icon: iconType,
      map: map,
      customInfo: markerData,
      zIndex: 0
    });
    marker.addListener('click', function() {
    infowindow.open(map, marker);
    });
    if (typeof markerData.rating == "undefined") {
      markerData.rating = "No reviews yet"
    } else {
      markerData.rating = `User Rating: ${markerData.rating} stars`;
    };
    var contentString =  "<h4>" + markerData.name + "</h4>" +  "<p>" + markerData.rating + "</p>";
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

    $(".amenities").on("click", function(event) {
      var buttonVal = $(this).val();
      console.log('buttonval', buttonVal);
      amenitiesBar(buttonVal);
    })

    //click handling for search button
    $(".submitButtons").on("click", '.btn', function(event) {
      event.preventDefault();

      formVal(this);


    });
      //use delegated click to link onto each property in the list
      $("#individualProps").on('click', '.prop',  function() {
        //display amenities bar
        $("#accordion").css("display", "block");
        //log the object information for clicked property
        var propertyData = JSON.parse($(this).attr("data-json"));
        console.log(propertyData);

        searchInput.address = encodeURI(propertyData.street);
        searchInput.zip = encodeURI(propertyData.zipcode);
        searchInput.lat = parseFloat(propertyData.lat);
        searchInput.long = parseFloat(propertyData.long);

        // Update map location and make marker for selected property
        initMap(searchInput.lat, searchInput.long);
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(searchInput.lat, searchInput.long),
	        icon: './assets/images/house.png',
          map: map,
          zIndex: 1
    });
        //call zillow api with zpid scraped from page
        zillowApi(apiLinkBuild("zillowSearch"));
      });
  })
