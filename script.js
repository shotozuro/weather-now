const boardEl = document.getElementById("board")
const cityEl = document.getElementById("city")
const daysEl = document.getElementById("days")
let days = {}
let arrDays = []
let weather = []

const getDay = (num) => {
  switch (num) {
    case 0 : return "Minggu"
    case 1 : return "Senin"
    case 2 : return "Selasa"
    case 3 : return "Rabu"
    case 4 : return "Kamis"
    case 5 : return "Jumat"
    case 6 : return "Sabtu"
    default : return "day not found"
  }
}

function getWeather () {
  const url = "http://api.openweathermap.org/data/2.5/forecast?q=Yogyakarta&appid=ed91a33b0e8a45877979a7794852a2ac&units=metric"

  fetch(url)
  .then(response => {
    return response.json()
  })
  .then(res => {
    processData(res)
  })
  .catch(err => console.log(err))
}

function processData (data) {
  if (data.cod == 200) {
    data.list.map(val => {
      days[val.dt_txt.substring(0, 10)] = val.weather[0].main
    })
    
    arrDays = Object.keys(days)
    const filteredWeather = arrDays.map(val => {
      return data.list.filter(x => {
        return x.dt_txt.substring(0, 10) == val
      })
    }).map(val => {
      return {
        pagi: filterTime(val, 'pagi'),
        siang: filterTime(val, 'siang'),
        sore: filterTime(val, 'sore'),
        malam: filterTime(val, 'malam'),
      }
    })

    weather = filteredWeather
  }

  function filterTime (array, time) {
    return array.filter(x => {
      const date = new Date(x.dt * 1000)
      const hour = date.getHours()
      if (time == 'pagi') {
        return 6 < hour && hour < 11
      } else if (time == 'siang') {
        return 11 < hour && hour < 14
      } else if (time == 'sore') {
        return 14 < hour && hour < 18
      } else if (time == 'malam') {
        return 18 < hour && hour < 23
      }

    })
  }
  
  render(data)
}

function render (data) {
  if (data.cod != 200) {
    let html = '<div>' + data.message + '</div>'
    boardEl.innerHTML = html
  } else {
    const { city } = data
    cityEl.innerHTML = `<span class="city-name">${city.name}</span> <span class="coord">(${city.coord.lat}, ${city.coord.lon})</span>`
    let html = ""
    
    //RENDER ROW
    arrDays.map(val => {
      const date = new Date(val)
      html += `<div class="list">
        <div class="row-label">${getDay(date.getDay())} ${val}</div>
        <div class="row" id="${val}"></div>
      </div>`
    })
    boardEl.innerHTML = html

    //RENDER COLUMN
    weather.map((val, idx) => {
      let content = ""
      const row = document.getElementById(arrDays[idx])
      // content += val['pagi'].map(x => renderBox(x))
      content += renderBox(val["pagi"][0])
      content += renderBox(val["siang"][0])
      content += renderBox(val["sore"][0])
      content += renderBox(val["malam"][0])

      row.innerHTML = content
    })
  }
}

function renderBox (val2) {
  if (!val2) return `<div class="box"></div>`
  const date = new Date(val2.dt * 1000)
  let hour = date.getHours()
  let min = date.getMinutes()
  if (hour < 10) {
    hour = "0" + hour
  }
  if (min < 10) {
    min = "0" + min
  }
  content = `<div class="box">
  <div style="display: flex; flex-direction: row;">
  <img class="weather-img" src="http://openweathermap.org/img/w/${val2.weather[0].icon}.png" />
  <div class="temperature-avg">${val2.main.temp} &#8451;</div>
  </div>
  <div class="weather-detail">
    <div class="weather">Weather: ${val2.weather[0].description}</div>
    <div class="date">Time: ${hour}:${min}</div>
    <div class="date">Wind speed: ${val2.wind.speed} m/s</div>
    <div class="date">Wind degree: ${val2.wind.deg}</div>
    <div class="temperature">Temperature: ${val2.main.temp_min} - ${val2.main.temp_max} &#8451;</div>
    <div class="temperature">Humidity: ${val2.main.humidity}</div>
  </div>
  </div>`
  return content
}

function renderError (data) {
}

getWeather()