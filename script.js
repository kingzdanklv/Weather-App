let map = null;
let marker = null;
let weatherChart = null;
let currentWeatherData = null;
let isCelsius = true;

async function getWeather() {
    const city = document.getElementById('cityInput').value.trim();
    const resultDiv = document.getElementById('weatherResult');
    const errorMsg = document.getElementById('errorMsg');

    if (!city) return;

    try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            errorMsg.classList.remove('hidden');
            resultDiv.classList.add('hidden');
            return;
        }

        const { latitude, longitude, name, country } = geoData.results[0];

        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure,uv_index&hourly=temperature_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`);
        currentWeatherData = await weatherRes.json();

        displayWeatherData(name, country, latitude, longitude);

    } catch (error) {
        console.error(error);
        errorMsg.classList.remove('hidden');
        resultDiv.classList.add('hidden');
    }
}

function displayWeatherData(name, country, latitude, longitude) {
    const resultDiv = document.getElementById('weatherResult');
    const errorMsg = document.getElementById('errorMsg');
    const data = currentWeatherData;

    let tempVal = data.current.temperature_2m;
    let feelsVal = data.current.apparent_temperature;
    let unitSymbol = "°C";

    if (!isCelsius) {
        tempVal = (tempVal * 9/5) + 32;
        feelsVal = (feelsVal * 9/5) + 32;
        unitSymbol = "°F";
    }

    document.getElementById('cityName').innerText = `${name}${country ? ', ' + country : ''}`;
    document.getElementById('temp').innerText = `${Math.round(tempVal)}${unitSymbol}`;
    document.getElementById('humidity').innerText = `${data.current.relative_humidity_2m}%`;
    document.getElementById('wind').innerText = `${data.current.wind_speed_10m} km/h`;
    document.getElementById('feelsLike').innerText = `${Math.round(feelsVal)}${unitSymbol}`;
    document.getElementById('uvIndex').innerText = data.current.uv_index !== undefined ? data.current.uv_index : "N/A";
    document.getElementById('pressure').innerText = `${data.current.surface_pressure} hPa`;

    // Format Sunrise and Sunset times
    const sunriseTime = data.daily.sunrise[0].split('T')[1];
    const sunsetTime = data.daily.sunset[0].split('T')[1];
    document.getElementById('sunTimes').innerText = `Rise: ${sunriseTime} | Set: ${sunsetTime}`;

    const weatherInfo = getWeatherDetails(data.current.weather_code);
    document.getElementById('weatherDesc').innerText = weatherInfo.text;
    document.getElementById('weatherIcon').className = `fa-solid ${weatherInfo.icon}`;

    // 3-Day Forecast
    const forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = '';
    for (let i = 1; i <= 3; i++) {
        const dateStr = data.daily.time[i];
        const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
        
        let maxT = data.daily.temperature_2m_max[i];
        let minT = data.daily.temperature_2m_min[i];
        if (!isCelsius) {
            maxT = (maxT * 9/5) + 32;
            minT = (minT * 9/5) + 32;
        }

        const forecastInfo = getWeatherDetails(data.daily.weather_code[i]);

        forecastContainer.innerHTML += `
            <div class="bg-white/5 border border-white/10 p-3 rounded-2xl text-center flex flex-col items-center justify-center">
                <p class="text-xs text-purple-300 font-medium mb-1">${dayName}</p>
                <i class="fa-solid ${forecastInfo.icon} text-xl my-1 text-amber-300"></i>
                <p class="text-xs font-bold">${Math.round(maxT)}° <span class="text-purple-300 font-normal">/ ${Math.round(minT)}°</span></p>
            </div>
        `;
    }

    errorMsg.classList.add('hidden');
    resultDiv.classList.remove('hidden');

    updateMap(latitude, longitude, name);
    updateChart(data.hourly);
}

function toggleUnits() {
    isCelsius = !isCelsius;
    document.getElementById('unitToggleBtn').innerText = isCelsius ? "°C" : "°F";
    if (currentWeatherData) {
        const cityHeading = document.getElementById('cityName').innerText.split(',');
        const cityName = cityHeading[0].trim();
        // Re-render current loaded data in new units
        const lat = marker ? marker.getLatLng().lat : 0;
        const lon = marker ? marker.getLatLng().lng : 0;
        displayWeatherData(cityName, "", lat, lon);
    }
}

function updateMap(lat, lon, cityName) {
    if (!map) {
        map = L.map('map').setView([lat, lon], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);
        marker = L.marker([lat, lon]).addTo(map);
    } else {
        map.setView([lat, lon], 10);
        marker.setLatLng([lat, lon]);
    }
    marker.bindPopup(`<b>${cityName}</b>`).openPopup();
    setTimeout(() => map.invalidateSize(), 200);
}

function updateChart(hourlyData) {
    const hours = hourlyData.time.slice(0, 24).map(t => t.split('T')[1].slice(0, 5));
    let temps = hourlyData.temperature_2m.slice(0, 24);
    if (!isCelsius) {
        temps = temps.map(t => (t * 9/5) + 32);
    }
    const rainProb = hourlyData.precipitation_probability ? hourlyData.precipitation_probability.slice(0, 24) : [];

    const ctx = document.getElementById('weatherChart').getContext('2d');

    if (weatherChart) {
        weatherChart.destroy();
    }

    weatherChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [
                {
                    label: isCelsius ? 'Temp (°C)' : 'Temp (°F)',
                    data: temps,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Rain %',
                    data: rainProb,
                    borderColor: '#38bdf8',
                    backgroundColor: 'rgba(56, 189, 248, 0.2)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#e9d5ff', font: { size: 10 } } }
            },
            scales: {
                x: { ticks: { color: '#c084fc', font: { size: 9 } }, grid: { display: false } },
                y: { ticks: { color: '#c084fc', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });
}

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
