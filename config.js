// Weather condition code mappings and helper functions
const WEATHER_CODES = {
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

function getWeatherDetails(code) {
    return WEATHER_CODES[code] || { text: "Variable conditions", icon: "fa-cloud" };
}

