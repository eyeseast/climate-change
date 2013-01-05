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