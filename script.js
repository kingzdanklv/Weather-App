let map = null;
let marker = null;
let weatherChart = null;

async function getWeather() {
    const city = document.getElementById('cityInput').value.trim();
    const resultDiv = document.getElementById('weatherResult');
    const errorMsg = document.getElementById('errorMsg');

    if (!city) return;

    try {
        // 1. Convert City Name to Lat/Long
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            errorMsg.classList.remove('hidden');
            resultDiv.classList.add('hidden');
            return;
        }

        const { latitude, longitude, name, country } = geoData.results[0];

        // 2. Fetch Current, Hourly (24h chart data), and Daily forecast
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
        const data = await weatherRes.json();

        // 3. Render Current Weather Text
        document.getElementById('cityName').innerText = `${name}${country ? ', ' + country : ''}`;
        document.getElementById('temp').innerText = `${Math.round(data.current.temperature_2m)}°C`;
        document.getElementById('humidity').innerText = `${data.current.relative_humidity_2m}%`;
        document.getElementById('wind').innerText = `${data.current.wind_speed_10m} km/h`;
        document.getElementById('feelsLike').innerText = `${Math.round(data.current.apparent_temperature)}°C`;
        
        const weatherInfo = getWeatherDetails(data.current.weather_code);
        document.getElementById('weatherDesc').innerText = weatherInfo.text;
        document.getElementById('weatherIcon').className = `fa-solid ${weatherInfo.icon}`;

        // 4. Render 3-Day Forecast Cards
        const forecastContainer = document.getElementById('forecastContainer');
        forecastContainer.innerHTML = '';
        for (let i = 1; i <= 3; i++) {
            const dateStr = data.daily.time[i];
            const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
            const maxTemp = Math.round(data.daily.temperature_2m_max[i]);
            const minTemp = Math.round(data.daily.temperature_2m_min[i]);
            const forecastInfo = getWeatherDetails(data.daily.weather_code[i]);

            forecastContainer.innerHTML += `
                <div class="bg-white/5 border border-white/10 p-3 rounded-2xl text-center flex flex-col items-center justify-center">
                    <p class="text-xs text-purple-300 font-medium mb-1">${dayName}</p>
                    <i class="fa-solid ${forecastInfo.icon} text-xl my-1 text-amber-300"></i>
                    <p class="text-xs font-bold">${maxTemp}° <span class="text-purple-300 font-normal">/ ${minTemp}°</span></p>
                </div>
            `;
        }

        // Show result container before initializing Map & Chart so elements have layout dimensions
        errorMsg.classList.add('hidden');
        resultDiv.classList.remove('hidden');

        // 5. Render Interactive Map
        updateMap(latitude, longitude, name);

        // 6. Render Hourly Chart
        updateChart(data.hourly);

    } catch (error) {
        console.error(error);
        errorMsg.classList.remove('hidden');
        resultDiv.classList.add('hidden');
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
    
    // Invalidate size to prevent leaflet rendering glitch inside hidden div
    setTimeout(() => map.invalidateSize(), 200);
}

function updateChart(hourlyData) {
    const hours = hourlyData.time.slice(0, 24).map(t => t.split('T')[1].slice(0, 5));
    const temps = hourlyData.temperature_2m.slice(0, 24);
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
                    label: 'Temp (°C)',
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
