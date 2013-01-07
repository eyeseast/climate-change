// fetch and cache grid data

function Grid(path) {
    // pass in a base path to grid data
    // should be data/grid
    this.path = path;
    this.cache = {};
}

Grid.prototype.getUrl = function(lat, lng) {
    return [this.path, lat, lng + '.json'].join('/');
};

Grid.prototype.getTileUrl = function(lat, lng) {
    // get the bottom and left edges of a grid square
    // by rounding to the nearest 2
    lat = Math.floor(lat / 2) * 2;
    lng = Math.floor(lng / 2) * 2;

    return this.getUrl(lat, lng);
};

Grid.prototype.getTile = function(lat, lng, cb) {
    // fetch the actual tile data
    // check cache first
    var url = this.getTileUrl(lat, lng)
      , key = lat + ':' + lng
      , grid = this;

    if (_.has(this.cache, key)) {
        return this.cache[key];
    }

    return jQuery.getJSON(url).success(function(data) {
        grid.cache[key] = data;
        if (_.isFunction(cb)) { cb(data); }
    });
};