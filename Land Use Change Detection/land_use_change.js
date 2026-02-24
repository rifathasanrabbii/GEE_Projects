/**
 * Land Use Change Detection: Barishal Division (2015 vs 2024)
 * Using Dynamic World V1 Dataset
 */

// 1. Define the Study Area (Barishal Division)
var countries = ee.FeatureCollection("FAO/GAUL/2015/level1");
var barishal = countries.filter(ee.Filter.eq('ADM1_NAME', 'Barisal'));
Map.centerObject(barishal, 9);
Map.addLayer(barishal, {color: 'grey'}, 'Barishal Boundary', false);

// 2. Define Time Periods
var startDate15 = '2015-01-01';
var endDate15 = '2015-12-31';
var startDate25 = '2025-01-01';
var endDate25 = '2025-12-31';

// 3. Function to get the Mode (most frequent) Land Cover class
function getLandCover(startDate, endDate, region) {
  var dw = ee.ImageCollection("GOOGLE/DYNAMICWORLD/V1")
             .filterBounds(region)
             .filterDate(startDate, endDate)
             .select('label');
  
  // Create a composite using the mode (most frequent label)
  return dw.reduce(ee.Reducer.mode()).clip(region);
}

// 4. Generate Land Cover for both years
var lc2015 = getLandCover(startDate15, endDate15, barishal);
var lc2025 = getLandCover(startDate25, endDate25, barishal);

// 5. Define Dynamic World Visualization Parameters
var dwVis = {
  min: 0,
  max: 8,
  palette: [
    '#419BDF', // 0: water
    '#397D49', // 1: trees
    '#88B053', // 2: grass
    '#7A87C6', // 3: flooded_vegetation
    '#E49635', // 4: crops
    '#DFC351', // 5: shrub_and_scrub
    '#C4281B', // 6: built
    '#A59B8F', // 7: bare
    '#B39FE1'  // 8: snow_and_ice
  ]
};

// 6. Change Detection Logic (Simplified)
// We look for pixels where the label changed from 2015 to 2024
var change = lc2015.neq(lc2025);

// 7. Add Layers to Map
Map.addLayer(lc2015, dwVis, 'Land Use 2015');
Map.addLayer(lc2025, dwVis, 'Land Use 2025');
Map.addLayer(change.updateMask(change), {palette: ['red']}, 'Detected Change (Binary)', false);

// 8. Create a Legend (Optional UI)
var legend = ui.Panel({style: {position: 'bottom-right', padding: '8px 15px'}});
legend.add(ui.Label('Land Use Legend', {fontWeight: 'bold'}));
var makeRow = function(color, name) {
  var colorBox = ui.Label({style: {backgroundColor: color, padding: '8px', margin: '0 0 4px 6px'}});
  var description = ui.Label({value: name, style: {margin: '0 0 4px 6px'}});
  return ui.Panel({widgets: [colorBox, description], layout: ui.Panel.Layout.Flow('horizontal')});
};
var labels = ['water', 'trees', 'grass', 'flooded_veg', 'crops', 'shrub', 'built', 'bare'];
var colors = ['#419BDF', '#397D49', '#88B053', '#7A87C6', '#E49635', '#DFC351', '#C4281B', '#A59B8F'];
for (var i = 0; i < 8; i++) { legend.add(makeRow(colors[i], labels[i])); }
Map.add(legend);
