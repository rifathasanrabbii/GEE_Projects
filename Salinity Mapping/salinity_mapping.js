/**
 * Salinity Mapping for Barguna & Patuakhali
 * Modified for: High-Impact Visual Presentation
 */

// 1. Define the Area of Interest (Barguna and Patuakhali)
var roi = ee.FeatureCollection("FAO/GAUL/2015/level2")
    .filter(ee.Filter.inList('ADM2_NAME', ['Barguna', 'Patuakhali']));

Map.centerObject(roi, 9);

// 2. Pre-processing Function
function processImage(image) {
  var qa = image.select('QA60');
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
               .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
               
  // NDWI to mask out deep water (we want soil salinity, not ocean)
  var ndwi = image.normalizedDifference(['B3', 'B8']);
  var landMask = ndwi.lt(0.1); 

  var blue = image.select('B2').divide(10000);
  var red = image.select('B4').divide(10000);
  
  // Salinity Index: sqrt(Blue * Red)
  var si = blue.multiply(red).sqrt().rename('Salinity_Index');

  return si.updateMask(mask).updateMask(landMask)
           .copyProperties(image, ['system:time_start']);
}

// 3. Load and Process Dataset (Dry Season focuses on salt accumulation)
var dataset = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                  .filterDate('2024-01-01', '2024-05-30')
                  .filterBounds(roi)
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
                  .map(processImage)
                  .median()
                  .clip(roi);

// 4. Visualization Parameters
var siVis = {
  min: 0.04, 
  max: 0.15, 
  palette: ['#228B22', '#ADFF2F', '#FFFF00', '#FFA500', '#FF4500'], // Green to Red
};

// Map Aesthetics
Map.setOptions('SATELLITE'); // Satellite background for context
Map.addLayer(dataset, siVis, 'Soil Salinity (Dry Season 2024)');

// District Borders
var border = ee.Image().paint(roi, 0, 2);
Map.addLayer(border, {palette: 'white'}, 'Barguna-Patuakhali Border');

// 5. Professional UI Elements
var titlePanel = ui.Panel({
  style: {position: 'top-center', padding: '10px 15px', border: '1px solid #ccc'}
});
var title = ui.Label('Coastal Salinity Analysis', {fontWeight: 'bold', fontSize: '18px', color: '#d32f2f'});
var sub = ui.Label('Barguna & Patuakhali Districts (2024)', {fontSize: '13px'});
titlePanel.add(title).add(sub);
Map.add(titlePanel);

// Legend Construction
var legend = ui.Panel({style: {position: 'bottom-left', padding: '10px'}});
legend.add(ui.Label('Salinity Intensity', {fontWeight: 'bold'}));

var colors = ['228B22', 'FFFF00', 'FF4500'];
var labels = ['Low (Safe)', 'Moderate', 'High (Critical)'];

for (var i = 0; i < 3; i++) {
  var colorBox = ui.Label({style: {backgroundColor: '#' + colors[i], padding: '8px', margin: '4px'}});
  var description = ui.Label(labels[i], {margin: '4px'});
  legend.add(ui.Panel([colorBox, description], ui.Panel.Layout.Flow('horizontal')));
}
Map.add(legend);

// Time Series Chart
var chartCol = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
    .filterBounds(roi)
    .filterDate('2021-01-01', '2024-12-31')
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
    .map(processImage);

var chart = ui.Chart.image.series({
  imageCollection: chartCol,
  region: roi,
  reducer: ee.Reducer.mean(),
  scale: 10000
}).setOptions({
  title: 'Multi-Year Salinity Trend',
  hAxis: {title: 'Year'},
  vAxis: {title: 'Salinity Index'},
  colors: ['#FF4500'],
  curveType: 'function'
});
chart.style().set({position: 'bottom-right', width: '400px', height: '200px'});
Map.add(chart);
