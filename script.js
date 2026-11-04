async function getWeather() {
    const city = document.getElementById('cityInput').value.trim();
    const resultDiv = document.getElementById('weatherResult');
    const errorMsg = document.getElementById('errorMsg');

    if (!city) return;

    try {
        // 1. Geocoding API to convert city name to Latitude & Longitude
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            errorMsg.classList.remove('hidden');
            resultDiv.classList.add('hidden');
            return;
        }

        const { latitude, longitude, name, country } = geoData.results[0];

        // 2. Fetch Comprehensive Weather Data (Current + 3 Daily Forecasts)
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
        const data = await weatherRes.json();

        // 3. Update Current Weather UI
        document.getElementById('cityName').innerText = `${name}${country ? ', ' + country : ''}`;
        document.getElementById('temp').innerText = `${Math.round(data.current.temperature_2m)}°C`;
        document.getElementById('humidity').innerText = `${data.current.relative_humidity_2m}%`;
        document.getElementById('wind').innerText = `${data.current.wind_speed_10m} km/h`;
        document.getElementById('feelsLike').innerText = `${Math.round(data.current.apparent_temperature)}°C`;
        
        const weatherInfo = getWeatherDetails(data.current.weather_code);
        document.getElementById('weatherDesc').innerText = weatherInfo.text;
        
        const iconElement = document.getElementById('weatherIcon');
        iconElement.className = `fa-solid ${weatherInfo.icon}`;

        // 4. Update 3-Day Forecast UI
        const forecastContainer = document.getElementById('forecastContainer');
        forecastContainer.innerHTML = '';

        for (let i = 1; i <= 3; i++) {
            const dateStr = data.daily.time[i];
            const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
            const maxTemp = Math.round(data.daily.temperature_2m_max[i]);
            const minTemp = Math.round(data.daily.temperature_2m_min[i]);
            const code = data.daily.weather_code[i];
            const forecastInfo = getWeatherDetails(code);

            forecastContainer.innerHTML += `
                <div class="bg-white/5 border border-white/10 p-3 rounded-2xl text-center flex flex-col items-center justify-center">
                    <p class="text-xs text-purple-300 font-medium mb-1">${dayName}</p>
                    <i class="fa-solid ${forecastInfo.icon} text-xl my-1 text-amber-300"></i>
                    <p class="text-xs font-bold">${maxTemp}° <span class="text-purple-300 font-normal">/ ${minTemp}°</span></p>
                </div>
            `;
        }

        errorMsg.classList.add('hidden');
        resultDiv.classList.remove('hidden');

    } catch (error) {
        console.error(error);
        errorMsg.classList.remove('hidden');
        resultDiv.classList.add('hidden');
    }
}

// Helper mapping for Weather Codes to Icons and Text descriptions
function getWeatherDetails(code) {
    const map = {
        0: { text: "Clear sky", icon: "fa-sun" },
        1: { text: "Mainly clear", icon: "fa-cloud-sun" },
        2: { text: "Partly cloudy", icon: "fa-cloud-sun" },
        3: { text: "Overcast", icon: "fa-cloud" },
        45: { text: "Foggy", icon: "fa-smog" },
        51: { text: "Light drizzle", icon: "fa-cloud-rain" },
        61: { text: "Slight rain", icon: "fa-cloud-showers-heavy" },
        71: { text: "Snow fall", icon: "fa-snowflake" },
        95: { text: "Thunderstorm", icon: "fa-bolt" }
    };
    return map[code] || { text: "Variable conditions", icon: "fa-cloud" };
}

