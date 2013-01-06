(function() {
var Layer = Backbone.Model.extend({

    defaults: {
        name: "",
        id: "",
        tilejson: {}
    },

    url: function() {
        var ids = ['mapbox.world-light', this.id, 'newscientist26102012.climate-grid'];
        return "http://a.tile.mapbox.com/v3/" + ids + ".jsonp";
    }
});


var LayerSet = Backbone.Collection.extend({
    model: Layer
});

var layers = new LayerSet([
    {
        id: "newscientist26102012.1992-2011",
        name: "1992 - 2011"
    },
    
    {
        id: "newscientist26102012.1973-1992",
        name: "1973 - 1992"
    },
    {
        id: "newscientist26102012.1953-1972",
        name: "1953 - 1972"
    },
    {
        id: "newscientist26102012.1933-1952",
        name: "1933 - 1952"
    },
    {
        id: "newscientist26102012.1913-1932", 
        name: "1913 - 1932"
    },
    {
        id: "newscientist26102012.1893-1912",
        name: "1893 - 1912"
    }
]);

var LayerMenu = Backbone.View.extend({

    el: "#menu",

    events: {
        "change select" : "setLayer"
    },

    initialize: function(options) {
        _.bindAll(this);
        this.app = options.app;
        this.layers = layers;
        return this.render();
    },

    setLayer: function(e) {
        var id = $(e.target).val()
          , layer = this.layers.get(id)
          , url = layer.url();

        this.app.setMapLayer(url);
    },

    render: function() {
        var select = this.$el.find('select').empty();
        this.layers.each(function(layer) {
            var option = $('<option/>')
                .attr('value', layer.get('id'))
                .text(layer.get('name'))
                .appendTo(select);
        });

        return this;
    }
});

var mapOptions = {
    minzoom: 2,
    maxzoom: 6,
    unloadInvisibleTiles: true
}

var App = Backbone.View.extend({

    el: 'body',

    events: {
        "click   #location" : "locate",
        "submit  form"      : "geocode"
    },

    initialize: function(options) {
        _.bindAll(this);

        // create big moving parts
        this.cache = { hits: 0, misses: 0 };
        this.highchart = localChart('local-chart');
        this.globalchart = globalChart('global-chart');
        this.menu = new LayerMenu({ app: this });
        this.map = this.createMap(this.menu.layers.first().url(), this.setupMap);
        this.marker = L.marker([0,0], { clickable: false });

        return this;
    },

    getset: function(data, field) {
        // get or set cache for a location
        var key = data.lng_id + ':' + data.lat_id + ':' + field;
        if (_.has(this.cache, key)) {
            this.cache.hits++;
            return this.cache[key];
        } else {
            this.cache.misses++;
            this.cache[key] = JSON.parse(data[field]);
            return this.cache[key];
        }
    },

    geocode: function(e) {
        e.preventDefault();

        var query = this.$('#search').find('input').val()
          , app = this;

        if ($.trim(query)) {
            mapbox_geocode(query, function(resp) {
                // window.resp = resp;
                if (resp.results) {
                    var loc = resp.results[0][0];
                    app.setView(loc.lat, loc.lon, null, e);                    
                }
            });
        }
        return false;
    },

    locate: function(e) {
        if (e) e.preventDefault();

        var app = this;
        app.map.locate()
            .on('locationfound', function(e) {
                app.setView(e.latlng.lat, e.latlng.lng, null, e);
            });
    },

    setView: function(lat, lng, zoom, e) {
        zoom = (zoom || this.map.getMaxZoom());
        e = (e || { type: 'click' });
        var c = L.latLng([lat, lng]);
        this.marker.setLatLng(c);
        this.marker.addTo(this.map);
        this.map.setView(c, zoom);

        // fake a click
        e.trigger = true;
        this.interaction.click(e, this.map.latLngToLayerPoint(c));

        return this;
    },

    createMap: function(url, cb) {
        var map = L.map('map', { worldCopyJump: false })
          , app = this;

        wax.tilejson(url, function(tilejson) {
            _.extend(tilejson, mapOptions);
            app.tilejson = tilejson;
            app.layer = new TileJsonLayer(tilejson);
            var c = tilejson.center;
            map.addLayer(app.layer)
                .setView([c[1], c[0]], 2);

            // put zoom controls in the upper right
            // map.zoomControl.setPosition('topright');

            if (_.isFunction(cb)) cb(map, tilejson);
        });

        // return the map immediately
        return map;
    },

    plot: function(e) {
        console.time('Redraw');
        this.highchart.annual.setData(JSON.parse(e.data.annual), false);
        this.highchart.fiveyear.setData(JSON.parse(e.data.fiveyear), false);
        this.highchart.redraw();
        // console.log([e.data.lat_id, e.data.lng_id]);
        console.timeEnd('Redraw');
    },

    setupMap: function(map, tilejson) {
        var app = this;

        this.interaction = wax.leaf.interaction()
            .map(map)
            .tilejson(tilejson)
            .on({
                
                on: function(e) {
                    if (e.e.trigger) {
                        app.e = e;
                        app.plot(e);
                        console.timeEnd('Leaflet click');
                    }

                    if (L.Browser.touch) {
                        app.e = e;
                        console.log(e.e.type);
                    }
                },
                
                off: function() {}
            });

        this.map.on('click', function(e) {
            app.marker.setLatLng(e.latlng);
            app.marker.addTo(app.map);

            // hack to get touch events to work
            // and force chrome to use the right location
            e.trigger = true;
            // console.log(e);
            app.interaction.click(e, e.layerPoint);
            console.time('Leaflet click');
        });

        _.defer(this.setView, 0, 0, 2);

    },

    setMapLayer: function(url) {
        var map = this.map
          , app = this;

        wax.tilejson(url, function(tilejson) {
            map.removeLayer(app.layer);

            _.extend(tilejson, mapOptions);
            app.tilejson = tilejson;

            app.layer = new TileJsonLayer(tilejson);
            map.addLayer(app.layer);
        });
    }
});

var TileJsonLayer = L.TileLayer.extend({
    initialize: function(options) {
        options = options || {};
        options.minZoom = options.minzoom || 0;
        options.maxZoom = options.maxzoom || 22;
        var tile_url = options.tiles[0].replace('a.tiles', '{s}.tiles');
        L.TileLayer.prototype.initialize.call(this, tile_url, options);
    }
})


// when all is ready, create the app
window.app = new App();
})();