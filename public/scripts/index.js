let drinks = null

$(document).ready(function () {

  $('#sidebarCollapse').on('click', function () {
    $('#sidebar').toggleClass('active')
  })

  $.get('/drinks/getAllAvailable', function (data) {
    drinks = data
    data.forEach(drink => $('#drinkSelection').append('<option data-value=\' ' + drink.id + '\' value=\'' + drink.name + ' (' + drink.volume + ' ml)' + '\'>'))
  })

  $.get('/drinks/totalConsumed', function (data) {
    console.log('User has consumed ' + data.total + ' drink(s).')
  })
  $.get('/drinks/listAllConsumed', function (data) {
    console.log('Consumed drinks: ')
    data.forEach(x => console.log(x.name + ' (' + x.volume + ' ml) ' + x.price + '€'))
  })

  $('#startDateInput').val(new Date().toDateInputValue())
  $('#endDateInput').val(new Date().addMinutes(30).toDateInputValue())
})

function selectDrink (selected_drink) {
  let drink = drinks.filter(x => selected_drink.value.split(' ')[0] === x.name)[0]
  if (drink) {
    $('#volumeInput').val(drink.volume)
    $('#priceInput').val(drink.price)
    $('#drinkId').val(drink.id)
    $('#alcoholPercentageInput').val(drink.alcohol_percentage)
    $('#startDateInput').val(new Date().toDateInputValue())
    $('#endDateInput').val(new Date().addMinutes(30).toDateInputValue())
    $('#nameInput').val(drink.name)
  }
}

Date.prototype.toDateInputValue = function () {
  let local = new Date(this)
  local.setMinutes(this.getMinutes() - this.getTimezoneOffset())
  return local.toJSON().slice(0, 16)
}

Date.prototype.addMinutes = function (min) {
  this.setTime(this.getTime() + (min * 60 * 1000))
  return this
}