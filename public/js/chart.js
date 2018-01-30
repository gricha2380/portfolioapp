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

//   if (document.querySelector('#valueCanvas')) {
    //   let valueCanvas = {};
    //   valueCanvas.options = {
    //     type: 'line',
    //     data: {
    //       labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    //       datasets: [
    //         {
    //           label: 'Growth',
    //           data: [12, 19, 3, 5, 2, 3],
    //           borderWidth: 0,
    //           fill: false,
    //           borderColor: '#0090FF'
    //         },
    //         {
    //           label: 'Value',
    //           data: [20000, 21000, 20500, 20100, 19000, 20500],
    //           borderWidth: 1,
    //           backgroundColor: 'rgba(15,253,200,.2)'
    //         }
    //       ]
    //     },
    //     options: {
    //       scales: {
    //         yAxes: [{
    //           ticks: {
    //             reverse: false
    //           }
    //         }]
    //       },
    //       tooltips: {
    //         mode: 'x',
    //         intersect: false
    //       },
    //       hover: {
    //         mode: 'x',
    //         intersect: false
    //       },
    //     }
    //   };
    //   valueCanvas.src = document.querySelector('#valueCanvas').getContext('2d');
    //   new Chart(valueCanvas.src,valueCanvas.options);

//     if (document.querySelector('#valueCanvas')) {
//         let labelData = chartPoints.map(l => l = l[0]);
//         console.log('see labels',labelData)
//         let ctx = document.querySelector('#valueCanvas').getContext('2d');
//         let myChart = new Chart(ctx, {
//             type: 'bar',
//             data: {
//                 // labels: ["January", "February", "March", "April", "May"],
//                 labels: labelData,
//                 datasets: [{
//                     type: 'line',
//                     label: "Growth",
//                     data: [144.36534, 146.42534, 145.23534, 147.19534, 145],
//                     fill: false,
//                     borderColor: '#EC932F',
//                     backgroundColor: '#EC932F',
//                     tension: 0,
//                     yAxisID: 'y-axis-2'
//                 }, {
//                     type: 'line',
//                     label: "Value",
//                     data: [22345, 23345, 24345, 25345, 23024],
//                     backgroundColor: '#71B37C',
//                     yAxisID: 'y-axis-1'
//                 }]
//             },
//             options: {
//                 responsive: false,
//                 tooltips: {
//                     mode: 'index',
//                     intersect: false,
//                     callbacks: {
//                         label: function (t, d) {
//                             if (t.datasetIndex === 0) {
//                                 return t.yLabel.toFixed(0) + '%';
//                             } else if (t.datasetIndex === 1) {
//                                 if (t.yLabel.toString().length === 9) {
//                                     return Math.round(+t.yLabel.toString().replace(/(\d{3})(.*)/, '$1.$2')) + '%99';
//                                 } else return Math.round(+t.yLabel.toString().replace(/(\d{2})(.*)/, '$1.$2')) + 'k';
//                             }
//                         }
//                     }
//                 },
//                 scales: {
//                     yAxes: [{
//                         id: "y-axis-1",
//                         position: "left",
//                         ticks: {
//                             // Include a dollar sign in the ticks
//                             callback: function(value, index, values) {
//                                 //return '$' + value.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
//                                 return '$' + Math.round(+value.toString().replace(/(\d{2})(.*)/, '$1.$2')) + 'k';
//                             }
//                         }
//                     }, {
//                         id: "y-axis-2",
//                         position: "right",
//                                         ticks: {
//                             // Include a dollar sign in the ticks
//                             callback: function(value, index, values) {
//                                 return value.toFixed(0).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + '%';
//                             }
//                         }
//                     }]
//                 }
//             }
//         });
//   }
    function runValueCanvas() {
        if (document.querySelector('#valueCanvas')) {
            let labelData = chartPoints.map(l => l = l[0]);
            console.log('see labels',labelData)
            let ctx = document.querySelector('#valueCanvas').getContext('2d');
            let myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    // labels: ["January", "February", "March", "April", "May"],
                    labels: labelData,
                    datasets: [{
                        type: 'line',
                        label: "Growth",
                        data: [144.36534, 146.42534, 145.23534, 147.19534, 145],
                        fill: false,
                        borderColor: '#EC932F',
                        backgroundColor: '#EC932F',
                        tension: 0,
                        yAxisID: 'y-axis-2'
                    }, {
                        type: 'line',
                        label: "Value",
                        data: [22345, 23345, 24345, 25345, 23024],
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
                                    } else return Math.round(+t.yLabel.toString().replace(/(\d{2})(.*)/, '$1.$2')) + 'k';
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

  if (document.querySelector('#exchangeCanvas')) {
    let exchangeCanvas = {};
    new Chart(document.querySelector('#exchangeCanvas'), {
        type: 'pie',
        data: {
          labels: ['Gdax','Bittrex','Etrade','Merrill Edge','Gemini'],
          datasets: [{
            label: 'Exchange Allocation',
            backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
            data: [2478,5267,734,784,433],
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

// })(app);
//data: [chartPoints[0][2], chartPoints[1][2], chartPoints[2][2], chartPoints[3][2], chartPoints[4][2]],
// data: [chartPoints[0][1], chartPoints[1][1], chartPoints[2][1], chartPoints[3][1], chartPoints[4][1]],