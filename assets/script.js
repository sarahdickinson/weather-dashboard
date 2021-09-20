//global variables
var searchHistory = [];
var searchMax = 9;
var apiKey = "appid=264dbcaa3899de05eeadc78d68ba06dc";
var units = "units=imperial";


// select from html element
var searchForm = $("#location-form");
var searchHistory = $("#saved-search");

// get current weather info
var getCurrent = function(locationSearch) {

    // formate the open weather api url
    var apiUrlCurrent =
        "https://api.openweathermap.org/data/2.5/weather?q=" + locationSearch + "&" + apiKey + "&" + units;

    // make a request to url
    fetch(apiUrlCurrent).then(function(response) {
        if (response.ok) {
            return response.json().then(function(response) {
                $("#locationSearch").html(response.name);

                // display current data
                var unixTime = response.dt;
                var date = moment.unix(unixTime).format("M/D/YY");
                $("#today").html(date);

                var iconUrl =
                    "http://openweathermap.org/img/wn/" +
                    response.weather[0].icon +
                    "@2x.png";
                $("#currentIcon").attr("src", iconUrl);

                $("#currentTemp").html(response.main.temp + " \u00B0F");
                $("#currentHum").html(response.main.humidity + " %");
                $("#currentWind").html(response.wind.speed + " MPH");

                // return coords for forecast fetch
                var lat = response.coord.lat;
                var lon = response.coord.lon;

                //call functions
                getUVI(lat, lon);
                getForecast(lat, lon);
            });
        } else {
            alert("Try that again. Your query was not recongized.");
        }
    });
};

// get current UVI
var getUVI = function(lat, lon) {

    // formate the open weather api url
    var apiUrlUVI =
        "https://api.openweathermap.org/data/2.5/uvi?" + apiKey + "&lat=" + lat + "&lon=" + lon + "&" + units;

    // make a get request to url
    fetch(apiUrlUVI)
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {

            // remove all classes
            $("#currentUVI").removeClass();
            $("#currentUVI").html(response.value);
            if (response.value < 3) {
                $("#currentUVI").addClass("p-1 rounded bg-success text-white");
            } else if (response.value < 8) {
                $("#currentUVI").addClass("p-1 rounded bg-warning text-white");
            } else {
                $("#currentUVI").addClass("p-1 rounded bg-danger text-white");
            }
        });
};

// get forecast weather info
var getForecast = function(lat, lon) {

    // formate the open weather api url
    var apiUrlForecast =
        "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=current,minutely,hourly&" +
        apiKey + "&" + units;

    // make a get request to url
    fetch(apiUrlForecast)
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            for (var i = 1; i < 6; i++) {

                //display forecast data
                var unixTime = response.daily[i].dt;
                var date = moment.unix(unixTime).format("MM/DD/YY");
                $("#Date" + i).html(date);

                var iconUrl =
                    "http://openweathermap.org/img/wn/" +
                    response.daily[i].weather[0].icon +
                    "@2x.png";
                $("#currentIcon" + i).attr("src", iconUrl);

                var temp = response.daily[i].temp.day + " \u00B0F";
                $("#currentTemp" + i).html(temp);

                var humidity = response.daily[i].humidity;
                $("#currenthum" + i).html(humidity + " %");
            }
        });
};

// create button
var creatBtn = function(btnText) {
    var btn = $("<button>")
        .text(btnText)
        .addClass("list-group-item list-group-item-action")
        .attr("type", "submit");
    return btn;
};

// load history from localStorage
var loadSavedCity = function() {
    searchHistory = JSON.parse(localStorage.getItem("weatherData"));
    if (searchHistory == null) {
        searchHistory = [];
    }
    for (var i = 0; i < searchHistory.length; i++) {
        var locationSearchBtn = creatBtn(searchHistory[i]);
        searchHistory.append(locationSearchBtn);
    }
};

// save history in localStorage
var savelocationSearch = function(locationSearch) {
    var loadHistory = 0;
    searchHistory = JSON.parse(localStorage.getItem("weatherData"));
    if (searchHistory == null) {
        searchHistory = [];
        searchHistory.unshift(locationSearch);
    } else {
        for (var i = 0; i < searchHistory.length; i++) {
            if (locationSearch.toLowerCase() == searchHistory[i].toLowerCase()) {
                return loadHistory;
            }
        }
        if (searchHistory.length < searchMax) {

            // create object
            searchHistory.unshift(locationSearch);
        } else {

            // control the length of the array
            searchHistory.pop();
            searchHistory.unshift(locationSearch);
        }
    }
    localStorage.setItem("weatherData", JSON.stringify(searchHistory));
    loadHistory = 1;
    return loadHistory;
};

// create buttom from saved search
var createlocationSearchBtn = function(locationSearch) {
    var saveCities = JSON.parse(localStorage.getItem("weatherData"));

    // check the locationSearch parameter against all children of searchHistory
    if (saveCities.length == 1) {
        var locationSearchBtn = creatBtn(locationSearch);
        searchHistory.prepend(locationSearchBtn);
    } else {
        for (var i = 1; i < saveCities.length; i++) {
            if (locationSearch.toLowerCase() == saveCities[i].toLowerCase()) {
                return;
            }
        }

        // check elements in list
        if (searchHistory[0].childElementCount < searchMax) {
            var locationSearchBtn = creatBtn(locationSearch);
        } else {
            searchHistory[0].removeChild(searchHistory[0].lastChild);
            var locationSearchBtn = creatBtn(locationSearch);
        }
        searchHistory.prepend(locationSearchBtn);
        $(":button.list-group-item-action").on("click", function() {
            BtnClickHandler(event);
        });
    }
};

// call function
loadSavedCity();

// event handler
var formSubmitHandler = function(event) {
    event.preventDefault();

    // searach
    var locationSearch = $("#locationSearch").val().trim();
    var loadHistory = savelocationSearch(locationSearch);
    getCurrent(locationSearch);
    if (loadHistory == 1) {
        createlocationSearchBtn(locationSearch);
    }
};
var BtnClickHandler = function(event) {
    event.preventDefault();

    // search
    var locationSearch = event.target.textContent.trim();
    getCurrent(locationSearch);
};

// call functions on submit
$("#location-form").on("submit", function() {
    formSubmitHandler(event);
});
$(":button.list-group-item-action").on("click", function() {
    BtnClickHandler(event);
});