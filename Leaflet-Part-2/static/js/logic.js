// Create the base layers for different map styles
let satelliteMap = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
  attribution: "&copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
});

let greyscaleMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
});

let outdoorsMap = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenTopoMap contributors"
});

// Create the map object and set default layers
let myMap = L.map("map", {
  center: [20, -100],  // Adjusted to center the view on the Americas
  zoom: 3,
  layers: [satelliteMap]  // Default layer is satellite
});

// Create layer groups for overlays
let earthquakes = new L.LayerGroup();
let tectonicPlates = new L.LayerGroup();

// Define the base maps
let baseMaps = {
  "Satellite": satelliteMap,
  "Greyscale": greyscaleMap,
  "Outdoors": outdoorsMap
};

// Define overlay layers
let overlayMaps = {
  "Earthquakes": earthquakes,
  "Tectonic Plates": tectonicPlates
};

// Add layer control to toggle layers
L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(myMap);

// Load earthquake data from USGS
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // Function to style each earthquake marker
  function styleInfo(feature) {
      return {
          opacity: 1,
          fillOpacity: 1,
          fillColor: getColor(feature.geometry.coordinates[2]),  // Color based on depth
          color: "#000",
          radius: getRadius(feature.properties.mag),  // Radius based on magnitude
          stroke: true,
          weight: 0.5
      };
  }

  // Function to determine marker color based on depth
  function getColor(depth) {
      return depth > 90 ? "#ea2c2c" :
             depth > 70 ? "#ea822c" :
             depth > 50 ? "#ee9c00" :
             depth > 30 ? "#eecc00" :
             depth > 10 ? "#d4ee00" :
                          "#98ee00";
  }

  // Function to determine marker radius based on magnitude
  function getRadius(magnitude) {
      return magnitude === 0 ? 1 : magnitude * 4;
  }

  // Add GeoJSON layer for earthquakes
  L.geoJson(data, {
      pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng);
      },
      style: styleInfo,
      onEachFeature: function (feature, layer) {
          layer.bindPopup(
              "<b>Magnitude:</b> " + feature.properties.mag +
              "<br><b>Location:</b> " + feature.properties.place +
              "<br><b>Depth:</b> " + feature.geometry.coordinates[2] + " km"
          );
      }
  }).addTo(earthquakes);

  // Add earthquakes layer to map
  earthquakes.addTo(myMap);
});

// Load tectonic plate boundaries data
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plateData) {
  L.geoJson(plateData, {
      color: "orange",
      weight: 2
  }).addTo(tectonicPlates);

  tectonicPlates.addTo(myMap);
});

// Create legend control
let legend = L.control({ position: "bottomright" });

legend.onAdd = function () {
  let div = L.DomUtil.create("div", "info legend");
  let depths = [-10, 10, 30, 50, 70, 90];
  let colors = ["#98ee00", "#d4ee00", "#eecc00", "#ee9c00", "#ea822c", "#ea2c2c"];

  for (let i = 0; i < depths.length; i++) {
      div.innerHTML +=
          "<i style='background: " + colors[i] + "; width: 18px; height: 18px; display: inline-block; margin-right: 5px;'></i> " +
          depths[i] + (depths[i + 1] ? "&ndash;" + depths[i + 1] + "<br>" : "+");
  }

  return div;
};

// Add legend to the map
legend.addTo(myMap);



