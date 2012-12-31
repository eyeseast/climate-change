var chart;
jQuery(function($) {

    var colors = {
        global5: '#b22222',
        local5 : '#2b2b2b',
        local1 : '#808080'
    }

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
            max: 3.5,
            min:-3.5,
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
            items: [
            {
                html: 'Five-year global average',
                style: {
                    top: '210px',
                    left: '20px',
                    color: colors.global5
                }
            },
            {
                html: 'Local five-year average',
                style: {
                    top: '190px',
                    left: '20px',
                    color: colors.local5
                }
            },
            {
                html: 'Local annual average',
                style: {
                    top: '170px',
                    left: '20px',
                    color: colors.local1
                }
            }
            ]
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
            data: GLOBAL_ONE_YEAR,
            pointStart: Date.UTC(1880, 6, 1),
            pointInterval: 365.25 * 24 * 3600 * 1000,// one year
            color: colors.local1, // '#808080',
            lineWidth: 1
        },

        // local five-year
        {
            name: 'Five-year average',
            data: GLOBAL_ONE_YEAR,
            pointStart: Date.UTC(1880, 6, 1),
            pointInterval: 365.25 * 24 * 3600 * 1000,// one year
            color: colors.local5, // '#2b2b2b',
            lineWidth: 1.5
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
    
    window.annual = chart.series[0];
    window.fiveyear = chart.series[1];
});
