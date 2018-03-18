google.charts.load('current', { 'packages': ['table'] })

class Counter extends Map {
  constructor (iter, key = null) {
    super()
    this.key = key || (x => x)
    for (let x of iter) {
      this.add(x)
    }
  }

  add (x) {
    x = this.key(x)
    this.set(x, (this.get(x) || 0) + 1)
  }
}

function retrieveStats () {
  let request = new XMLHttpRequest()
  request.open('GET', '/stats/getAll', true)

  request.onload = function () {
    let data = null
    if (request.status >= 200 && request.status < 400) {
      data = JSON.parse(request.responseText)
      drawTable(data)
    } else {
      console.log('Failed to retrieve data!')
    }
  }
  request.onerror = function () {
    console.log('Failed to retrieve data!')
  }
  request.send()
}

function getRandomColor () {
  return '#' + (Math.random().toString(16) + '0000000').slice(2, 8)
}

function createBarChart (stats, attr_name, title) {
  let canvas = document.createElement('canvas')
  canvas.setAttribute('id', 'chart-' + title)

  let counter = null
  if (attr_name === 'resolution') counter = new Counter(stats.map(x => x.screen_width + 'x' + x.screen_height))
else counter = new Counter(stats, x => x[attr_name])

  let barChartData = {
    labels: Array.from(counter.keys()),
    datasets: [{
      label: title,
      fillColor: 'rgba(220,220,220,0.5)',
      strokeColor: 'rgba(220,220,220,0.8)',
      highlightFill: 'rgba(220,220,220,0.75)',
      highlightStroke: 'rgba(220,220,220,1)',
      //backgroundColor: ['red', 'blue', 'green', 'blue', 'red', 'blue'],
      backgroundColor: Array.from(new Array(Array.from(counter.keys()).length), x => getRandomColor()),
  borderWidth: 2,
    data: Array.from(counter.values())
}]
}

  let ctx = canvas.getContext('2d')
  Chart.defaults.global.defaultFontSize = 25;
  if (attr_name === 'ip_addr') {
    window.myBar = new Chart(ctx, {
      type: 'bar',
      data: barChartData,
      options: {
        responsive: true,
        legend: {
          position: 'top',
          display: false
        },
        title: {
          fontSize: 35,
          display: true,
          text: title
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }],
          xAxes: [{
            ticks: {
              callback: function () {
                return null;
              }
            }
          }]
        },
        tooltips: {
          callbacks: {
            label: function (tooltipItem) {
              return tooltipItem.yLabel
            }
          }
        }
      }
    })
  } else {
    window.myBar = new Chart(ctx, {
      type: 'bar',
      data: barChartData,
      options: {
        responsive: true,
        legend: {
          position: 'top',
          display: false
        },
        title: {
          fontSize: 35,
          display: true,
          text: title
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        },
        tooltips: {
          callbacks: {
            label: function (tooltipItem) {
              return tooltipItem.yLabel
            }
          }
        }
      }
    })
  }
  canvas.classList.add('canvasTest')
  document.getElementById('stats_charts').appendChild(canvas)
}

function drawTable (stats) {
  let table = new google.visualization.DataTable()

  table.addColumn('string', 'Date')
  table.addColumn('string', 'IP address')
  table.addColumn('string', 'Endpoint')
  table.addColumn('string', 'OS Name')
  table.addColumn('number', 'Screen width')
  table.addColumn('number', 'Screen height')
  table.addColumn('string', 'Country')
  table.addColumn('string', 'City')
  table.addColumn('string', 'Browser Name')
  table.addColumn('string', 'User agent')


  stats.forEach(stat => table.addRow(
    [
      stat.date,
      stat.ip_addr,
      stat.endpoint,
      stat.os_name,
      stat.screen_width,
      stat.screen_height,
      stat.country_name,
      stat.city,
      stat.browser_name,
      stat.user_agent
    ]
  ))
  let tableDiv = new google.visualization.Table(document.getElementById('stats_table'))
  tableDiv.draw(table, { showRowNumber: true, width: '100%', height: '50%', allowHtml: true })

  createBarChart(stats, 'endpoint', 'Endpoints')
  createBarChart(stats, 'os_name', 'OS')
  createBarChart(stats, 'country_name', 'Countries')
  createBarChart(stats, 'city', 'Cities')
  createBarChart(stats, 'browser_name', 'Browsers')
  createBarChart(stats, 'resolution', 'Resolutions')
  createBarChart(stats, 'ip_addr', 'IP-s')
}

google.charts.setOnLoadCallback(retrieveStats)