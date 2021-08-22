const Run = () => {
  const getLocation = () => {   
    console.log('getLocation was called') 
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        hideLoadingDiv();
        console.log('Geolocation is not supported by this device')
    }
}


const showPosition = (p) => {
    console.log('posiiton accepted');
    console.log(p);
    allowGeoRecall = false;
}

getLocation();


  var vectorLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      projection: "EPSG:3857",
      url: "https://raw.githubusercontent.com/minhealthnz/nz-covid-data/main/locations-of-interest/august-2021/locations-of-interest.geojson",
      format: new ol.format.GeoJSON(),
    }),
  });
  var map = new ol.Map({
    target: "map",
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM(),
      }),
      vectorLayer,
    ],
    view: new ol.View({
      center: ol.proj.fromLonLat([37.41, 8.82]),
      zoom: 4,
    }),
  });
};

window.onload = Run;
