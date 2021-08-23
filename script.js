const Run = () => {
  const onLocationFound = (e) => {
    L.marker(e.latlng).addTo(map);
  };
  var map = L.map("mapid").fitWorld();
  L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "something cool",
  }).addTo(map);

  map.locate({ setView: true, maxZoom: 16 });
  map.on("locationfound", onLocationFound);
  const onEachFeature = (feature, layer) => {
    console.log(e);
  };
  var geojsonLayer = new L.GeoJSON.AJAX(
    "https://raw.githubusercontent.com/minhealthnz/nz-covid-data/main/locations-of-interest/august-2021/locations-of-interest.geojson",
    { onEachFeature: onEachFeature }
  );
  geojsonLayer.addTo(map);
};

window.onload = Run;
