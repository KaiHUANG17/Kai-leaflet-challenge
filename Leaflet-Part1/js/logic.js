// Initialize the Leaflet map
var myMap = L.map('map').setView([20,0],2);

// Add the tile layer to map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Define the url for the earthquake data
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a Get request to the url to fetch GeoJSON data for earthquakes
d3.json(url).then(function(data) {
    createFeatures(data.features);
})
.catch(function(error) {
    // Log any errors that occur during the fetch to the console
    console.log('There is error:', error);
});

// Define a function to process and add the GeoJSON data to the map as interactive layers
function createFeatures(earthquakeData){
    L.geoJSON(earthquakeData, {
        // Define a function to determine how each feature will be represented on map 
        pointToLayer: function(feature, latlng) {
            // Extract the earthquake mangitude for scaling the circle marker size
            var magnitude = feature.properties.mag;
            // Hint: The depth of the earth can be found as the third coordinate for each earthquake.
            var depth = feature.geometry.coordinates[2];
            // Return a circle marker layer
            return L.circleMarker(latlng, {
                radius: magnitude * 2,
                fillColor: chooseColor(depth),
                color: "#000" ,
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        },
        // Define a function to run on each feature
        onEachFeature: function (feature, layer) {
            // Construct popup content
            var popupContent = `<div style= "font-family:Arial, sans-serif;">
                    <h2 style = "color: black; font-weight: bold;">Location: ${feature.properties.place}</h2>
                    <hr>
                    <p><strong>Date: </strong> ${formatDate(feature.properties.time)}</p>
                    <p><strong>Magnitude: </strong> ${Number(feature.properties.mag).toFixed(2)}</p>
                    <p><strong>Depth: </strong> ${Number(feature.geometry.coordinates[2]).toFixed(2)} km</p>
                </div>`;
                    
            layer.bindPopup(popupContent);
        }
    }).addTo(myMap);
}

// Define a function to transform timestamp to date
function formatDate(timestamp) {
    var date = new Date(timestamp);
    return date.toLocaleDateString("en-US") + ' ' + date.toLocaleTimeString("en-US");
};

// Define a function to choose a color based on the depth 
function chooseColor(depth) {
    return depth > 90 ? '#800026' :
           depth > 70 ? '#BD0026' :
           depth > 50 ? '#E31A1C' :
           depth > 30 ? '#FC4E2A' :
           depth > 10 ? '#FEB24C' :
           '#FED976';
}

// Add legend
var legend = L.control({ position: "bottomright" });

legend.onAdd = function () {
    var div = L.DomUtil.create('div', 'info legend'),
        grades = [-10, 10, 30, 50, 70, 90], // Depth ranges
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + chooseColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

// Add the legend to the map
legend.addTo(myMap);
