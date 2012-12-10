var chart;
jQuery(function($) {

    Highcharts.setOptions({
        chart: {
            style: {
                fontFamily: 'Arial',
                fontWeight: '400',
                fontSize: '10pt'
            }
        }
    });
     
    chart = new Highcharts.Chart({
        chart: {
            renderTo: 'chart',
            type: 'line',
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: false
        },
        title: {
            text: null
        },
        
        xAxis: {
            type: 'datetime',
            lineColor: '#cccccc',
            tickColor: '#cccccc',
            labels: {
                formatter: function() {
                    return Highcharts.dateFormat('%Y', this.value);
                },
                step: 2,
                overflow: 'justify',
                y: 20,
                style: {
                    color: '#000000',
                    fontSize: '8pt',
                    fontWeight: '400' 
                },
            },
            title: {
                text: null
            },
        },
        
        yAxis: {
            max: 3,
            min:-3,
            tickInterval: 1,
            lineColor: '#cccccc',
            lineWidth: 1,
            title: {
                text: 'Difference from 1951-1980 average (°C)',
                style: {
                    color: '#000000',
                    fontSize: '9pt',
                    fontWeight: '400'
                }
            },
            labels: {
                formatter: function() {
                    return this.value; // clean, unformatted number for ice extent
                },
                style: {
                    color: '#000000',
                    fontSize: '9pt',
                    fontWeight: '400'
                },
                y: 6
            }
        },
        
        title: {
            text: 'Global average temperature',
            align: 'center',
            x: 18,
            style: {
                color: '#000000',
                fontSize: '14px',
                fontWeight: '400',
            }
        },
        
        labels: {
            items: [{
                html: 'Five-year average',
                style: {
                    top: '160px',
                    left: '20px',
                    color: '#b22222'
                },
            }]
        },
        
        plotOptions: {
            series: {
                animation: false,
                shadow: false,
                marker: {
                    enabled: false
                    },
                states: {
                    hover: {
                        enabled: false
                    }
                }       
            }
        },
        
        tooltip: {
                backgroundColor: 'white',
                style: {
                   fontWeight: '400',
                   fontSize: '10pt'
                }, 
                xDateFormat: '<strong>%Y</strong><br>',
                shared: true,
                borderWidth: 0,
                valueDecimals: 2,
                valueSuffix: ' °C'
        },
                          
        series: [{
            name: 'Annual average',
            data: [-0.33,-0.24,-0.29,-0.31,-0.34,-0.33,-0.3,-0.37,-0.29,-0.19,-0.42,-0.3,-0.35,-0.35,-0.37,-0.28,-0.2,-0.17,-0.31,-0.19,-0.12,-0.18,-0.29,-0.33,-0.38,-0.28,-0.23,-0.43,-0.37,-0.37,-0.37,-0.38,-0.35,-0.34,-0.18,-0.12,-0.31,-0.4,-0.35,-0.22,-0.22,-0.17,-0.27,-0.24,-0.24,-0.19,-0.04,-0.17,-0.15,-0.29,-0.11,-0.04,-0.1,-0.22,-0.1,-0.15,-0.08,0.04,0.08,-0.01,0.02,0.08,0.01,0.08,0.18,0.05,-0.07,-0.01,-0.05,-0.07,-0.17,-0.05,0.01,0.09,-0.11,-0.11,-0.19,0.08,0.08,0.05,-0.01,0.07,0.04,0.08,-0.21,-0.12,-0.03,0,-0.04,0.08,0.03,-0.1,0,0.14,-0.07,-0.03,-0.15,0.14,0.03,0.11,0.2,0.27,0.06,0.27,0.1,0.06,0.13,0.28,0.33,0.21,0.37,0.36,0.14,0.15,0.25,0.4,0.3,0.42,0.59,0.34,0.36,0.49,0.58,0.57,0.49,0.62,0.56,0.59,0.44,0.57,0.63,0.51,null],
            pointStart: Date.UTC(1880, 6, 1),
            pointInterval: 365.25 * 24 * 3600 * 1000,// one year
            color: '#808080',
            lineWidth: 1
        }, 

        {
            name: 'Five-year average',
            data: [null,null,-0.3,-0.3,-0.32,-0.33,-0.33,-0.3,-0.31,-0.31,-0.31,-0.32,-0.35,-0.33,-0.31,-0.27,-0.27,-0.23,-0.2,-0.19,-0.22,-0.22,-0.26,-0.29,-0.3,-0.33,-0.34,-0.34,-0.35,-0.38,-0.37,-0.36,-0.32,-0.27,-0.26,-0.27,-0.27,-0.28,-0.3,-0.27,-0.25,-0.22,-0.23,-0.22,-0.2,-0.18,-0.16,-0.17,-0.15,-0.15,-0.14,-0.15,-0.11,-0.12,-0.13,-0.1,-0.04,-0.02,0.01,0.04,0.04,0.04,0.07,0.08,0.05,0.05,0.02,-0.03,-0.07,-0.07,-0.07,-0.04,-0.05,-0.04,-0.06,-0.05,-0.05,-0.02,0,0.05,0.05,0.04,-0.01,-0.03,-0.05,-0.06,-0.08,-0.02,0.01,-0.01,-0.01,0.03,0,-0.01,-0.02,0.01,-0.02,0.02,0.07,0.15,0.14,0.18,0.18,0.15,0.13,0.17,0.18,0.2,0.26,0.31,0.28,0.24,0.25,0.26,0.25,0.3,0.39,0.41,0.4,0.44,0.47,0.47,0.5,0.55,0.56,0.57,0.54,0.56,0.56,0.55,null,null,null],   
            pointStart: Date.UTC(1880, 6, 1),
            pointInterval: 365.25 * 24 * 3600 * 1000, // one year
            color: '#b22222'
        }]
                   
    });
    
    window.annual = chart.series[0];
});
