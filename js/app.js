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

var App = Backbone.View.extend({

    events: {
        "click #location" : "locate"
    },

    initialize: function(options) {
        _.bindAll(this);
        this.setElement('body');

        // create big moving parts
        this.highchart = createChart();
        this.grid = new Grid();
        this.map = this.createMap(url, this.setupMap);

    },

    setupEvents: function() {
        // setup events
        var chart = this.highchart;

        // re-render chart when lat or lng changes
        this.grid.on('change:lat_id', this.plot);
        this.grid.on('change:lng_id', this.plot);

        // redraw the chart on zoom (chasing a weird bug)
        this.map.on('zoomend', function() {
            chart.redraw();
        });

    },

    locate: function(e) {
        e.preventDefault();
        console.log('Clicked locate');
    },

    plot: function() {
        var annual = this.highchart.annual
          , fiveyear = this.highchart.fiveyear;

        annual.setData(this.grid.get('annual'), true);
        fiveyear.setData(this.grid.get('fiveyear'), true);
    },

    createMap: function(url, cb) {
        var map = L.map('map');
        wax.tilejson(url, function(tilejson) {
            // template = _.template($('#template').html());

            tilejson.minzoom = 0;
            tilejson.maxzoom = 7;
            map.addLayer(new wax.leaf.connector(tilejson))
                .fitWorld();

            // put zoom controls in the upper right
            map.zoomControl.setPosition('topright');

            if (_.isFunction(cb)) cb(map, tilejson);
        });

        // return the map immediately
        return map;
    },

    setupMap: function(map, tilejson) {
        var grid = this.grid
          , app = this;

        // this.map = map;

        this.interaction = wax.leaf.interaction()
            .map(map)
            .tilejson(tilejson)
            .on({
                
                on: function(e) {
                    grid.set({
                        lat_id: e.data.lat_id,
                        lng_id: e.data.lng_id,
                        latest: e.data.latest,
                        annual: JSON.parse(e.data.annual),
                        fiveyear: JSON.parse(e.data.fiveyear)
                    });
                },
                
                off: function() {}
            });

        // when we're done, fire a ready event
        this.trigger('mapready');
    }
})


// when all is ready, create the app
var app = new App();