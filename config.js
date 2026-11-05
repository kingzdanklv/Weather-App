// Weather condition code mappings with Day/Night awareness
function getWeatherDetails(code, isDay = 1) {
    const map = {
        0: { 
            text: isDay ? "Clear sky" : "Clear night", 
            icon: isDay ? "fa-sun text-amber-300" : "fa-moon text-blue-200" 
        },
        1: { 
            text: "Mainly clear", 
            icon: isDay ? "fa-cloud-sun text-amber-300" : "fa-cloud-moon text-blue-200" 
        },
        2: { 
            text: "Partly cloudy", 
            icon: isDay ? "fa-cloud-sun text-amber-300" : "fa-cloud-moon text-blue-200" 
        },
        3: { 
            text: "Overcast clouds", 
            icon: "fa-cloud text-slate-300" 
        },
        45: { 
            text: "Foggy conditions", 
            icon: "fa-smog text-slate-400" 
        },
        51: { 
            text: "Light rain & clouds", 
            icon: "fa-cloud-rain text-blue-400" 
        },
        53: { 
            text: "Moderate rain", 
            icon: "fa-cloud-rain text-blue-400" 
        },
        61: { 
            text: "Rain showers", 
            icon: "fa-cloud-showers-heavy text-blue-400" 
        },
        63: { 
            text: "Heavy rain", 
            icon: "fa-cloud-showers-heavy text-blue-500" 
        },
        71: { 
            text: "Snowfall", 
            icon: "fa-snowflake text-sky-200" 
        },
        95: { 
            text: "Thunderstorm & lightning", 
            icon: "fa-bolt text-yellow-400 animate-pulse" 
        },
        99: { 
            text: "Severe thunderstorm", 
            icon: "fa-bolt text-yellow-400 animate-pulse" 
        }
    };
    return map[code] || { text: "Variable conditions", icon: "fa-cloud text-purple-300" };
}

