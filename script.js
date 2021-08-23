const loiUrl = "https://raw.githubusercontent.com/minhealthnz/nz-covid-data/main/locations-of-interest/august-2021/locations-of-interest.geojson";
const countryCenter = [-41.6, 174.5];
const countryZoom = 5;
const localZoom = 14;
const propsToExclude = ["id", "Added"];
const loiIcon = L.Icon.extend({
  options: {
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  },
});

const loadJson = async url => {
  const response = await fetch(url);
  if(!response.ok)
    throw new Error(response.statusText);

  const data = await response.json();
  return data;
}
const Run = () => {
  loadJson(loiUrl).then(data => {
    renderMap(data);
  }).catch(error => {
    document.querySelector("#info").innerHTML = `
      <p> 
          Sorry, the data loading has failed. You can still check out the locations of interest information at the <a href='https://www.health.govt.nz/our-work/diseases-and-conditions/covid-19-novel-coronavirus/covid-19-health-advice-public/contact-tracing-covid-19/covid-19-contact-tracing-locations-interest'>Ministry of Health.</a>
      </p> 
    `
  })
}


const renderMap = (data) => {
  //set the country at the map center with appropriate zoom level
  const map = L.map("map").setView(countryCenter, countryZoom);

  //OSM tile layer
  L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
  }).addTo(map);

  const onLocationFound = (e) => {
    L.marker(e.latlng).addTo(map);
  };
  map.on("locationfound", onLocationFound);
  map.locate({ setView: true, maxZoom: localZoom });

  //geojson layer
  const geojsonLayer = new L.geoJSON(
    data,
    {
      pointToLayer: (feature, latlng) => {
        const props = feature.properties;
        let popupContent = "<table>";
        for (let prop in props) {
          if (propsToExclude.includes(prop)) {
            continue;
          }
          if (props.hasOwnProperty(prop)) {
            popupContent += `<tr><td>${prop}</td><td>${props[prop]}</td></tr>`;
          }
        }
        popupContent += "</table>";

        const defaultLoiIcon = new loiIcon({
          iconUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        });

        const popupOptions = {
          className: "loli-popup",
        };

        return L.marker(latlng, { icon: defaultLoiIcon }).bindPopup(
          popupContent,
          popupOptions
        );
      },
    }
  );
  geojsonLayer.addTo(map);
};

window.onload = Run;
