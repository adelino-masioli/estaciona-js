// js/index.js
// Full Version - Incorporates Leaflet and Geolocation via Menu

// --- Global Variables ---
var mapInputInstance = null;    // Leaflet map instance on the registration page
var inputMarker = null;         // Marker on the registration map
var selectedLat = null;         // Latitude selected on the registration map
var selectedLng = null;         // Longitude selected on the registration map

var mapDisplayInstance = null;  // Leaflet map instance on the display page

// --- Geolocation Functions (Called by Menu) ---

/**
 * Tries to get the current location and update the input map.
 */
function requestGeolocation() {
    console.log("Requesting geolocation via menu...");
    if (navigator.geolocation) {
        const options = {
            enableHighAccuracy: true, // Tries to get the most accurate location
            timeout: 10000,         // Timeout of 10 seconds
            maximumAge: 0           // Don't use cached position
        };
        // Calls the geolocation API
        navigator.geolocation.getCurrentPosition(
            updateMapToCurrentLocation, // Function called in case of success
            handleGeolocationError,    // Function called in case of error
            options
        );
    } else {
        // Browser doesn't support geolocation
        alert("Geolocation is not supported by this browser.");
    }
}

/**
 * Success callback for geolocation. Updates the input map if it exists.
 * @param {GeolocationPosition} position Object containing the coordinates.
 */
function updateMapToCurrentLocation(position) {
    console.log("Location obtained successfully:", position.coords);
    const userCoords = [position.coords.latitude, position.coords.longitude];

    // Checks if the registration map (mapInputInstance) is active on this page
    if (mapInputInstance && typeof mapInputInstance.setView === 'function') {
        mapInputInstance.setView(userCoords, 16); // Centers the map and applies zoom

        // Removes previous marker, if it exists
        if (inputMarker) {
            try { mapInputInstance.removeLayer(inputMarker); } catch(e) { console.warn("Error removing previous marker:", e); }
        }

        // Adds a new draggable marker at the current location
        inputMarker = L.marker(userCoords, { draggable: true }).addTo(mapInputInstance);
        inputMarker.bindPopup("Your current location.<br>You can drag to adjust.").openPopup();

        // Saves the obtained coordinates in the global variables
        selectedLat = userCoords[0];
        selectedLng = userCoords[1];

        // Adds event to update coordinates if the marker is dragged
        inputMarker.on('dragend', function(event){
            var marker = event.target;
            var pos = marker.getLatLng();
            selectedLat = pos.lat;
            selectedLng = pos.lng;
            marker.setLatLng(new L.LatLng(selectedLat, selectedLng), {draggable:'true'});
            console.log("Marker dragged to:", selectedLat, selectedLng);
        });

        alert("Map updated to your current location.");

    } else {
        // If the user clicks on the menu on another page (without the input map)
        alert(`Location obtained: Latitude ${userCoords[0].toFixed(5)}, Longitude ${userCoords[1].toFixed(5)}.\nOpen the 'Register Place' page to mark on the map.`);
    }
}

/**
 * Error callback for geolocation. Displays an alert with the cause.
 * @param {GeolocationPositionError} error Object containing error information.
 */
function handleGeolocationError(error) {
    console.error("Geolocation Error:", error.code, error.message);
    let message = "Could not get your location: ";
    switch (error.code) {
        case error.PERMISSION_DENIED:
            message += "Permission denied by the user.";
            break;
        case error.POSITION_UNAVAILABLE:
            message += "Location information unavailable (check GPS/Network).";
            break;
        case error.TIMEOUT:
            message += "Timeout expired while trying to get the location.";
            break;
        default:
            message += "An unknown error occurred.";
            break;
    }
    alert(message);
}


// --- Main Application Functions ---

/**
 * Initializes the Leaflet map on the registration page (index.html).
 * Does not automatically request geolocation.
 */
