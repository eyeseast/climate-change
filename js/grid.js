// fetch and cache grid data
;(function(window) {
function Grid(path) {
    // pass in a base path to grid data
    // should be data/grid
    this.path = path;
    this.cache = { hits: 0, misses: 0 };

    _.bindAll(this);
}

Grid.prototype.getUrl = function(lat, lng) {
    return [this.path, lat, lng + '.json'].join('/');
};

Grid.prototype.getTileUrl = function(lat, lng) {
    // get the bottom and left edges of a grid square
    // by rounding to the nearest 2
    lat = Math.floor(lat / 2) * 2;
    lng = Math.floor(lng / 2) * 2;

    // this makes me worry about my math
    if (lng >= 180) { lng -= 180; }
    if (lng < -180) { lng += 180; }
    
    return this.getUrl(lat, lng);
};

Grid.prototype.getTile = function(lat, lng, cb) {
    // fetch the actual tile data
    // check cache first
    var url = this.getTileUrl(lat, lng)
      , grid = this;

    if (_.has(this.cache, url)) {
        if (_.isFunction(cb)) { cb(null, this.cache[url]); }
        this.cache.hits++;
        return this.cache[url];
    }
    this.cache.misses++;
    return jQuery.ajax({
        url: url,
        success: function(data) {
            grid.cache[url] = data;
            if (_.isFunction(cb)) { cb(null, data); }
        },

        error: function(jqxhr, mgs, err) {
            if (_.isFunction(cb)) { cb(err, null); }
        }
    });
};

window.Grid = Grid;
})(window);
