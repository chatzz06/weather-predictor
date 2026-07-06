const weatherCodes = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Cloudy',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Rain showers',
  81: 'Heavy rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm'
};

let currentTimeZone = 'Europe/London';
let timerId = null;

function formatLocalTime(timeZone) {
  return new Date().toLocaleString('en-US', {
    timeZone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function updateTime() {
  const timeEl = document.getElementById('currentTime');
  timeEl.textContent = 'Local Time: ' + formatLocalTime(currentTimeZone);
}

function setWeatherUI(city, weatherText, temperature) {
  document.getElementById('cityName').textContent = city;
  document.getElementById('weatherText').textContent = weatherText;
  document.getElementById('temp').textContent = temperature;
}

function setBackground(weatherCode) {
  const bg = document.getElementById('bgLayer');
  let imageUrl = '';

  if (weatherCode === 0 || weatherCode === 1) {
    imageUrl = 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80';
  } else if (weatherCode === 2 || weatherCode === 3) {
    imageUrl = 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1200&q=80';
  } else if (weatherCode >= 45 && weatherCode <= 48) {
    imageUrl = 'https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?auto=format&fit=crop&w=1200&q=80';
  } else if (weatherCode >= 51 && weatherCode <= 67) {
    imageUrl = 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1200&q=80';
  } else if (weatherCode >= 71 && weatherCode <= 77) {
    imageUrl = 'https://images.unsplash.com/photo-1608889175123-9b5c1fda3c1a?auto=format&fit=crop&w=1200&q=80';
  } else if (weatherCode >= 80 && weatherCode <= 82) {
    imageUrl = 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=1200&q=80';
  } else if (weatherCode >= 95) {
    imageUrl = 'https://images.unsplash.com/photo-1500674425229-f692875b0ab7?auto=format&fit=crop&w=1200&q=80';
  }

  if (imageUrl) bg.style.backgroundImage = `url('${imageUrl}')`;
}

async function getWeather() {
  const cityInput = document.getElementById('cityInput');
  const city = cityInput.value.trim() || 'London';

  setWeatherUI(city, 'Loading...', '--°C');
  document.getElementById('currentTime').textContent = '';

  try {
    const geoUrl =
      'https://geocoding-api.open-meteo.com/v1/search?name=' +
      encodeURIComponent(city) +
      '&count=1&language=en&format=json';

    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      setWeatherUI(city, 'Unknown weather', '--°C');
      return;
    }

    const place = geoData.results[0];
    const displayName = place.name + (place.country ? ', ' + place.country : '');
    currentTimeZone = place.timezone || 'UTC';

    const weatherUrl =
      'https://api.open-meteo.com/v1/forecast?latitude=' +
      place.latitude +
      '&longitude=' +
      place.longitude +
      '&current_weather=true';

    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    const currentWeather = weatherData.current_weather;
    const weatherText = weatherCodes[currentWeather.weathercode] || 'Unknown weather';

    setWeatherUI(displayName, weatherText, currentWeather.temperature + '°C');
    setBackground(currentWeather.weathercode);

    if (timerId) clearInterval(timerId);
    updateTime();
    timerId = setInterval(updateTime, 1000);
  } catch (error) {
    setWeatherUI(city, 'Unknown weather', '--°C');
  }
}

getWeather();
