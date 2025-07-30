"use strict";
// DOM selections
const form = document.querySelector(".form");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");
const [inputType, ...inputFields] = document.querySelectorAll(".form__input");
const workouts = document.querySelector(".workouts");
// utility variables
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

    _setDescription() {
        // prettier-ignore
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
            months[this.date.getMonth()]
        } ${this.date.getDate()}`;
    }
}

class Running extends Workout {
    type = "running";
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();
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
        this._setDescription();
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
    #mapZoomLevel = 13;
    #mapEvent;
    #workouts = [];
    constructor() {
        // get user's location
        this._getPosition();

        // get the information from LocalStorage
        this._getWorkouts();

        // event listeners
        // recive the information from the form
        form.addEventListener("submit", this._newWorkout.bind(this));
        inputType.addEventListener("change", this._toggleElevationFields.bind(this));
        workouts.addEventListener("click", this._moveToPopup.bind(this));
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
        this.#map = L.map("map").setView(coords, this.#mapZoomLevel);

        L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.#map);

        this.#map.on("click", this._showForm.bind(this));
        // have to put this here, or it will break because the map is not loaded yet
        this.#workouts.forEach(this._displayWorkoutMarker.bind(this));
    }

    _showForm(mapE) {
        this.#mapEvent = mapE;
        form.classList.remove("hidden");
        inputDistance.focus();
    }

    _hideForm() {
        // clear input fields
        inputFields.forEach(field => {
            field.value = "";
            field.blur();
        });
        // hide input fields
        form.style.display = "none";
        form.classList.add("hidden");
        setTimeout(() => (form.style.display = "grid"), 1000);
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
        this.#workouts.push(workout);

        // display marker
        this._displayWorkoutMarker(workout);

        // display workout on the list
        this._displayWorkoutList(workout);

        // clear and hide the form
        this._hideForm();

        // store the new workout in local storage
        this._storeWorkout();
    }

    _displayWorkoutMarker(workout) {
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
            .setPopupContent(
                `${workout.type === "running" ? "🏃‍♂️" : "🚴‍♂️"} ${workout.description}`
            )
            .openPopup();
    }

    _displayWorkoutList(workout) {
        let html = `
            <li class="workout workout--${workout.type}" data-id="${workout.id}">
                <h2 class="workout__title">${workout.description}</h2>
                <div class="workout__details">
                    <span class="workout__icon">${
                        workout.type === "running" ? "🏃‍♂️" : "🚴‍♂️"
                    }</span>
                    <span class="workout__value">${workout.distance}</span>
                    <span class="workout__unit">km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⏱️</span>
                    <span class="workout__value">${workout.duration}</span>
                    <span class="workout__unit">min</span>
                </div>
        `;
        if (workout.type === "running") {
            html += `
                <div class="workout__detail">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.pace.toFixed(1)}</span>
                    <span class="workout__unit">min/km</span>
                </div>
                <div class="workout__detail">
                    <span class="workout__icon">🦶</span>
                    <span class="workout__value">${workout.cadence}</span>
                    <span class="workout__unit">spm</span>
                </div>
            `;
        } else {
            html += `
                <div class="workout__detail">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.speed.toFixed(1)}</span>
                    <span class="workout__unit">km/h</span>
                </div>
                <div class="workout__detail">
                    <span class="workout__icon">⛰️</span>
                    <span class="workout__value">${workout.elevationGain}</span>
                    <span class="workout__unit">m</span>
                </div>
            `;
        }
        form.insertAdjacentHTML("afterend", html);
    }

    _moveToPopup(e) {
        const workoutEl = e.target.closest(".workout");
        if (!workoutEl) {
            return;
        }
        const workout = this.#workouts.find(work => work.id === workoutEl.dataset.id);
        this.#map.setView(workout.coords, this.#mapZoomLevel, {
            animate: true,
            pan: {
                duration: 1,
            },
        });
    }

    _storeWorkout() {
        localStorage.setItem("workouts", JSON.stringify(this.#workouts));
    }

    _getWorkouts() {
        const data = JSON.parse(localStorage.getItem("workouts"));
        if (!data) return;
        this.#workouts = data;
        this.#workouts.forEach(this._displayWorkoutList);
    }

    // this reset the workouts
    // don't run this in the code, it will infinitly reload the page
    reset() {
        localStorage.removeItem("workouts");
        location.reload();
    }
}

// map
const app = new APP();
