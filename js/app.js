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
    unloadInvisibleTiles: false
}

var App = Backbone.View.extend({

    el: 'body',

    events: {
        "click #location" : "locate"
    },

    initialize: function(options) {
        _.bindAll(this);

        // create big moving parts
        this.cache = { hits: 0, misses: 0 };
        this.highchart = createChart();
        this.menu = new LayerMenu({ app: this });
        this.map = this.createMap(this.menu.layers.first().url(), this.setupMap);

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

    locate: function(e) {
        e.preventDefault();

        var map = this.map;
        map.locate({ setView: true });

        // this is mostly here for debugging
        map.on('locationfound', function(e) {
            L.marker(e.latlng, { radius: e.accuracy / 2 })
                .addTo(map)
                .bindPopup('You are here.');
        });
    },

    createMap: function(url, cb) {
        var map = L.map('map')
          , app = this;

        wax.tilejson(url, function(tilejson) {
            _.extend(tilejson, mapOptions);
            app.tilejson = tilejson;
            app.layer = new TileJsonLayer(tilejson);

            map.addLayer(app.layer)
                .fitWorld();

            // put zoom controls in the upper right
            map.zoomControl.setPosition('topright');

            if (_.isFunction(cb)) cb(map, tilejson);
        });

        // return the map immediately
        return map;
    },

    setupMap: function(map, tilejson) {
        var app = this;

        this.interaction = wax.leaf.interaction()
            .map(map)
            .tilejson(tilejson)
            .on({
                
                on: function(e) {
                    app.highchart.annual.setData(app.getset(e.data, 'annual'));
                    app.highchart.fiveyear.setData(app.getset(e.data, 'fiveyear'));
                },
                
                off: function() {}
            });

        // when we're done, fire a ready event
        this.trigger('mapready');
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