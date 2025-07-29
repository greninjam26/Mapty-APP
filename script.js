"use strict";
// DOM selections
const form = document.querySelector(".form");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");
const [inputType, ...inputFields] = document.querySelectorAll(".form__input");
// utility variables
const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];
let map, mapEvent;

// map
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        function (pos) {
            // console.log(pos.coords);
            const { latitude, longitude } = pos.coords;
            const coords = [latitude, longitude];
            map = L.map("map").setView(coords, 13);

            L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            map.on("click", function (mapE) {
                mapEvent = mapE;
                form.classList.remove("hidden");
                inputDistance.focus();
            });
        },
        function () {
            alert("can't find your location");
        }
    );
}

// recive the information from the form
form.addEventListener("submit", function (e) {
    e.preventDefault();
    // display marker
    const { lat, lng } = mapEvent.latlng;
    L.marker([lat, lng])
        .addTo(map)
        .bindPopup(
            L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: "running-popup",
            })
        )
        .setPopupContent("Workout")
        .openPopup();
    // clear input fields
    inputFields.forEach(field => {
        field.value = "";
        field.blur();
    });
});

// when the type change
inputType.addEventListener("change", function () {
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
});
