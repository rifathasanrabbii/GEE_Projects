/*************************************************************
 * TIMELAPSE LANDSAT DHAKA (1990–2025)
 * Composition : MIR (SWIR1) – PIR (NIR) – ROUGE
 * Made by Rifat Hasan Rabbi
 *************************************************************/

// 1. Define ROI for Dhaka
var roi = ee.Geometry.Point([90.4125, 23.8103]).buffer(20000).bounds();
Map.centerObject(roi, 11);

var startYear = 1990; 
var endYear   = 2025;

/* ==========================================================
   2. CLOUD MASKING & SCALING
   ========================================================== */
function cloudMask(image){
  var qa = image.select('QA_PIXEL');
  var dilated = 1 << 1;
  var cirrus  = 1 << 2;
  var cloud   = 1 << 3;
  var shadow  = 1 << 4;

  var mask = qa.bitwiseAnd(dilated).eq(0)
    .and(qa.bitwiseAnd(cirrus).eq(0))
    .and(qa.bitwiseAnd(cloud).eq(0))
    .and(qa.bitwiseAnd(shadow).eq(0));

  return image
    .updateMask(mask)
    .multiply(0.0000275).add(-0.2)
    .copyProperties(image, ['system:time_start', 'SPACECRAFT_ID']);
}

/* ==========================================================
   3. DATA COLLECTION
   ========================================================== */
function col(id) {
  return ee.ImageCollection(id)
    .filterBounds(roi)
    .map(cloudMask);
}

var L4 = col('LANDSAT/LT04/C02/T1_L2');
var L5 = col('LANDSAT/LT05/C02/T1_L2');
var L7 = col('LANDSAT/LE07/C02/T1_L2');
var L8 = col('LANDSAT/LC08/C02/T1_L2');
var L9 = col('LANDSAT/LC09/C02/T1_L2');

var landsat = L4.merge(L5).merge(L7).merge(L8).merge(L9);

/* ==========================================================
   4. BAND HARMONIZATION
   ========================================================== */
function renameBands(image) {
  var sensor = ee.String(image.get('SPACECRAFT_ID'));
  var newSensors = ee.List(['LANDSAT_8', 'LANDSAT_9']);
  var isNew = newSensors.contains(sensor);
  
  return ee.Image(ee.Algorithms.If(
    isNew,
    image.select(['SR_B6', 'SR_B5', 'SR_B4'], ['MIR', 'PIR', 'RED']), 
    image.select(['SR_B5', 'SR_B4', 'SR_B3'], ['MIR', 'PIR', 'RED'])  
  )).copyProperties(image, ['system:time_start']);
}

landsat = landsat.map(renameBands);

/* ==========================================================
   5. ANNUAL COMPOSITES (Fixed Filter Logic)
   ========================================================== */
var years = ee.List.sequence(startYear, endYear);

var annual = ee.ImageCollection.fromImages(
  years.map(function(y) {
    y = ee.Number(y);
    
    // Corrected Filter Logic: Using ee.Filter.or() to wrap the ranges
    var seasonalFilter = ee.Filter.or(
      ee.Filter.calendarRange(1, 3, 'month'),
      ee.Filter.calendarRange(11, 12, 'month')
    );
    
    var yearCol = landsat.filter(ee.Filter.calendarRange(y, y, 'year'))
                         .filter(seasonalFilter);
                         
    var composite = yearCol.median().clip(roi);

    return composite
      .set('year', y)
      .set('count', yearCol.size())
      .set('system:time_start', ee.Date.fromYMD(y, 1, 1));
  })
).filter(ee.Filter.gt('count', 0));

/* ==========================================================
   6. VISUALIZATION & ANNOTATION (CLEAN & SMALL)
   ========================================================== */
var vis = {
  bands: ['MIR', 'PIR', 'RED'],
  min: 0.0,
  max: 0.4,
  gamma: 1.2
};

var text = require('users/gena/packages:text');

function addYearLabel(image) {
  var year = ee.Number(image.get('year')).toInt().format('%d');
  
  // Coordinates for Upper Middle (Slightly north of the center)
  // Center was 23.8103; Upper middle is approx 23.92
  var labelPoint = ee.Geometry.Point([90.4125, 23.92]); 

  // scale: 250 makes the text smaller and removes the 'messy' pixels
  var label = text.draw(year, labelPoint, 250, {
    textColor: 'ffffff',     // White text
    outlineColor: '000000',  // Black outline for readability
    outlineWidth: 1,         // Thinner outline for small size
    fontSize: 18             // Font reference
  });

  return image.visualize(vis)
    .blend(label)
    .set('system:time_start', image.get('system:time_start'));
}

var annotated = annual.map(addYearLabel);

/* ==========================================================
   7. OUTPUTS
   ========================================================== */
Map.addLayer(annotated.first(), {}, 'Dhaka 1990 Preview');

print("Generating Timelapse Preview...", ui.Thumbnail(annotated, {
  region: roi,
  dimensions: 600,
  framesPerSecond: 5
}));

Export.video.toDrive({
  collection: annotated,
  description: 'Dhaka_Growth_1990_2025',
  folder: 'GEE_Output',
  fileNamePrefix: 'dhaka_timelapse',
  framesPerSecond: 5,
  scale: 30,
  region: roi,
  maxPixels: 1e13
});
