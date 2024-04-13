const searchBtn = document.querySelector("#search-btn");
const inputHistory = document.querySelector("#search-history");
const searchInput = document.querySelector("#search-input");
const searchForm = document.querySelector("#search-form");
const apiKey = "a0ef0b0d805862ef6700309e10b18c5e";
const searchHistory = [];
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const city = searchInput.value;

addEventListener("click", function(event) {
    event.preventDefault();
    if (event.target.matches("#search-btn")) {
        if (city === "") {
            return;
        };
        
        const index = searchHistory.indexOf(city);
        if (index !== -1) {
            searchHistory.splice(index, 1);
        };
        
        searchHistory.push(city);

        localStorage.setItem("searchHistory", JSON.stringify(searchHistory));

        history.pushState(null, null, "?city=" + city);

        city = "";

        showResults();
    }
});

document.addEventListener("click", function(event) {
    if (event.target.matches("#clear-btn")) {
        localStorage.removeItem("searchHistory");
        location.reload();
    };
});

document.addEventListener("click", function(event) {
    if (event.target.matches("#search-history-item")) {
        const selectHistory = event.target.getAttribute("data-search");
        history.pushState(null, null, "?city=" + selectHistory);
        city = selectHistory;
        showResults();
    }
});

if (localStorage.getItem("searchHistory")) {
    document.querySelector("#search-blank").style.display = "none";

    const resultsHistory = JSON.parse(localStorage.getItem("searchHistory"));
    const startIndex = Math.max(0, resultsHistory.length - 10);

    for (const i = resultsHistory.length - 1; i >= startIndex; i--) {
        const searchHistoryItem = document.createElement("li");
        searchHistoryItem.textContent = resultsHistory[i];
        searchHistoryItem.setAttribute("class", "list-group-item");
        searchHistoryItem.setAttribute("id", "search-history-item");
        searchHistoryItem.setAttribute("data-search", resultsHistory[i]);
        searchHistoryItem.setAttribute("style", "cursor: pointer;");
        document.querySelector("#search-history").appendChild(searchHistoryItem);
    }
} else {
    document.querySelector("#search-blank").style.display = "block";
};

function updateSearchHistory() {
    document.querySelector("#search-history").innerHTML = "";

    const resultsHistory = JSON.parse(localStorage.getItem("searchHistory"));
    const startIndex = Math.max(0, searchHistory.length - 10);

    for (const i = resultsHistory.length - 1; i >= startIndex; i--) {
        const searchHistoryItem = document.createElement("li");
        searchHistoryItem.textContent = resultsHistory[i];
        searchHistoryItem.setAttribute("class", "list-group-item");
        searchHistoryItem.setAttribute("id", "search-history-item");
        searchHistoryItem.setAttribute("data-search",resultsHistory[i]);
        searchHistoryItem.setAttribute("style", "cursor: pointer;");
        document.querySelector("#search-history").appendChild(searchHistoryItem);
    };
};

function showResults() {
    if (city) {
        const newQuery = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=" + apiKey;

        fetch(newQuery)
        .then(function(response) {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Error: " + response.status);
            }
        })
        .then(function(data) {
            const currentCity = data.name;
            const currentDate = dayjs().format("MM/DD/YYYY");
            const currentIcon = data.weather[0].icon;
            const currentTemp = data.main.temp;
            const currentWindSpeed = data.wind.speed;
            const currentHumidity = data.main.humidity;

            document.querySelector("#current").innerHTML = "<h2>" + currentCity + " (" + currentDate + ")</h2>";
            document.querySelector("#current").innerHTML += "<img src='http://openweathermap.org/img/w/" + currentIcon + ".png' alt='Current weather icon'>";
            document.querySelector("#current").innerHTML += "<p>Temp: " + currentTemp + " °F</p>";
            document.querySelector("#current").innerHTML += "<p>Wind: " + currentWindSpeed + " MPH</p>";
            document.querySelector("#current").innerHTML += "<p>Humidity: " + currentHumidity + "%</p>";

            const forecastQuery = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial&appid=" + apiKey;

            fetch(forecastQuery)
            .then(function(response) {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Error: " + response.status);
                }
            })
            .then(function(forecastData) {
                const forecastList = forecastData.list;

                document.querySelector("#forecast").innerHTML = "<h2>5-Day Forecast:</h2>";
                for (const i = 0; i < forecastList.length; i += 8) {
                    const forecastDate = dayjs(forecastList[i].dt_txt).format("MM/DD/YYYY");
                    const forecastIcon = forecastList[i].weather[0].icon;
                    const forecastTemp = forecastList[i].main.temp;
                    const forecastWindSpeed = forecastList[i].wind.speed;
                    const forecastHumidity = forecastList[i].main.humidity;

                    const forecastItem = document.createElement("li");
                    forecastItem.innerHTML = "<h3>" + forecastDate + "</h3>";
                    forecastItem.innerHTML += "<img src='http://openweathermap.org/img/w/" + forecastIcon + ".png' alt='Forecast weather icon'>";
                    forecastItem.innerHTML += "<p>Temp: " + forecastTemp + " °F</p>";
                    forecastItem.innerHTML += "<p>Wind: " + forecastWindSpeed + " MPH</p>";
                    forecastItem.innerHTML += "<p>Humidity: " + forecastHumidity + "%</p>";

                    document.querySelector("#forecast").appendChild(forecastItem);
                }
            })
            .catch(function(error) {
                console.log(error);
                if (errorCode === "404") {
                    document.querySelector("#results").innerHTML = "<h2 class='error-message'>404: City Not Found</h2>";

                    const index = searchHistory.indexOf(city);

                    if (index > -1) {
                        searchHistory.splice(index, 1);
                        localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
                        updateSearchHistory();
                    }
                } else {
                    document.querySelector("#results").innerHTML = "<h2 class='error-message'>Error: " + errorCode + "</h2>";
                }
            });
        })    
        .catch(function(error) {
            console.log(error);
            if (errorCode === "404") {
                document.querySelector("#results").innerHTML = "<h2 class='error-message'>404: City not found!</h2>";

                const index = searchHistory.indexOf(city);

                if (index > -1) {
                    searchHistory.splice(index, 1);
                    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
                    updateSearchHistory();
                }
            } else {
                document.querySelector("#results").innerHTML = "<h2 class='error-message'>Error: " + errorCode + "</h2>";
            }
        });
    
        updateSearchHistory();
    }
    else {
        document.querySelector("#results").innerHTML = "<h2 class='error-message'>No city specified!</h2>";
    }
}

window.onload = showResults();