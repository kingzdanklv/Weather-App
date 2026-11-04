async function getWeather() {
    const city = document.getElementById('cityInput').value.trim();
    const resultDiv = document.getElementById('weatherResult');
    const errorMsg = document.getElementById('errorMsg');

    if (!city) return;

    try {
        // Step 1: Geocoding API to convert city name to Latitude & Longitude
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            errorMsg.classList.remove('hidden');
            resultDiv.classList.add('hidden');
            return;
        }

        const { latitude, longitude, name, country } = geoData.results[0];

        // Step 2: Fetch Live Weather from Open-Meteo API
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`);
        const weatherData = await weatherRes.json();

        // Step 3: Display results in HTML
        document.getElementById('cityName').innerText = `${name}${country ? ', ' + country : ''}`;
        document.getElementById('temp').innerText = `${Math.round(weatherData.current.temperature_2m)}°C`;
        document.getElementById('humidity').innerText = `${weatherData.current.relative_humidity_2m}%`;
        document.getElementById('wind').innerText = `${weatherData.current.wind_speed_10m} km/h`;
        document.getElementById('weatherDesc').innerText = getWeatherDescription(weatherData.current.weather_code);

        errorMsg.classList.add('hidden');
        resultDiv.classList.remove('hidden');

    } catch (error) {
        console.error(error);
        errorMsg.classList.remove('hidden');
        resultDiv.classList.add('hidden');
    }
}

// Convert Open-Meteo numeric WMO codes into human-readable weather terms
function getWeatherDescription(code) {
    const codes = {
        0: "Clear sky ☀️",
        1: "Mainly clear 🌤️", 
        2: "Partly cloudy ⛅", 
        3: "Overcast ☁️",
        45: "Foggy 🌫️", 
        51: "Light drizzle 🌧️", 
        61: "Slight rain 🌧️",
        71: "Snow fall ❄️", 
        95: "Thunderstorm 🌩️"
    };
    return codes[code] || "Variable conditions";
}

