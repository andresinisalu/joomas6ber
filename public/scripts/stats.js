function getStats () {

  let request = new XMLHttpRequest()
  request.open('GET', 'http://freegeoip.net/json/?callback=', true)

  request.onload = function () {
    let data = null
    if (request.status >= 200 && request.status < 400) {
      data = JSON.parse(request.responseText)
      processData(data)
    } else {
      processData(null)
    }
  }

  request.onerror = function () {
    processData(null)
  }
  request.send()
}

function processData (ip_data) {

  /* https://stackoverflow.com/questions/11219582/how-to-detect-my-browser-version-and-operating-system-using-javascript */
  let nAgt = navigator.userAgent
  let browserName = navigator.appName
  let nameOffset, verOffset

  if ((verOffset = nAgt.indexOf('Opera')) !== -1) {
    browserName = 'Opera'
  }
  else if ((verOffset = nAgt.indexOf('MSIE')) !== -1) {
    browserName = 'Microsoft Internet Explorer'
  }
  else if ((verOffset = nAgt.indexOf('Chrome')) !== -1) {
    browserName = 'Chrome'
  }
  else if ((verOffset = nAgt.indexOf('Safari')) !== -1) {
    browserName = 'Safari'
  }
  else if ((verOffset = nAgt.indexOf('Firefox')) !== -1) {
    browserName = 'Firefox'
  }
  else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) <
    (verOffset = nAgt.lastIndexOf('/'))) {
    browserName = nAgt.substring(nameOffset, verOffset)
    if (browserName.toLowerCase() === browserName.toUpperCase()) {
      browserName = navigator.appName
    }
  }

  let OSName = 'Unknown OS'
  if (navigator.appVersion.indexOf('Win') !== -1) OSName = 'Windows'
  if (navigator.appVersion.indexOf('Mac') !== -1) OSName = 'MacOS'
  if (navigator.appVersion.indexOf('X11') !== -1) OSName = 'UNIX'
  if (navigator.appVersion.indexOf('Linux') !== -1) OSName = 'Linux'

  let stats = {
    screenWidth: window.screen.width * window.devicePixelRatio,
    screenHeight: window.screen.height * window.devicePixelRatio,
    date: new Date().toISOString(),
    ip_addr: ip_data != null ? ip_data.ip : null,
    countryName: ip_data != null ? ip_data.country_name : null,
    city: ip_data != null ? ip_data.city : null,
    userAgent: navigator.userAgent,
    OSName,
    browserName,
    endPoint: document.location.pathname
  }

  let xhr = new XMLHttpRequest()
  let url = '/stats/add'
  xhr.open('POST', url, true)
  xhr.setRequestHeader('Content-type', 'application/json')
  xhr.send(JSON.stringify(stats))

}
window.onload = getStats