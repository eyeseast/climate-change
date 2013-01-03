var url = "http://a.tiles.mapbox.com/v3/newscientist26102012.climate-prototype.jsonp";

var Grid = Backbone.Model.extend({

    defaults: {
        lat_id: null,
        lng_id: null,
        annual: [],
        fiveyear: []
    },

    initialize: function(attributes, options) {
        this.on('change:lat_id', this.setId)
        this.on('change:lng_id', this.setId)
    },

    setId: function() {
        var id = this.get('lng_id') + ':' + this.get('lat_id');
        this.set({ id: id });
    }
});

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

var App = Backbone.View.extend({

    events: {
        "click #location" : "locate"
    },

    initialize: function(options) {
        _.bindAll(this);
        this.setElement('body');

        // create big moving parts
        this.highchart = createChart();
        this.menu = new LayerMenu({ app: this });
        this.map = this.createMap(this.menu.layers.first().url(), this.setupMap);

        return this;
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

    plot: function() {
        var annual = this.highchart.annual
          , fiveyear = this.highchart.fiveyear;

        annual.setData(this.grid.get('annual'), true);
        fiveyear.setData(this.grid.get('fiveyear'), true);
    },

    createMap: function(url, cb) {
        var map = L.map('map')
          , app = this;

        wax.tilejson(url, function(tilejson) {
            tilejson.minzoom = 2;
            tilejson.maxzoom = 6;
            app.tilejson = tilejson;
            app.layer = new wax.leaf.connector(tilejson);

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
                    app.highchart.annual.setData(JSON.parse(e.data.annual));
                    app.highchart.fiveyear.setData(JSON.parse(e.data.fiveyear));
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

            app.tilejson = tilejson;
            tilejson.minzoom = 2;
            tilejson.maxzoom = 6;

            app.layer = new wax.leaf.connector(tilejson);
            map.addLayer(app.layer);
        });
    }
})


// when all is ready, create the app
var app = new App();