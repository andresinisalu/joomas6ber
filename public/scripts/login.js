var quote = document.getElementById('randomQuote')

var quotes = ['Joomasõber taskus', 'Ta ei jäta sind kunagi', 'Alati sinu kõrva', "Igavesti koos", "Parem kui oma naine", "Sellist sõpra ei leia sa enam"]

setInterval(function () {
  var random = Math.floor(Math.random() * quotes.length)
  quote.innerHTML = quotes[random]
}, 10000)
