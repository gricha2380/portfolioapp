'use strict';

var app = {};
// var __API_URL__ = 'https://portfolioapp2380.firebaseapp.com'; // deployed URL
var __API_URL__ = 'http://localhost:5000'; // local URL
// var chartPoints = [];

// (function(module) {
  // Create the chart
//   chartPoints.forEach(function(data) {
//     Highcharts.stockChart('chartHolder', {
//       rangeSelector: {selected: 1},
//       series: [{name: 'Portfolio Value', data: data, type: 'spline', tooltip: {valueDecimals: 2}}]
//     });
//   });

  console.log('here are chartPoints in chart',chartPoints);
  console.log('point zero',chartPoints.length);

    function runValueCanvas() {
        console.log('this is chartPoints in chart',chartPoints);
        let valCan = document.querySelector('#valueCanvas');
        if (valCan) {
            console.log('valCan is real!')
            // valCan.width =  window.innerWidth;
            valCan.width =  window.innerWidth - 40;
            // valCan.width =  document.querySelector('#overviewChartHolder').offsetWidth;
            // valCan.width = document.querySelector('#overviewChartHolder').getBoundingClientRect().width;
            // valCan.height = window.innerHeight;
            valCan.height = '400';
            console.log('width then height',valCan.width,valCan.height)
            let labelData = chartPoints.map(l => l = l[0]);
            let valueData = chartPoints.map(v => v = v[1]);
            let growthData = chartPoints.map(g => g = g[2]);
            console.log('see labels',labelData)
            let ctx = document.querySelector('#valueCanvas').getContext('2d');
            // ctx.width = window.innerWidth;
            // console.log('canvas width',ctx.width);
            let myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    // labels: ["January", "February", "March", "April", "May"],
                    labels: labelData,
                    datasets: [{
                        type: 'line',
                        label: "Growth",
                        // data: [144.36534, 146.42534, 145.23534, 147.19534, 145],
                        data: growthData,
                        fill: false,
                        borderColor: '#EC932F',
                        backgroundColor: '#EC932F',
                        tension: 0,
                        yAxisID: 'y-axis-2'
                    }, {
                        type: 'line',
                        label: "Value",
                        // data: [22345, 23345, 24345, 25345, 23024],
                        data: valueData,
                        backgroundColor: '#71B37C',
                        yAxisID: 'y-axis-1'
                    }]
                },
                options: {
                    responsive: false,
                    tooltips: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function (t, d) {
                                if (t.datasetIndex === 0) {
                                    return t.yLabel.toFixed(0) + '%';
                                } else if (t.datasetIndex === 1) {
                                    if (t.yLabel.toString().length === 9) {
                                        return Math.round(+t.yLabel.toString().replace(/(\d{3})(.*)/, '$1.$2')) + '%99';
                                    } 
                                    else return '$' + t.yLabel.toString().replace(/(\d{2})(.*)/, '$1.$2');
                                }
                            }
                        }
                    },
                    scales: {
                        yAxes: [{
                            id: "y-axis-1",
                            position: "left",
                            ticks: {
                                // Include a dollar sign in the ticks
                                callback: function(value, index, values) {
                                    //return '$' + value.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                                    return '$' + Math.round(+value.toString().replace(/(\d{2})(.*)/, '$1.$2')) + 'k';
                                }
                            }
                        }, {
                            id: "y-axis-2",
                            position: "right",
                                            ticks: {
                                // Include a dollar sign in the ticks
                                callback: function(value, index, values) {
                                    return value.toFixed(0).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + '%';
                                }
                            }
                        }]
                    }
                }
            });
        }
    }

    function runExchangeCanvas() {
        let exchange = document.querySelector('#exchangeCanvas');
        if (exchange) {
            // exchange.width =  window.innerWidth;
            // exchange.height = window.innerHeight;
            exchange.height = 300;
            exchange.width = 300;
            console.log('exhcnage width & height', exchange.width, exchange.height)
            let labelData = exchangePoints.map(l => l = l[0]);
            let valueData = exchangePoints.map(v => v = v[1]);
            console.log('labelData', labelData)
            console.log('valueData', valueData)
            let exchangeCanvas = {};
            new Chart(exchange.getContext('2d'), {
                type: 'pie',
                data: {
                labels: labelData,
                datasets: [{
                    label: 'Exchange Allocation',
                    backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
                    data: valueData,
                    borderWidth: 0
                }]
                },
                options: {
                title: {
                    display: false,
                    text: 'Exchange Allocation'
                }
                }
            });
        }
    }
// })(app);
//data: [chartPoints[0][2], chartPoints[1][2], chartPoints[2][2], chartPoints[3][2], chartPoints[4][2]],
// data: [chartPoints[0][1], chartPoints[1][1], chartPoints[2][1], chartPoints[3][1], chartPoints[4][1]],