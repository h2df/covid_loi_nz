const Run = () => {
  const onLocationFound = (e) => {
    L.marker(e.latlng).addTo(map);
  };
  var map = L.map("map").fitWorld();
  L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "something cool",
  }).addTo(map);

  map.locate({ setView: true, maxZoom: 16 });
  map.on("locationfound", onLocationFound);
  var geojsonLayer = new L.GeoJSON.AJAX(
    "https://raw.githubusercontent.com/minhealthnz/nz-covid-data/main/locations-of-interest/august-2021/locations-of-interest.geojson",
    {
      pointToLayer: (feature, latlng) => {
        const popupContent = `<table>
                                <tr>
                                  <td> Event: </td>
                                  <td>${feature.properties.Event}</td>
                                </tr>
                                <tr>
                                  <td> Location: </td>
                                  <td>${feature.properties.Location}</td>
                                </tr>
                                <tr>
                                  <td> Start: </td>
                                  <td>${feature.properties.Start}</td>
                                </tr>
                                <tr>
                                  <td> End: </td>
                                  <td>${feature.properties.End}</td>
                                </tr>
                                <tr>
                                  <td> Advice: </td>
                                  <td>${feature.properties.Advice}</td>
                                </tr>
                           </table>`;
        const popupOptions = {
          className: "loli-popup",
        };
        var loiIcon = new L.Icon({
          iconUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });
        return L.marker(latlng, { icon: loiIcon }).bindPopup(
          popupContent,
          popupOptions
        );
      },
    }
  );
  geojsonLayer.addTo(map);
};

window.onload = Run;