function initMapInput() {
    const initialCoords = [41.133, -8.61]; // Default coordinates (V. N. Gaia)
    const initialZoom = 14;
    const mapContainer = document.getElementById('mapInput');

    if (!mapContainer) {
        console.error("Element #mapInput not found.");
        return;
    }

    // Clears previous instance if it exists (prevents duplication on reloads)
    if (mapInputInstance) {
        try { mapInputInstance.remove(); } catch(e) {}
        mapInputInstance = null;
    }
    mapContainer.innerHTML = ''; // Clears placeholder "Loading map..."

    try {
        // Creates the map
        mapInputInstance = L.map('mapInput').setView(initialCoords, initialZoom);

        // Adds tile layer (base map)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInputInstance);

        console.log("Input map initialized at the default location.");

        // Adds click event on the map to place/move the marker
        mapInputInstance.on('click', function(e) {
            selectedLat = e.latlng.lat;
            selectedLng = e.latlng.lng;

            if (inputMarker) { // Removes previous marker
                try { mapInputInstance.removeLayer(inputMarker); } catch(e) {}
            }
            // Adds new draggable marker
            inputMarker = L.marker([selectedLat, selectedLng], { draggable: true }).addTo(mapInputInstance);
            inputMarker.bindPopup("Selected location.<br>You can drag to adjust.").openPopup();

            // Updates coordinates if dragged
            inputMarker.on('dragend', function(event){
                var marker = event.target;
                var pos = marker.getLatLng();
                selectedLat = pos.lat;
                selectedLng = pos.lng;
                marker.setLatLng(new L.LatLng(selectedLat, selectedLng),{draggable:'true'});
                console.log("Marker dragged to:", selectedLat, selectedLng);
            });
        });

        // Forces the map to redraw after a short delay (fixes rendering issues)
        setTimeout(function() {
            if (mapInputInstance) mapInputInstance.invalidateSize();
        }, 200);

    } catch (error) {
        console.error("Error initializing the input map:", error);
        mapContainer.innerHTML = '<p class="text-danger text-center pt-5">Error loading the map.</p>';
    }
}

/**
 * Saves the form data (Color, Section, Number) and the selected
 * coordinates (if any) in LocalStorage.
 */
function saveData() {
    console.log("Trying to save data...");
    // Retrieves form values
    const inputColor = document.getElementById("inputColor").value;
    const inputSection = document.getElementById("inputSection").value;
    const inputNumber = document.getElementById("inputNumber").value;

    // Basic validation of text/select fields
    if (inputColor === "..." || inputSection.trim() === "" || inputNumber.trim() === "") {
        alert("Invalid Data! Fill in Color, Section and Number.");
        return; // Aborts the function
    }

    // Confirmation if the location was not marked (optional)
    if (selectedLat === null || selectedLng === null) {
        if (!confirm("You have not selected a location on the map. Do you want to save anyway?")) {
            return; // Aborts if the user cancels
        }
    }

    const fieldDate = new Date(); // Gets current date/time

    try {
        // Saves the data in LocalStorage
        localStorage.setItem("Park_Date", fieldDate.toString());
        localStorage.setItem("Park_Color", inputColor);
        localStorage.setItem("Park_Section", inputSection);
        localStorage.setItem("Park_Number", inputNumber);

        // Saves coordinates if they were selected
        if (selectedLat !== null && selectedLng !== null) {
            localStorage.setItem("Park_Lat", selectedLat.toString());
            localStorage.setItem("Park_Lng", selectedLng.toString());
            console.log("Data and coordinates saved:", inputColor, inputSection, inputNumber, selectedLat, selectedLng);
        } else {
            // Removes old coordinates if they were not selected now
            localStorage.removeItem("Park_Lat");
            localStorage.removeItem("Park_Lng");
            console.log("Data saved (without coordinates):", inputColor, inputSection, inputNumber);
        }

        // Shows the success modal (Bootstrap)
        const mensagemModalElement = document.getElementById('MensagemModal');
        if (mensagemModalElement) {
             const mensagemSucessoModal = new bootstrap.Modal(mensagemModalElement);
             mensagemSucessoModal.show();
        } else {
             alert("Place registered successfully!"); // Fallback
        }

        // Clears the form fields
        document.getElementById("inputColor").value = "...";
        document.getElementById("inputSection").value = "";
        document.getElementById("inputNumber").value = "";

        // Clears the coordinate variables and the marker from the map
        selectedLat = null;
        selectedLng = null;
        if (inputMarker && mapInputInstance) {
             try { mapInputInstance.removeLayer(inputMarker); } catch(e) {}
             inputMarker = null;
        }
        // Optional: Reset the map view to the default
        // if(mapInputInstance) mapInputInstance.setView([41.133, -8.61], 14);

    } catch (e) {
        console.error("Error saving to localStorage:", e);
        alert("Error saving data. Local storage may be full or disabled.");
    }
} // end saveData

/**
 * Initializes the Leaflet map on the display page (lugar/index.html).
 * @param {number|null} lat Saved latitude (or null).
 * @param {number|null} lng Saved longitude (or null).
 * @param {string} popupText Text for the marker popup.
 */
