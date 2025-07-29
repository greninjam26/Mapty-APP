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

            L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            L.marker(coords)
                .addTo(map)
                .bindPopup("A pretty CSS popup.<br> Easily customizable.")
                .openPopup();
        },
        function () {
            alert("can't find your location");
        }
    );
}
