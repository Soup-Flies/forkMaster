var zillowApi = "http://www.zillow.com/webservice/GetZestimate.htm";
var zillowKey = "X1-ZWz195aafxhlor_4vl2o";
var googlePlacesKey = "AIzaSyBQCnwzPy31r3t741_zCN9LCy81753WDzw";
var googleKey = "AIzaSyAWE8SJk1mkR4Jlubw5Q5DoVepI2eIdh1I";


var apiUrl = zillowApi + "?zws-id=" + zillowKey;
$.ajax({

  method: "GET",
  url: apiUrl,
  headers: {
    "Accept": "application/json"
  }
})
  .done(function(data) {
    console.log("Hello!");
    console.log(data);
  })



var apiUrl = "https://maps.googleapis.com/maps/api/js?key=" + googlePlacesKey + "&libraries=places&callback=initMap";
  $.ajax({
    method: "GET",
    url: apiUrl,
    headers: {
      "Accept": "application/json"
    }
  })
    .done(function(data) {
      console.log("Hello!");
      console.log(data);
    })

var apiUrl = "https://maps.googleapis.com/maps/api/js?key=" + googleKey + "&callback=initMap";
$.ajax({
  method: "GET",
  url: apiUrl,
  headers: {
    "Accept": "application/json"
  }
})
  .done(function(data) {
    console.log(data);
  })
  var map;
   function initMap() {
     map = new google.maps.Map(document.getElementById('map'), {
       center: {lat: -34.397, lng: 150.644},
       zoom: 8
     });
   }
   initMap();
