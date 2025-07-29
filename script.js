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

// OOP
class APP {
    #map;
    #mapEvent;
    constructor() {
        this._getPosition();
        // recive the information from the form
        form.addEventListener("submit", this._newWorkout.bind(this));

        // when the type change
        inputType.addEventListener("change", this._toggleElevationFields.bind(this));
    }

    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                this._loadMap.bind(this),
                function () {
                    alert("can't find your location");
                }
            );
        }
    }

    _loadMap(pos) {
        // console.log(pos.coords);
        const { latitude, longitude } = pos.coords;
        const coords = [latitude, longitude];
        this.#map = L.map("map").setView(coords, 13);

        L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.#map);

        this.#map.on("click", this._showForm.bind(this));
    }

    _showForm(mapE) {
        this.#mapEvent = mapE;
        form.classList.remove("hidden");
        inputDistance.focus();
    }

    _toggleElevationFields() {
        inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
        inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    }

    _newWorkout(e) {
        e.preventDefault();
        // display marker
        const { lat, lng } = this.#mapEvent.latlng;
        L.marker([lat, lng])
            .addTo(this.#map)
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
    }
}

// map
const app = new APP();
