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
// utility functions
const isPositive = (...nums) => nums.every(num => num > 0);

// OOP
// Untility classes
class Workout {
    date = new Date();
    id = new Date().toISOString().slice(-10);
    constructor(coords, distance, duration) {
        this.coords = coords; // [latitude, longitude]
        this.distance = distance; // km
        this.duration = duration; // min
    }
}

class Running extends Workout {
    type = "running";
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
    }

    calcPace() {
        // min/km
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}

class Cycling extends Workout {
    type = "cycling";
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
    }

    calcSpeed() {
        // km/h
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}

// Main APP
class APP {
    #map;
    #mapEvent;
    #workouts = [];
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

        // get the data from form
        const distance = +inputDuration.value;
        const duration = +inputDistance.value;
        const type = inputType.value;
        const { lat, lng } = this.#mapEvent.latlng;
        let workout;

        // If workout is running
        if (type === "running") {
            const cadence = +inputCadence.value;
            // check if the data works
            if (!isPositive(distance, duration, cadence)) {
                return alert("Inputs have to be positive");
            }
            workout = new Running([lat, lng], distance, duration, cadence);
        }

        // if the workout is cycling
        if (type === "cycling") {
            const elevation = +inputElevation.value;
            workout = new Cycling([lat, lng], distance, duration, elevation);
        }

        // add the workout to the list of workouts
        // console.log(distance, duration, type);
        this.#workouts.push(workout);
        // console.log(workout);
        console.log(this.#workouts);
        // display marker
        this.renderWorkoutMarker(workout);

        // display workout on the list

        // clear input fields
        inputFields.forEach(field => {
            field.value = "";
            field.blur();
        });
    }

    renderWorkoutMarker(workout) {
        L.marker(workout.coords)
            .addTo(this.#map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: `${workout.type}-popup`,
                })
            )
            .setPopupContent(`${workout.type}`)
            .openPopup();
    }
}

// map
const app = new APP();
