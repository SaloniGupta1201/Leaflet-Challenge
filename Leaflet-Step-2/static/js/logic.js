console.log("Welcome to Leaflet-Step-2")
  //Gray Mapbox background, Base Gray Layer
  var graymap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  //Satellite Layer
  var satmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  //Outdoors Layer
  var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  // Creating map object
  var myMap = L.map("map", {
    center: [40.7, -94.5],
    zoom: 3,
    layers: [graymap, satmap, outdoors]
  });
  
  // Adding our 'satmap' tile layer to the map.
  satmap.addTo(myMap);
  
  // We create the layers for our two different sets of data, earthquakes and
  // tectonicplates.
  var tectonicplates = new L.LayerGroup();
  var earthquakes = new L.LayerGroup();
  
  // Defining an object that contains all of our different map choices. Only one
  // of these maps will be visible at a time!
  var basemaps = {
    "SatelliteMap": satmap,
    "GrayMap": graymap,
    "Outdoors": outdoors,
  };
  // Define an object that contains all of our overlays. Any combination of
  // these overlays may be visible at the same time!
  var overlay = {
    "Earthquakes": earthquakes,
    "Fault Lines": tectonicplates,
  };
  // Then we add a control to the map that will allow the user to change which
  // layers are visible.
  L.control.layers(basemaps, overlay).addTo(myMap);

//Grab data with d3, AJAX call retrieves our earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function (data) {
  
// This function returns the style data for each of the earthquakes we plot on the map. 
  // We pass the magnitude of the earthquake into two separate functions
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

  // This function determines the color of the marker based on depth of the earthquake.
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

  // Add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    // Turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlong) {
      return L.circleMarker(latlong);
    },
    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo,

    // Binding a pop-up for each marker to each layer to display the magnitude and location of
    // the earthquake
    onEachFeature: function (feature, layer) {
      layer.bindPopup("Earthquake Magnitude: " + feature.properties.mag 
      + "<br>Depth: " + feature.geometry.coordinates[2] 
      + "<br>Earthquake Location:<br>" + feature.properties.place);
    }
    // We add the data to the earthquake layer instead of directly to the map.
  }).addTo(earthquakes);

  // Then we add the earthquake layer to our map.
  earthquakes.addTo(myMap);

  var legend = L.control({ position: 'bottomright' });

  legend.onAdd = function(myMap) {
  //Dom Utility that puts legend into DIV & Info Legend
  var div = L.DomUtil.create('div', 'info legend'),
    //Magnitude Grades, stops at 5 magnitude
  grades = [-10, 10, 30, 50, 70, 90];

  //Legend Label Earthquake <break> Depth  
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

// Here we make an AJAX call to get our Tectonic Plate geoJSON data.
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
function(platedata) {
  // Adding our geoJSON data, along with style information, to the tectonicplates
  // layer.
  L.geoJson(platedata, {
    color: "orange",
    weight: 2
  })
  .addTo(tectonicplates);

  // Then add the tectonicplates layer to the map.
  tectonicplates.addTo(myMap);
  });
});

