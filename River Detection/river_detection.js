// 1. Load Administrative Boundaries
var districts = ee.FeatureCollection("FAO/GAUL/2015/level2");
var studyArea = districts.filter(ee.Filter.inList('ADM2_NAME', ['Barguna', 'Patuakhali']));

// 2. Load RiverAtlas
var rivers = ee.FeatureCollection("projects/sat-io/open-datasets/HydroAtlas/RiverAtlas_v10");

// 3. Filter and CLEAN the data (Choosing only 4-5 key columns)
var cleanedRivers = rivers.filterBounds(studyArea).map(function(feature) {
  return feature.select([
    'HYRIV_ID', // Unique ID
    'NEXT_DOWN', // Connectivity
    'ORD_STRA',  // River Order (Critical for styling line thickness!)
    'DIST_MAIN'  // Distance to mouth
  ]);
});

// 4. Export as a Shapefile (Now under the 255 limit)
Export.table.toDrive({
  collection: cleanedRivers,
  description: 'Barguna_Patuakhali_Rivers_Clean',
  fileFormat: 'SHP'
});
