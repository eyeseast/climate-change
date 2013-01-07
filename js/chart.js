var colors = {
    global5: '#b22222',
    local1 : '#808080'
};

Highcharts.setOptions({
    chart: {
        style: {
            fontFamily: 'Arial',
            fontWeight: '400',
            fontSize: '10pt'
        }
    }
});

function localChart(container) {
     
    var chart = new Highcharts.Chart({
        chart: {
            renderTo: container,
            type: 'line'
        },

        credits: {
            enabled: false
        },
        
        legend: {
            enabled: false
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
                }
            },
            title: {
                text: null
            }
        },
        
        yAxis: {
            max: 5,
            min:-5,
            tickInterval: 1,
            lineColor: '#cccccc',
            lineWidth: 1,
            title: {
                text: 'Difference from 1951-1980 average (°C)',
                align: 'low',
                style: {
                    color: '#000000',
                    fontSize: '10pt',
                    fontWeight: '800'
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
            text: 'At this location',
            align: 'center',
            x: 18,
            style: {
                     color: '#000000',
                     fontSize: '14px',
                     fontWeight: '900'
                }
        },
        
        labels: {
                items: [{
                    html: 'Five-year average',
                    style: {
                        top: '260px',
                        left: '105px',
                        color: '#b22222'
                     }
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
                          
        series: [
        // local annual
        {
            name: 'Annual average',
            data: [],// GLOBAL_ONE_YEAR,
            pointStart: Date.UTC(1880, 6, 1),
            pointInterval: 365.25 * 24 * 3600 * 1000,// one year
            color: colors.local1, // '#808080',
            lineWidth: 1
        },

        // local five-year
        {
            name: 'Five-year average',
            data: [],//GLOBAL_FIVE_YEAR,
            pointStart: Date.UTC(1880, 6, 1),
            pointInterval: 365.25 * 24 * 3600 * 1000,// one year
            color: colors.global5, // '#2b2b2b',
            lineWidth: 1.5
        }
        ]
    });
    
    chart.annual = chart.series[0];
    chart.fiveyear = chart.series[1];

    return chart;
}

function globalChart(container) {
    var chart = new Highcharts.Chart({
        chart: {
            renderTo: container,
            type: 'line'
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: false
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
                }
                      
            },              
                title: {
                text: null
            }
        },
        
        yAxis: {
            max: 1,
            min:-1,
            tickInterval: 1,
            lineColor: '#cccccc',
            lineWidth: 1,
            title: {
                text: 'title',
                style: {
                     color: '#ffffff',
                     fontSize: '9pt',
                     fontWeight: '400'
                }
            },
            labels: {
                formatter: function() {
                    return this.value; // clean, unformatted number
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
            text: 'Global average',
            align: 'center',
            x: 18,
            style: {
                     color: '#000000',
                     fontSize: '14px',
                     fontWeight: '900'
                }
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
                          
        series: [
        {
            name: 'Annual average',
            data: GLOBAL_ONE_YEAR,
            pointStart: Date.UTC(1880, 6, 1),
            pointInterval: 365.25 * 24 * 3600 * 1000,// one year
            color: colors.local1, // '#808080',
            lineWidth: 1
        },         

        // global five-year
        {
            name: 'Five-year global average',
            data: GLOBAL_FIVE_YEAR,   
            pointStart: Date.UTC(1880, 6, 1),
            pointInterval: 365.25 * 24 * 3600 * 1000, // one year
            color: colors.global5 // '#b22222'
        }
        ]
                   
    });

    return chart;
}
