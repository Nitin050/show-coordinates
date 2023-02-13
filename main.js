import './style.css';
import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import VectorSource from 'ol/source/Vector.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import Feature from 'ol/Feature.js';
import Overlay from 'ol/Overlay.js';
import VectorLayer from 'ol/layer/Vector.js';
import {Point} from 'ol/geom.js';
import {useGeographic} from 'ol/proj.js';
import {csv} from 'd3-fetch';

useGeographic();
var place = [-2.55993335,53.7187004];
var featuresData = [];
var cord_data = [];
// const data = await csv("./data.csv");
// console.log(Object.values(data[0])); // [{"Hello": "world"}, …]
await csv("./data.csv").then((data) => {
  // place = [0,0]
  var res = data.map(({...rest}) => Object.values(rest))
  cord_data = res;
  res.forEach((v,i)=>{
    var point = new Point([v[16],v[15]]);
    featuresData.push(new Feature(point))
  })
  var mid = parseInt(res.length / 2);
  place = [res[mid][16],res[mid][15]]
  // console.log(res); // [{"Hello": "world"}, …]
}).catch(e=>{
  console.log(e)
});




const map = new Map({
  target: 'map',
  view: new View({
    center: place,
    zoom: 16,
  }),
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    new VectorLayer({
      source: new VectorSource({
        features: featuresData,
      }),
      style: {
        'circle-radius': 9,
        'circle-fill-color': 'red',
      },
    }),
  ],
});

// const popup = new Overlay({
//   element: element,
//   stopEvent: false,
// });
// map.addOverlay(popup);

var dialog;
map.on('click', function (event) {
  const feature = map.getFeaturesAtPixel(event.pixel)[0];
  if (!feature) {
    if(dialog){
      $('#popup').dialog("close");
    }
    return;
  }
  const coordinate = feature.getGeometry().getCoordinates();
  dialog = $('#popup')
  .html(`
    <table style="width:100%">
      ${cord_data.find(item=> item[16]==coordinate[0] && item[15]==coordinate[1]).map(d=>(
      `<tr><td>${d}</td></tr>`
    )).join('')}
    </table>
  `)
  .dialog({
    position: { my: "left top", at: "left top" },
    title: 'Info',
    height: 300
  });
});

map.on('pointermove', function (event) {
  const type = map.hasFeatureAtPixel(event.pixel) ? 'pointer' : 'inherit';
  map.getViewport().style.cursor = type;
});