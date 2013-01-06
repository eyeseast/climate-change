function Geocoder(key) {
    this.key = key;
    this.$ = jQuery;
}

Geocoder.prototype.geocode = function(location, cb) {
    var params = {
        location: location,
        key: this.key
    }

    var url = "http://www.mapquestapi.com/geocoding/v1/address?" + $.param(params);

    return this.$.ajax({
        url: url,
        dataType: 'jsonp',
        success: cb
    });
};

function mapbox_geocode(query, cb) {
    // "http://a.tiles.mapbox.com/v3/newscientist26102012.map-z33q8ey1/geocode/london.json"
    var url = "http://a.tiles.mapbox.com/v3/newscientist26102012.map-z33q8ey1/geocode/" 
        + encodeURIComponent(query).toLowerCase()
        + ".json";

    return jQuery.ajax({
        url: url,
        dataType: "jsonp",
        crossDomain: true,
        cache: true,
        success: cb
    });
}