//global variables
var searchHistory = [];
var searchMax = 9;
var apiKey = "appid=264dbcaa3899de05eeadc78d68ba06dc";
var units = "units=imperial";


// select from html element
var searchForm = $("#location-form");
var searchHistory = $("#saved-search");

//-------------------------- get weather info from OpenWeather starts here ------------------------------//
var getCurrent = function(locationSearch) {
    // formate the OpenWeather api url
    var apiUrlCurrent =
        "https://api.openweathermap.org/data/2.5/weather?q=" + locationSearch + "&" + apiKey + "&" + units;
    // make a request to url
    fetch(apiUrlCurrent).then(function(response) {
        if (response.ok) {
            return response.json().then(function(response) {
                $("#locationSearch").html(response.name);
                // display date
                var unixTime = response.dt;
                var date = moment.unix(unixTime).format("M/D/YY");
                $("#today").html(date);
                // display weather icon
                var iconUrl =
                    "http://openweathermap.org/img/wn/" +
                    response.weather[0].icon +
                    "@2x.png";
                $("#weatherIconToday").attr("src", iconUrl);
                $("#tempToday").html(response.main.temp + " \u00B0F");
                $("#humidityToday").html(response.main.humidity + " %");
                $("#windSpeedToday").html(response.wind.speed + " MPH");
                // return coordinate for getUVIndex to call
                var lat = response.coord.lat;
                var lon = response.coord.lon;
                getUVIndex(lat, lon);
                getForecast(lat, lon);
            });
        } else {
            alert("Please provide a valid city name.");
        }
    });
};
var getUVIndex = function(lat, lon) {
    // formate the OpenWeather api url
    var apiUrl =
        "https://api.openweathermap.org/data/2.5/uvi?" +
        apiKey +
        "&lat=" +
        lat +
        "&lon=" +
        lon +
        "&" +
        units;
    fetch(apiUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            // remove all class background
            $("#UVIndexToday").removeClass();
            $("#UVIndexToday").html(response.value);
            if (response.value < 3) {
                $("#UVIndexToday").addClass("p-1 rounded bg-success text-white");
            } else if (response.value < 8) {
                $("#UVIndexToday").addClass("p-1 rounded bg-warning text-white");
            } else {
                $("#UVIndexToday").addClass("p-1 rounded bg-danger text-white");
            }
        });
};
var getForecast = function(lat, lon) {
    // formate the OpenWeather api url
    var apiUrl =
        "https://api.openweathermap.org/data/2.5/onecall?" +
        "lat=" +
        lat +
        "&lon=" +
        lon +
        "&exclude=current,minutely,hourly" +
        "&" +
        apiKey +
        "&" +
        units;
    fetch(apiUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            for (var i = 1; i < 6; i++) {
                //display date
                var unixTime = response.daily[i].dt;
                var date = moment.unix(unixTime).format("MM/DD/YY");
                $("#Date" + i).html(date);
                // display weather icon
                var iconUrl =
                    "http://openweathermap.org/img/wn/" +
                    response.daily[i].weather[0].icon +
                    "@2x.png";
                $("#currentIcon" + i).attr("src", iconUrl);
                // display temperature
                var temp = response.daily[i].temp.day + " \u00B0F";
                $("#currentTemp" + i).html(temp);
                // display humidity
                var humidity = response.daily[i].humidity;
                $("#currenthum" + i).html(humidity + " %");
            }
        });
};
//-------------------------- get weather info from OpenWeather ends here ------------------------------//
//-------------------------------------- create button starts  ----------------------------------------//
var creatBtn = function(btnText) {
    var btn = $("<button>")
        .text(btnText)
        .addClass("list-group-item list-group-item-action")
        .attr("type", "submit");
    return btn;
};
//-------------------------------------- create button ends  ------------------------------------------//
//---------------------- load saved citeis names from localStorage starts here ------------------------//
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
//---------------------- load saved citeis names from localStorage ends here ------------------------//
//----------------------- save searched city in to local storage starts here --------------------------//
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
            // control the length of the array. do not allow to save more than 10 cities
            searchHistory.pop();
            searchHistory.unshift(locationSearch);
        }
    }
    localStorage.setItem("weatherData", JSON.stringify(searchHistory));
    loadHistory = 1;
    return loadHistory;
};
//------------------------ save searched city in to local storage ends here ---------------------------//
//-------------------------- create button with searched city starts here -----------------------------//
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
        // check whether there are already have too many elements in this list of button
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

//------------------------------------- call functions directly ---------------------------------------//
loadSavedCity();
//-------------------------- create button with searched city ends here -------------------------------//
//--------------------------- event handler from submit form starts here ------------------------------//
var formSubmitHandler = function(event) {
    event.preventDefault();
    // name of the city
    var locationSearch = $("#searchCity").val().trim();
    var loadHistory = savelocationSearch(locationSearch);
    getCurrent(locationSearch);
    if (loadHistory == 1) {
        createlocationSearchBtn(locationSearch);
    }
};
var BtnClickHandler = function(event) {
    event.preventDefault();
    // name of the city
    var locationSearch = event.target.textContent.trim();
    getCurrent(locationSearch);
};
//--------------------------- event handler from submit form ends here ------------------------------//
//------------------------ call functions with submit button starts here ----------------------------//
$("#location-form").on("submit", function() {
    formSubmitHandler(event);
});
$(":button.list-group-item-action").on("click", function() {
    BtnClickHandler(event);
});