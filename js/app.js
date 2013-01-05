(function() {
var Layer = Backbone.Model.extend({

    defaults: {
        name: "",
        id: "",
        active: false
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
        name: "1992 - 2011",
        slug: "1992-2011",
        active: true
    },
    
    {
        id: "newscientist26102012.1973-1992",
        name: "1973 - 1992",
        slug: "1973-1992"
    },
    {
        id: "newscientist26102012.1953-1972",
        name: "1953 - 1972",
        slug: "1953-1972"
    },
    {
        id: "newscientist26102012.1933-1952",
        name: "1933 - 1952",
        slug: "1933-1952"
    },
    {
        id: "newscientist26102012.1913-1932", 
        name: "1913 - 1932",
        slug: "1913-1932"
    },
    {
        id: "newscientist26102012.1893-1912",
        name: "1893 - 1912",
        slug: "1893-1912"
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
        this.layers.on('change:active', this.setActiveLayer);
        return this.render();
    },

    getActiveLayer: function() {
        return this.layers.find(function(layer) {
            return layer.get('active');
        });
    },

    setActiveLayer: function(layer, active, options) {
        // set other layers false if this one is being set active
        // and do it silently
        if (active) {
            this.layers.chain()
                .filter(function(lyr) { lyr.id !== layer.id; })
                .each(function(lyr) { lyr.set('active', false), { silent: true }});

            this.$el.find('select').val(layer.id);
        }
    },

    setLayer: function(e) {
        var id = $(e.target).val()
          , layer = this.layers.get(id)
          , url = layer.url();

        layer.set('active', true);
        this.app.router.setLayer(layer.get('slug'));
        // this.app.setMapLayer(url);
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
        "click #location" : "locate"
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
        this.router = new MapRouter({ app: this });

        // events
        this.menu.layers.on('change:active', this.setMapLayer);

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
        var map = L.map('map', { worldCopyJump: false })
          , app = this;

        wax.tilejson(url, function(tilejson) {
            _.extend(tilejson, mapOptions);
            app.tilejson = tilejson;
            app.layer = new TileJsonLayer(tilejson);

            map.addLayer(app.layer);
                //.fitWorld();

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
                    if (e.e.type === 'click') {
                        app.e = e;
                        console.time('Redraw');
                        app.highchart.annual.setData(JSON.parse(e.data.annual), false);
                        app.highchart.fiveyear.setData(JSON.parse(e.data.fiveyear), false);
                        app.highchart.redraw();
                        console.timeEnd('Redraw');
                        console.timeEnd('Leaflet click');
                    }
                },
                
                off: function() {}
            });

        this.map.on('click', function(e) {
            app.marker.setLatLng(e.latlng);
            app.marker.addTo(app.map);
            console.time('Leaflet click');
        });
    },

    setMapLayer: function(layer, active, options) {
        var map = this.map
          , app = this
          , url = layer.url();

        wax.tilejson(url, function(tilejson) {
            map.removeLayer(app.layer);

            _.extend(tilejson, mapOptions);
            app.tilejson = tilejson;

            app.layer = new TileJsonLayer(tilejson);
            map.addLayer(app.layer);
        });
    }
});

var MapRouter = Backbone.Router.extend({

    routes: {
        ":layer/:zoom/:lat/:lng" : "setView"
    },

    initialize: function(options) {
        this.app = options.app;
        this.mapEvents();

        return this;
    },

    mapEvents: function() {
        var router = this;
        this.app.map.on('moveend', function(e) {
            var map = e.target
              , c = e.target.getCenter();
            router.navigate(router.getUrl(), { replace: true });
        });
    },

    default: function() {
        var layer = this.app.menu.layers.first()
          , url = [layer.get('slug'), 2, 0, 0].join('/');

        layer.set('active', true);
        this.navigate(url, { replace: true });
    },

    setLayer: function(slug) {
        var view = this.getView();
        view[0] = slug;
        this.navigate(view.join('/'), { trigger: true });
    },

    getUrl: function() {
        return this.getView().join('/');
    },

    getView: function() {
        return [
            this.app.menu.getActiveLayer().get('slug'),
            this.app.map.getZoom(),
            this.app.map.getCenter().lat,
            this.app.map.getCenter().lng
        ];
    },

    setView: function(layer, zoom, lat, lng) {
        // set the active layer to update the menu
        app.menu.layers.find(function(lyr) {
            return lyr.get('slug') === layer;
        }).set('active', true);

        // update the map
        this.app.map.setView([lat, lng], zoom);
    }
})

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
if (!Backbone.history.start()) {
    app.router.default();
}
})();