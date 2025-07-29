"use strict";
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
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        function (pos) {
            console.log(pos.coords);
            const { latitude, longitude } = pos.coords;
            const coords = [latitude, longitude];
            const map = L.map("map").setView(coords, 13);

            L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            map.on("click", function (mapE) {
                const { lat, lng } = mapE.latlng;
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
            });
        },
        function () {
            alert("can't find your location");
        }
    );
}
