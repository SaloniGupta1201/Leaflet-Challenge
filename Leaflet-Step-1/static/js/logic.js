// Creating map object
var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5
  });
console.log("Welcome to Map Creation")

// Adding tile layer
L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: API_KEY
}).addTo(myMap);

// Use this link to get the geojson data.
var geodata_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Grab the data with d3
d3.json(geodata_url, function(data) {
    console.log("Inside function to grab geojson data")
  // This function returns the style data for each of the earthquakes we plot on
  // the map. We pass the magnitude of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // This function determines the color of the marker based on the magnitude of the earthquake.
  function getColor(depth) {
    switch (true) {
      case depth > 90:
        return "#ea2c2c";
      case depth > 70:
        return "#ea822c";
      case depth > 50:
        return "#ee9c00";
      case depth > 30:
        return "#eecc00";
      case depth > 10:
        return "#d4ee00";
      default:
        return "#98ee00";
    }
  }
   // This function determines the radius of the earthquake marker based on its magnitude.
   // Earthquakes with a magnitude of 0 were being plotted with the wrong radius.
    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }
        return magnitude * 4;
        }
      // Creating a geoJSON layer with the retrieved data
    L.geoJSON(data, {
    pointToLayer: function (feature, latlong) {
        return L.circleMarker(latlong);
        },
    // Style each feature (in this case a neighborhood)
    style: styleInfo,
    // Called on each feature
    onEachFeature: function(feature, layer) {
    // Giving each feature a pop-up with information pertinent to it
    layer.bindPopup("Earthquake Magnitude: " + feature.properties.mag + "<br>Depth: "
    + feature.geometry.coordinates[2] + "<br>Earthquake Location:<br>" + feature.properties.place);
    // console.log("Earthquake Magnitude:" + feature.properties.mag + "Earthquake Location:" + feature.properties.place);
  }
}).addTo(myMap);
//add legend on Bottom Right Corner
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
  //Dom Utility that puts legend into DIV & Info Legend
  var div = L.DomUtil.create('div', 'info legend'),
    //Magnitude Grades, stops at 5 magnitude
    grades = [-10, 10, 30, 50, 70, 90];

  //Legend Label Earthquake <break> Magnitude  
  div.innerHTML = 'Eathquake<br>Depth<br><hr>'

  // loop through our density intervals and generate a label with a colored square for each interval
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
      //HTML code with nbs(non-breaking space) and ndash
      '<i style="background:' 
      + getColor(grades[i] + 1) 
      + '">&nbsp&nbsp&nbsp&nbsp</i> ' 
      + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }

  return div;
};
//Adds Legend to myMap
legend.addTo(myMap);
});
