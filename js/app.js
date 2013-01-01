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

    initialize: function(options) {
        _.bindAll(this);
        this.highchart = createChart();
        this.grid = new Grid();
        this.grid.on('change:lat_id', this.redrawMap);
        this.grid.on('change:lng_id', this.redrawMap);

        createMap(url, this.setupMap);
    },

    redrawMap: function() {
        var annual = this.highchart.annual
          , fiveyear = this.highchart.fiveyear;

        annual.setData(this.grid.get('annual'), true);
        fiveyear.setData(this.grid.get('fiveyear'), true);
    },

    setupMap: function(map, tilejson) {
        var grid = this.grid
          , app = this;

        this.map = map;

        this.interaction = wax.leaf.interaction()
            .map(map)
            .tilejson(tilejson)
            .on({
                
                on: function(e) {
                    var data = window.data = e.data;

                    if (data.annual) {
                        var annual = JSON.parse(data.annual)
                          , fiveyear = JSON.parse(data.fiveyear);

                        /**
                        annual.setData(temps, true);
                        fiveyear.setData(fives, true);
                        **/
                        grid.set({
                            lat_id: data.lat_id,
                            lng_id: data.lng_id,
                            annual: annual,
                            fiveyear: fiveyear
                        });
                    }
                },
                
                off: function(e) {}
            });
    }
})

function createMap(url, cb) {
    wax.tilejson(url, function(tilejson) {
        // template = _.template($('#template').html());

        tilejson.minzoom = 0;
        tilejson.maxzoom = 7;
        var map = L.map('map')
            .addLayer(new wax.leaf.connector(tilejson))
            .fitWorld();

        // put zoom controls in the upper right
        map.zoomControl.setPosition('topright');

        if (_.isFunction(cb)) cb(map, tilejson);
    });
}

// when all is ready, create the app
var app = new App();