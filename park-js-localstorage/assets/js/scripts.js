// js/index.js
// Full Version - Incorporates Leaflet and Geolocation via Menu
// Modified to save and display MULTIPLE places.

// --- Constants ---
const STORAGE_KEY = "savedParkingPlaces"; // Key for localStorage

// --- Global Variables (mostly for the input/registration page) ---
var mapInputInstance = null;    // Leaflet map instance on the registration page
var inputMarker = null;         // Marker on the registration map
var selectedLat = null;         // Latitude selected on the registration map
var selectedLng = null;         // Longitude selected on the registration map

var mapDisplayInstance = null;  // Leaflet map instance on the display page

// --- Geolocation Functions (Called by Menu) ---
// (No changes needed in requestGeolocation, updateMapToCurrentLocation, handleGeolocationError)
// These functions still correctly update the *input* map for the *next* place to be saved.

/**
 * Tries to get the current location and update the input map.
 */
function requestGeolocation() {
    console.log("Requesting geolocation via menu...");
    if (navigator.geolocation) {
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };
        navigator.geolocation.getCurrentPosition(
            updateMapToCurrentLocation,
            handleGeolocationError,
            options
        );
    } else {
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

    if (mapInputInstance && typeof mapInputInstance.setView === 'function') {
        mapInputInstance.setView(userCoords, 16);

        if (inputMarker) {
            try { mapInputInstance.removeLayer(inputMarker); } catch(e) { console.warn("Error removing previous marker:", e); }
        }

        inputMarker = L.marker(userCoords, { draggable: true }).addTo(mapInputInstance);
        inputMarker.bindPopup("Your current location.<br>You can drag to adjust.").openPopup();

        selectedLat = userCoords[0];
        selectedLng = userCoords[1];

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
 * (No major changes needed here, still handles input for one place at a time)
 */
function initMapInput() {
    const initialCoords = [41.133, -8.61];
    const initialZoom = 14;
    const mapContainer = document.getElementById('mapInput');

    if (!mapContainer) {
        console.error("Element #mapInput not found.");
        return;
    }

    if (mapInputInstance) {
        try { mapInputInstance.remove(); } catch(e) {}
        mapInputInstance = null;
    }
    mapContainer.innerHTML = '';

    try {
        mapInputInstance = L.map('mapInput').setView(initialCoords, initialZoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInputInstance);

        console.log("Input map initialized at the default location.");

        mapInputInstance.on('click', function(e) {
            selectedLat = e.latlng.lat;
            selectedLng = e.latlng.lng;

            if (inputMarker) {
                try { mapInputInstance.removeLayer(inputMarker); } catch(e) {}
            }
            inputMarker = L.marker([selectedLat, selectedLng], { draggable: true }).addTo(mapInputInstance);
            inputMarker.bindPopup("Selected location.<br>You can drag to adjust.").openPopup();

            inputMarker.on('dragend', function(event){
                var marker = event.target;
                var pos = marker.getLatLng();
                selectedLat = pos.lat;
                selectedLng = pos.lng;
                marker.setLatLng(new L.LatLng(selectedLat, selectedLng),{draggable:'true'});
                console.log("Marker dragged to:", selectedLat, selectedLng);
            });
        });

        setTimeout(function() {
            if (mapInputInstance) mapInputInstance.invalidateSize();
        }, 200);

    } catch (error) {
        console.error("Error initializing the input map:", error);
        mapContainer.innerHTML = '<p class="text-danger text-center pt-5">Error loading the map.</p>';
    }
}

/**
 * Saves the current form data and selected coordinates as a NEW entry
 * in the list of saved places in LocalStorage.
 */
function saveData() {
    console.log("Trying to save data...");
    // Retrieves form values
    const inputColor = document.getElementById("inputColor").value;
    const inputSection = document.getElementById("inputSection").value;
    const inputNumber = document.getElementById("inputNumber").value;

    // Basic validation
    if (inputColor === "..." || inputSection.trim() === "" || inputNumber.trim() === "") {
        alert("Invalid Data! Fill in Color, Section and Number.");
        return;
    }

    // Confirmation if the location was not marked (optional but recommended)
    if (selectedLat === null || selectedLng === null) {
        if (!confirm("You have not selected a location on the map. The location for this place will not be saved. Continue?")) {
            return;
        }
    }

    const newPlace = {
        id: Date.now(), // Use timestamp as a simple unique ID
        date: new Date().toISOString(), // Store date in standard ISO format
        color: inputColor,
        section: inputSection,
        number: inputNumber,
        lat: selectedLat, // Store selected coords (can be null)
        lng: selectedLng  // Store selected coords (can be null)
    };

    try {
        // Retrieve existing places or initialize an empty array
        let savedPlaces = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

        // Add the new place to the array
        savedPlaces.push(newPlace);

        // Save the updated array back to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPlaces));

        console.log("New place saved. Total places:", savedPlaces.length);
        console.log("Saved data:", newPlace);


        // Shows the success modal (Bootstrap)
        const mensagemModalElement = document.getElementById('MensagemModal');
        if (mensagemModalElement) {
             const mensagemSucessoModal = new bootstrap.Modal(mensagemModalElement);
             // Update modal text if needed
             const modalBody = mensagemModalElement.querySelector('.modal-body');
             if(modalBody) modalBody.textContent = "Place registered successfully!";
             mensagemSucessoModal.show();
        } else {
             alert("Place registered successfully!"); // Fallback
        }

        // Clears the form fields for the next entry
        document.getElementById("inputColor").value = "...";
        document.getElementById("inputSection").value = "";
        document.getElementById("inputNumber").value = "";

        // Clears the coordinate variables and the marker from the input map
        selectedLat = null;
        selectedLng = null;
        if (inputMarker && mapInputInstance) {
             try { mapInputInstance.removeLayer(inputMarker); } catch(e) {}
             inputMarker = null;
        }
        // Optional: Reset map view (might be better not to, to allow adding nearby places easily)
        // if(mapInputInstance) mapInputInstance.setView([41.133, -8.61], 14);

    } catch (e) {
        console.error("Error saving to localStorage:", e);
        // Check for QuotaExceededError (storage full)
        if (e.name === 'QuotaExceededError') {
            alert("Error saving data: Local storage is full. You may need to delete some saved places.");
        } else {
            alert("Error saving data. Local storage may be inaccessible or disabled.");
        }
    }
} // end saveData


/**
 * Initializes the Leaflet map on the display page (lugar/index.html).
 * Adds markers for all places provided that have valid coordinates.
 * @param {Array<object>} places An array of place objects to display.
 */
function initMapDisplay(places = []) {
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
    mapContainer.style.height = '400px'; // Set height for the map

    const defaultCoords = [41.133, -8.61]; // Default coordinates if no places have coords
    const defaultZoom = 13;

    try {
        mapDisplayInstance = L.map('mapDisplay').setView(defaultCoords, defaultZoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapDisplayInstance);

        const markers = []; // To store marker layers for fitting bounds
        let locationsFound = false;

        // Filter places to get only those with valid coordinates
        const placesWithCoords = places.filter(p =>
            p.lat !== null && p.lng !== null && !isNaN(parseFloat(p.lat)) && !isNaN(parseFloat(p.lng))
        );

        if (placesWithCoords.length > 0) {
            locationsFound = true;
            console.log(`Displaying ${placesWithCoords.length} places with coordinates on the map.`);

            placesWithCoords.forEach(place => {
                const lat = parseFloat(place.lat);
                const lng = parseFloat(place.lng);
                const coords = [lat, lng];
                const popupText = `<b>${place.color}</b><br>Section: ${place.section}<br>Number: ${place.number}<br><small>Saved: ${new Date(place.date).toLocaleTimeString()}</small>`;

                const marker = L.marker(coords).addTo(mapDisplayInstance);
                marker.bindPopup(popupText);
                markers.push(marker); // Add marker to array
            });

            // Adjust map view to show all markers
            if (markers.length > 0) {
                const group = L.featureGroup(markers); // Create a feature group
                mapDisplayInstance.fitBounds(group.getBounds().pad(0.3)); // Fit map, add padding
            }

        } else {
            // No valid coordinates found in any saved place
            console.log("Display map initialized, but no saved places have coordinates.");
            mapContainer.innerHTML = '<p class="text-muted text-center pt-5">No locations saved on the map.</p>';
            mapContainer.style.height = '100px'; // Reduce height if no map content
        }

        // Force redraw only if the map was actually created
        if (locationsFound) {
             setTimeout(function() {
                 if (mapDisplayInstance) mapDisplayInstance.invalidateSize();
             }, 200);
        }

    } catch (error) {
        console.error("Error initializing the display map:", error);
        mapContainer.innerHTML = '<p class="text-danger text-center pt-5">Error loading the map.</p>';
        mapContainer.style.height = '100px';
    }
}


/**
 * Retrieves ALL saved places from LocalStorage and displays them on the page,
 * including the call to initialize the display map with all locations.
 * This function should be called by the `onload` of the body in `lugar/index.html`.
 */
function showData() {
    console.log("Showing saved data...");
    const divData = document.getElementById("divData");
    const divMapContainer = document.getElementById("mapDisplayContainer"); // Optional: Wrap map for styling

    // Checks if the essential display div exists
    if (!divData) {
        console.error("Element #divData not found.");
        return;
    }

    // Clear previous content
    divData.innerHTML = "";
    // Don't clear map container here, initMapDisplay handles its own content (#mapDisplay)

    // Retrieve the array of places from LocalStorage
    let savedPlaces = [];
    try {
        savedPlaces = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
        console.error("Error parsing saved places from localStorage:", e);
        divData.innerHTML = "<p class='text-danger'>Error loading saved data.</p>";
        localStorage.removeItem(STORAGE_KEY); // Clear potentially corrupt data
        initMapDisplay([]); // Initialize map without data
        return;
    }


    if (savedPlaces.length > 0) {
        console.log(`Found ${savedPlaces.length} saved places.`);
        // Reverse the array to show the most recent first (optional)
        savedPlaces.reverse();

        let htmlContent = `<h2>Saved Places (${savedPlaces.length})</h2>`; // Title

        savedPlaces.forEach(place => {
            // Formats the date for display
            const dataObj = new Date(place.date); // Date was stored as ISO string
            const formatedDate = !isNaN(dataObj) ? dataObj.toLocaleString('pt-PT', { dateStyle: 'medium', timeStyle: 'short' }) : "Invalid date";

            // Determine background and text color based on saved color
            let bgColor = "#e9ecef"; // Default light gray
            let textColor = "black";
            switch (place.color) {
                case "Yellow": bgColor = "yellow"; break;
                case "Red": bgColor = "red"; textColor = "white"; break;
                case "Green": bgColor = "green"; textColor = "white"; break;
                case "Blue": bgColor = "blue"; textColor = "white"; break;
                case "Orange": bgColor = "orange"; break;
            }

            // Builds the HTML for EACH saved place
            // Added a delete button with an onclick handler
            htmlContent += `
                <div class="saved-place card mb-3" style="background-color: ${bgColor}; color: ${textColor};">
                    <div class="card-body">
                        <button class="btn btn-sm btn-danger float-end" onclick="deletePlace(${place.id})" title="Delete this entry">×</button>
                        <p class="card-text"><small><strong>Registered:</strong> ${formatedDate}</small></p>
                        <h5 class="card-title" style='font-size: 1.5em; font-weight: bold; margin-bottom: 0.5em;'>${place.color}</h5>
                        <p class="card-text mb-1"><strong>Section:</strong> ${place.section}</p>
                        <p class="card-text"><strong>Number:</strong> ${place.number}</p>
                        ${place.lat !== null ? '<span class="badge bg-info text-dark">Location saved</span>' : '<span class="badge bg-secondary">No location</span>'}
                    </div>
                </div>`;
        }); // end forEach

        divData.innerHTML = htmlContent;

        // Calls the function to initialize the display map with ALL places
        initMapDisplay(savedPlaces); // Pass the original (non-reversed) if order matters for map

    } else {
        // If there are no saved places in LocalStorage
        divData.innerHTML = "<p>You haven't registered any place yet.</p>";
        if(divMapContainer) divMapContainer.style.display = 'none'; // Hide map area if nothing to show
        console.log("No data found in localStorage to display.");
        initMapDisplay([]); // Initialize map without markers (shows 'no locations' message)
    }
} // end showData


/**
 * Deletes a specific place from LocalStorage based on its ID.
 * @param {number} placeId The unique ID (timestamp) of the place to delete.
 */
function deletePlace(placeId) {
    if (!confirm("Are you sure you want to delete this saved place?")) {
        return; // Abort if user cancels
    }

    console.log("Attempting to delete place with ID:", placeId);
    try {
        let savedPlaces = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

        // Filter out the place with the matching ID
        const updatedPlaces = savedPlaces.filter(place => place.id !== placeId);

        if (savedPlaces.length === updatedPlaces.length) {
            console.warn("Place with ID", placeId, "not found for deletion.");
            return; // Place not found
        }

        // Save the updated (filtered) array back to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlaces));

        console.log("Place deleted. Remaining places:", updatedPlaces.length);

        // Refresh the display to show the changes
        showData();

    } catch (e) {
        console.error("Error deleting place from localStorage:", e);
        alert("Error deleting the place. Local storage might be inaccessible.");
    }
}

// --- End of js/index.js ---