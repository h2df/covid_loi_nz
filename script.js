const Run = () => {
  const loiUrl =
    "https://raw.githubusercontent.com/minhealthnz/nz-covid-data/main/locations-of-interest/august-2021/locations-of-interest.geojson";
  const countryCenter = [-41.6, 174.5];
  const countryZoom = 5;
  const localZoom = 14;
  const propsToExclude = ["id", "Added", "Updated"];
  const loiIcon = L.Icon.extend({
    options: {
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
      shadowUrl: "./assets/marker-shadow.png",
    },
  });
  const loadJson = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(response.statusText);

    const data = await response.json();
    return data;
  };

  const showError = () => {
    document.querySelector("#info").innerHTML = `
      <p> 
          Sorry, the data loading has failed. You can still check out the locations of interest information at the <a href='https://www.health.govt.nz/our-work/diseases-and-conditions/covid-19-novel-coronavirus/covid-19-health-advice-public/contact-tracing-covid-19/covid-19-contact-tracing-locations-interest'>Ministry of Health.</a>
      </p> 
    `;
  };

  const updateSelectedDateOnPage = (selectedDate) => {
    document.querySelector("#selected-date").innerHTML =
      selectedDate.toDateString();
  };

  const renderMap = (geoJson, selectedDate) => {
    const map = L.map("map", {
      minZoom : countryZoom,
    }).setView(countryCenter, countryZoom);
    map.setMaxBounds(map.getBounds().pad(0.01)); //pad to avoid the leaflet bug causing map shaking

    //there seems to be a bug in leaflet or geolocation API which can cause tile not loaded correctly
    //so here we're doing user agent detecting to avoid geolocation on mobile device, which is not a suggested practice
    if (
      !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      //set the user location (if provided) as the map center with appropriate zoom level
      const onLocationFound = (e) => {
        L.marker(e.latlng).addTo(map).bindPopup("Your Location");
      };
      map.on("locationfound", onLocationFound);
      map.locate({ setView: true, maxZoom: localZoom });
    }

    //OSM tile layer
    L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: `&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors, 
        Data Source: <a href='${loiUrl}'>Ministry of Health</a>, 
        Marker Assets: <a href='https://github.com/pointhi/leaflet-color-markers'>leaflet-color-markers</a><br>
        Disclaimer: This unofficial site does not promise the reliability or accuracy of the visualization. Please refer to the original data source when in doubt.`,
    }).addTo(map);

    const renderLoiLayer = () => {
      const createGeoJsonLayer = (featureFilter, icon) =>
        new L.geoJSON(geoJson, {
          filter: featureFilter,
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

            const popupOptions = {
              className: "loli-popup",
            };

            return L.marker(latlng, { icon: icon }).bindPopup(
              popupContent,
              popupOptions
            );
          },
        });

      //wtf js cannot parse dd/mm/yy?
      const parseDate = (s) => {
        const substrs = s.split(",")[0].split("/");
        return [substrs[0], substrs[1], substrs[2]];
      };

      const isSelectedDay = ([d, m, y]) => {
        const result =
          d == selectedDate.getDate() &&
          m == selectedDate.getMonth() + 1 &&
          y == selectedDate.getFullYear();
        return result;
      };

      const isSelected = (feature) => {
        return (
          isSelectedDay(parseDate(feature.properties.Start)) ||
          isSelectedDay(parseDate(feature.properties.End))
        );
      };
      const defaultLoiLayer = createGeoJsonLayer(
        (f) => !isSelected(f),
        new loiIcon({
          iconUrl: "./assets/marker-icon-2x-yellow.png",
        })
      );
      defaultLoiLayer.addTo(map);

      const selectedLoiLayer = createGeoJsonLayer(
        isSelected,
        new loiIcon({
          iconUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
        })
      );
      selectedLoiLayer.addTo(map);
    };
    renderLoiLayer();

    document.querySelector("#prev").onclick = () => {
      selectedDate.setDate(selectedDate.getDate() - 1);
      renderLoiLayer();
      updateSelectedDateOnPage(selectedDate);
    };

    document.querySelector("#next").onclick = () => {
      selectedDate.setDate(selectedDate.getDate() + 1);
      renderLoiLayer();
      updateSelectedDateOnPage(selectedDate);
    };
  };

  const renderData = (data) => {
    const selectedDate = new Date();
    renderMap(data, selectedDate);
    updateSelectedDateOnPage(selectedDate);
  };

  loadJson(loiUrl)
    .then((data) => {
      renderData(data);
    })
    .catch((_) => {
      showError();
    });
};

window.onload = Run;
