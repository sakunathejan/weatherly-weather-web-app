var weatherApiKey = "b21cc0b25e78430bae7131041261410";
var cityInput = document.getElementById("city-search");
var searchStatus = document.getElementById("search-status");

function showWeather(data) {
    document.getElementById("city-name").textContent =
        data.location.name + ", " + data.location.country;
    document.getElementById("updated-time").textContent =
        "Updated " + data.location.localtime;
    document.getElementById("current-temp").textContent =
        data.current.temp_c + "°";
    document.getElementById("current-condition").textContent =
        data.current.condition.text + " / Feels like " + data.current.feelslike_c + "°";
    document.getElementById("weather-icon").src =
        "https:" + data.current.condition.icon;
    document.getElementById("weather-icon").alt =
        data.current.condition.text;
    document.getElementById("chance-of-rain").textContent =
        data.forecast.forecastday[0].day.daily_chance_of_rain + "%";
    document.getElementById("feels-like").textContent =
        data.current.feelslike_c;
    document.getElementById("humidity").textContent =
        data.current.humidity;
    document.getElementById("wind-speed").textContent =
        data.current.wind_kph;
    document.getElementById("uv-index").textContent =
        data.current.uv == null ? "—" : data.current.uv;
    document.getElementById("visibility").textContent =
        data.current.vis_km == null ? "—" : data.current.vis_km;

    showHourlyForecast(data);
}

function showHourlyForecast(data) {
    var hourlyForecast = document.getElementById("hourly-forecast");
    var hours = data.forecast.forecastday[0].hour;
    var currentHour = Number(data.location.localtime.substring(11, 13));

    hourlyForecast.innerHTML = "";

    if (hours == null || hours.length == 0) {
        var noForecast = document.createElement("p");
        noForecast.className =
            "col-span-full m-0 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-bg)] p-5 text-sm text-[var(--body-color)]";
        noForecast.textContent = "Hourly forecast is not available for this saved weather.";
        hourlyForecast.appendChild(noForecast);
        return;
    }

    for (var i = currentHour; i < currentHour + 6 && i < 24; i++) {
        var hourCard = document.createElement("article");
        var time = document.createElement("p");
        var icon = document.createElement("img");
        var temperature = document.createElement("p");
        var condition = document.createElement("p");

        hourCard.className =
            "rounded-2xl border border-[var(--border-color)] bg-[var(--surface-bg)] p-4 text-center";
        time.className = "m-0 text-xs font-medium text-[var(--body-color)]";
        time.textContent = hours[i].time.substring(11, 16);
        icon.className = "mx-auto my-2 h-10 w-10 object-contain";
        icon.src = "https:" + hours[i].condition.icon;
        icon.alt = hours[i].condition.text;
        temperature.className = "m-0 text-xl font-semibold text-[var(--heading-color)]";
        temperature.textContent = hours[i].temp_c + "°";
        condition.className = "mb-0 mt-2 text-xs text-[var(--body-color)]";
        condition.textContent = hours[i].condition.text;

        hourCard.appendChild(time);
        hourCard.appendChild(icon);
        hourCard.appendChild(temperature);
        hourCard.appendChild(condition);
        hourlyForecast.appendChild(hourCard);
    }
}

function btnSearchCity() {
    var city = cityInput.value;

    if (city == "") {
        searchStatus.textContent = "Enter a city to search.";
        searchStatus.classList.remove("hidden");
        return;
    }

    searchStatus.textContent = "Searching...";
    searchStatus.classList.remove("hidden");

    fetch("https://api.weatherapi.com/v1/forecast.json?key=" + weatherApiKey + "&q=" + encodeURIComponent(city) + "&days=1&aqi=yes")
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.error) {
                searchStatus.textContent = data.error.message;
                return;
            }

            showWeather(data);
            localStorage.setItem("weatherData", JSON.stringify(data));
            searchStatus.classList.add("hidden");
        })
        .catch(function() {
            searchStatus.textContent = "Could not load weather. Check your internet connection and try again.";
        });
}

function getFavoriteCities() {
    var savedCities = localStorage.getItem("favoriteCities");

    if (savedCities == null) {
        return [];
    }

    return JSON.parse(savedCities);
}

function showFavoriteCities() {
    var favoriteCities = getFavoriteCities();
    var favoriteList = document.getElementById("favorite-cities");

    favoriteList.innerHTML = "";

    if (favoriteCities.length == 0) {
        var emptyMessage = document.createElement("p");
        emptyMessage.className = "m-0 text-sm text-[var(--body-color)]";
        emptyMessage.textContent = "No favorite cities saved yet.";
        favoriteList.appendChild(emptyMessage);
        return;
    }

    for (var i = 0; i < favoriteCities.length; i++) {
        addFavoriteCityToPage(favoriteCities[i]);
    }
}

function addFavoriteCityToPage(cityName) {
    var cityItem = document.createElement("div");
    var cityButton = document.createElement("button");
    var removeButton = document.createElement("button");

    cityItem.className =
        "flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--surface-solid)] p-2";
    cityButton.className =
        "rounded-lg px-3 py-2 text-sm font-medium text-[var(--heading-color)] transition hover:bg-[#eef1ff]";
    cityButton.textContent = cityName;
    cityButton.type = "button";
    cityButton.onclick = function() {
        searchFavoriteCity(cityName);
    };

    removeButton.className =
        "rounded-lg px-2 py-2 text-xs font-medium text-[var(--body-color)] transition hover:bg-red-50 hover:text-red-600";
    removeButton.textContent = "Remove";
    removeButton.type = "button";
    removeButton.onclick = function() {
        removeFavoriteCity(cityName);
    };

    cityItem.appendChild(cityButton);
    cityItem.appendChild(removeButton);
    document.getElementById("favorite-cities").appendChild(cityItem);
}

function searchFavoriteCity(city) {
    cityInput.value = city;
    btnSearchCity();
}

function removeFavoriteCity(city) {
    var favoriteCities = getFavoriteCities();
    var updatedCities = [];

    for (var i = 0; i < favoriteCities.length; i++) {
        if (favoriteCities[i] != city) {
            updatedCities.push(favoriteCities[i]);
        }
    }

    localStorage.setItem("favoriteCities", JSON.stringify(updatedCities));
    showFavoriteCities();
}

function saveFavoriteCity() {
    var weatherData = localStorage.getItem("weatherData");
    var favoriteStatus = document.getElementById("favorite-status");

    if (weatherData == null) {
        favoriteStatus.textContent = "Search for a city before saving it.";
        favoriteStatus.classList.remove("hidden");
        return;
    }

    var data = JSON.parse(weatherData);
    var cityName = data.location.name + ", " + data.location.country;
    var favoriteCities = getFavoriteCities();

    for (var i = 0; i < favoriteCities.length; i++) {
        if (favoriteCities[i] == cityName) {
            favoriteStatus.textContent = cityName + " is already in your favorites.";
            favoriteStatus.classList.remove("hidden");
            return;
        }
    }

    favoriteCities.push(cityName);
    localStorage.setItem("favoriteCities", JSON.stringify(favoriteCities));
    favoriteStatus.textContent = cityName + " saved to favorites.";
    favoriteStatus.classList.remove("hidden");
    showFavoriteCities();
}

document.querySelector('[role="search"]').onsubmit = function(event) {
    event.preventDefault();
    btnSearchCity();
};

document.getElementById("save-favorite").onclick = saveFavoriteCity;

showFavoriteCities();

var savedWeather = localStorage.getItem("weatherData");

if (savedWeather != null) {
    showWeather(JSON.parse(savedWeather));
}
