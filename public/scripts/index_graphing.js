
$( document ).ready(function() {
  const ctx = document.getElementById('myChart').getContext('2d')

  const cd = new Date()
  const ch = cd.getHours();
  let drinks = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]

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
    data.forEach(function(element) {
      console.log(element)
      const aeg = new Date(element.startdate)
      console.log(cd.getDate())
      if(aeg.getDate() > cd.getDate() - 1 || aeg.getDate() < cd.getDate() + 1){
        let asukoht = parseInt(aeg.getHours())
        let s = drinks[asukoht]
        console.log('jook joodi: ', aeg.getHours())
        drinks.splice(aeg.getHours()-1, 1, s+parseInt(element.alcohol_percentage))
        console.log(drinks)
        myChart.update()
      }
    });
  }

retrieveStats();
const myChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: [ch-12 , ch-11, ch-10, ch-9, ch-8, ch-7, ch-6, ch-5, ch-4, ch-3, ch-2, ch-1, "right now" + ch, ch+1 , ch+2, ch+3, ch+4, ch+5, ch+6, ch+7, ch+8, ch+9, ch+10, ch+11, ch+12],
    datasets: [{
      label: '% of alchohol',
      data: drinks,
      backgroundColor: "#8e5ea2",
      borderColor: "#8e5ea2",
      borderWidth: 1
    }]
  },
  options: {
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero:true
        }
      }]
    }
  }
});


});