function initMapDisplay(lat, lng, popupText) {
    const mapContainer = document.getElementById('mapDisplay');
    if (!mapContainer) {
        console.error("Element #mapDisplay not found.");
        return;
    }

    // Clears previous instance
    if (mapDisplayInstance) {
        try { mapDisplayInstance.remove(); } catch(e) {}
        mapDisplayInstance = null;
    }
    mapContainer.innerHTML = ''; // Clears placeholder

    // Checks if the coordinates are valid (numbers)
    const hasValidCoords = (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng));
    const displayCoords = hasValidCoords ? [lat, lng] : [41.133, -8.61]; // Uses coords or default
    const zoomLevel = hasValidCoords ? 17 : 14; // Higher zoom if it has coords

    try {
        mapContainer.style.height = '350px'; // Guarantees the container height
        mapDisplayInstance = L.map('mapDisplay').setView(displayCoords, zoomLevel);

        // Adds tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { /* ... */ }).addTo(mapDisplayInstance);

        // Adds marker only if the coordinates are valid
        if (hasValidCoords) {
            const marker = L.marker(displayCoords).addTo(mapDisplayInstance);
            if (popupText) {
                marker.bindPopup(popupText).openPopup(); // Adds popup with the data
            }
            console.log("Display map initialized with marker at:", lat, lng);
        } else {
            // Informs that there is no location on the map
            console.log("Display map initialized without valid coordinates.");
            mapContainer.innerHTML = '<p class="text-muted text-center pt-5">Location on the map not available.</p>';
            mapContainer.style.height = '100px'; // Reduces the container height
        }

        // Forces redraw
        setTimeout(function() {
            if (mapDisplayInstance) mapDisplayInstance.invalidateSize();
        }, 200);

    } catch (error) {
        console.error("Error initializing the display map:", error);
        mapContainer.innerHTML = '<p class="text-danger text-center pt-5">Error loading the map.</p>';
        mapContainer.style.height = '100px';
    }
}

/**
 * Retrieves data from LocalStorage and displays it on the display page,
 * including the call to initialize the display map.
 * This function is called by the `onload` of the body in `lugar/index.html`.
 */
function showData() {
    console.log("Showing saved data...");
    // Retrieves all data from LocalStorage
    const fieldDateStr = localStorage.getItem("Park_Date");
    const inputColor = localStorage.getItem("Park_Color");
    const inputSection = localStorage.getItem("Park_Section");
    const inputNumber = localStorage.getItem("Park_Number");
    const fieldLatStr = localStorage.getItem("Park_Lat");
    const fieldLngStr = localStorage.getItem("Park_Lng");

    const divData = document.getElementById("divData");
    const divMapDisplay = document.getElementById("mapDisplay"); // Map container

    // Checks if the essential divs exist
    if (!divData || !divMapDisplay) {
        console.error("Elements #divData or #mapDisplay not found.");
        if(divData) divData.innerHTML = "<p class='text-danger'>Error: Display element not found.</p>";
        return;
    }

    // Clears previous content
    divData.innerHTML = "";
    // divMapDisplay.innerHTML = '<p class="text-muted text-center pt-5">Loading map...</p>';

    // Checks if the main data exists
    if (inputColor && inputSection && inputNumber && fieldDateStr) {
        // Formats the date for display
        const dataObj = new Date(fieldDateStr);
        const formatedDate = !isNaN(dataObj) ? dataObj.toLocaleString('pt-PT', { dateStyle: 'medium', timeStyle: 'short' }) : "Invalid date";

        // Builds the HTML for the textual data
        const txtData = `<p><strong>Last registration:</strong> ${formatedDate}</p>` +
                         `<p style='font-size: 1.5em; font-weight: bold; margin: 0.5em 0;'>${inputColor}</p>` +
                         `<p><strong>Section:</strong> ${inputSection}</p>` +
                         `<p><strong>Number:</strong> ${inputNumber}</p>`;
        divData.innerHTML = txtData;

        // Applies background color based on the saved Color
        divData.style.color = "black"; // Default text color
        switch (inputColor) {
            case "Yellow": divData.style.backgroundColor = "yellow"; break;
            case "Red": divData.style.backgroundColor = "red"; divData.style.color = "white"; break;
            case "Green": divData.style.backgroundColor = "green"; divData.style.color = "white"; break;
            case "Blue": divData.style.backgroundColor = "blue"; divData.style.color = "white"; break;
            case "Orange": divData.style.backgroundColor = "orange"; break;
            default: divData.style.backgroundColor = "#e9ecef"; break; // Default light gray
        }

        // Prepares data for the display map
        // Converts coordinates from string to number (float), or null if they don't exist/are invalid
        const lat = fieldLatStr ? parseFloat(fieldLatStr) : null;
        const lng = fieldLngStr ? parseFloat(fieldLngStr) : null;
        const popupText = `<b>${inputColor}</b><br>Section: ${inputSection}<br>Number: ${inputNumber}`;

        // Calls the function to initialize the display map
        initMapDisplay(lat, lng, popupText);

    } else {
        // If there is no data saved in LocalStorage
        divData.innerHTML = "<p>You haven't registered any place yet.</p>";
        divData.style.backgroundColor = "#e9ecef";
        // Calls initMapDisplay without coordinates to show the "not available" message
        initMapDisplay(null, null, null);
        console.log("No data found in localStorage to display.");
    }
} // end showData

// --- End of js/index.js ---