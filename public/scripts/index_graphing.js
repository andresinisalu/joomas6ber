let globalDrinkData = null // Very ugly hack, needs to be refactored away

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

  let drinks = new Array(24).fill(0)
  const muudaHiljem = Array.from(new Array(25), (val, index) => ct(index - 12))

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
    globalDrinkData = data
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

  function clearLocalStorage () {
    let url = $('#addDrinkForm').attr('action')
    let drinks = JSON.parse(localStorage.getItem('drinks'))
    let notAdded = []
    if (drinks !== null) {
      drinks.forEach((drink) => {
        $.post(url, drink)
          .done((data) => alert('Added a drink from localStorage to server.'))
          .fail((xhr, status, error) => {
            notAdded.push(drink)
            alert('Still couldn\'t add a drink from localStorage to server.')
          })
      })
    }
    localStorage.setItem('drinks', JSON.stringify(notAdded))
  }

  initWebsockets()
  clearLocalStorage()

  $('#addDrinkForm').submit(function (event) {
    event.preventDefault()
    let url = $(this).attr('action')
    let drink = {
      name: $('#nameInput').val(),
      startdate: new Date($('#startDateInput').val()).toISOString(),
      enddate: new Date($('#endDateInput').val()).toISOString(),
      alcohol_percentage: $('#alcoholPercentageInput').val(),
      price: parseFloat($('#priceInput').val()),
      volume: parseFloat($('#volumeInput').val()),
      filename: $('#fileInput').val()
    }
    $.post(url, drink)
      .done((data) => {
        alert('Successfully added a drink!')
      })
      .fail((xhr, status, error) => {
        alert('Couldn\'t add a drink, will be using localStorage.')
        let drinks = JSON.parse(localStorage.getItem('drinks'))
        if (drinks === null) drinks = []
        drinks.push(drink)
        localStorage.setItem('drinks', JSON.stringify(drinks))
        globalDrinkData.push(drink)
        parseData(globalDrinkData)
      })
  })
})