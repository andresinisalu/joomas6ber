$(document).ready(function () {
  google.charts.load('current', { 'packages': ['table'] })
  google.charts.setOnLoadCallback(retreiveLastDrinks)
  const ctx = document.getElementById('myChart').getContext('2d')

  const cd = new Date()
  const ch = cd.getHours()
  function ct (h) {
    vahemuutuja = new Date()
    vahemuutuja.setHours(vahemuutuja.getHours() + h)
    return vahemuutuja.getHours()
  }

  let drinks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  const muudaHiljem = [ct(-12), ct(-11), ct(-10), ct(-9), ct(-8), ct(-7), ct(-6), ct(-5), ct(-4), ct(-3), ct(-2), ct(-1), ct(0), ct(1), ct(2)
    , ct(3), ct(4), ct(5), ct(6), ct(7), ct(8), ct(9), ct(10), ct(11), ct(12)]

  function retrieveStats () {
    let request = new XMLHttpRequest()
    request.open('GET', '/drinks/listAllConsumed', true)

    request.onload = function () {
      let data = null
      if (request.status >= 200 && request.status < 400) {
        data = JSON.parse(request.responseText)
        parseData(data)
      } else {
        console.log('Failed to retrieve data!')
      }
    }
    request.onerror = function () {
      console.log('Failed to retrieve data!')
    }
    request.send()
  }

  function parseData (data) {
    drinks = drinks.fill(0)
    data.forEach(function (element) {

      const aeg = new Date(element.startdate)
      if (aeg.getDate() > cd.getDate() - 1 || aeg.getDate() < cd.getDate() + 1) {
        let asukoht = parseInt(aeg.getHours())
        let s = drinks[muudaHiljem.indexOf(asukoht)]
        drinks.splice(muudaHiljem.indexOf(asukoht), 1, s + parseInt(element.alcohol_percentage))
        myChart.update()
      }
    })
  }

  // here is the last drinks table
  function retreiveLastDrinks () {
    let request = new XMLHttpRequest()
    request.open('GET', '/drinks/listLastFiveDrinks', true)

    request.onload = function () {
      let data = null
      if (request.status >= 200 && request.status < 400) {
        data = JSON.parse(request.responseText)
        parseLastDrinks(data)
        drawTable()
      } else {
        console.log('Failed to retrieve data!')
      }
    }
    request.onerror = function () {
      console.log('Failed to retrieve data!')
    }
    request.send()
  }

  //TODO korralik slicimine ja kuidagi sorteerida 5 kõige viimast jooki
  function parseLastDrinks (data) {
    const listOfDrinks = data
    listOfDrinks.sort(function (a, b) {
      return new Date(b).getDate() - new Date(a).getDate()
    })
    if (listOfDrinks.length > 5) {
      listOfDrinks.slice(0, 4)
    }

    drawDrinksTable(listOfDrinks)

  }
  //TODO teha see asi resposviviks kuidagi
  function drawDrinksTable (stats) {
    let table = new google.visualization.DataTable()

    table.addColumn('string', 'Name')
    table.addColumn('string', 'Volume')
    table.addColumn('string', '%')
    table.addColumn('string', 'Price')

    stats.forEach(stat => table.addRow(
      [
        stat.name,
        stat.volume.toString(),
        stat.alcohol_percentage.toString(),
        stat.price.toString()

      ]
    ))
    let tableDiv = new google.visualization.Table(document.getElementById('table_div'))
    tableDiv.draw(table, { showRowNumber: true, width: '100%', height: '15%', allowHtml: true })

  }

  retrieveStats()
  retreiveLastDrinks()
  const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: muudaHiljem,
      datasets: [{
        label: '% of alchohol',
        data: drinks,
        backgroundColor: '#8e5ea2',
        borderColor: '#8e5ea2',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    }
  })

  function initWebsockets () {
    const HOST = location.origin.replace(/^http/, 'ws')
    const ws = new WebSocket(HOST)
    ws.onmessage = function (event) {
      let msg = JSON.parse(event.data)
      switch (msg.command) {
        case 'updateDrinks':
          parseData(msg.data)
          parseLastDrinks(msg.data)
          break
      }
    }
  }

  initWebsockets()
})