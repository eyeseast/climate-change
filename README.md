Climate Change
==============

This app builds and serves an interactive map and chart of climate change both global and local. The app is entirely static and can be served from any web server, including Github pages.

Assumptions:
------------

The app relies on several map layers hosted in the New Scientist account on Mapbox. These layers are hard-coded into the app and shouldn't need to be changed. The actual hosted layers can be edited or updated on Mapbox, so long as the names aren't changed, and everything will still work.

Building:
---------

The chart data, representing temperature anomalies for every two-by-two lat/lng grid square on the globe, is stored in several `CSV` files in the `data` directory.

 - `annual.csv` stores local annual averages
 - `5year.csv` stores local five-year rolling averages
 - `global.csv` stores the global temperature anomaly data, both annual and five-year

Note that the first row in `annual.csv` and `5year.csv` has been deleted. This row contains a single header, `lon`, which screws up `CSV` parsing. If you update the files, make sure to remove that row.

Global data is written to `js/chart-data.js` as JavaScript variables. Run the following command to write that file:

    fab global_data

The local data sets are sharded and served from the file system, out of the `data/grid` directory. Building relies on a Python script in the `bin` directory. To build the grid, run:

    fab shard

That command assumes the above CSV files are in the `data` directory.