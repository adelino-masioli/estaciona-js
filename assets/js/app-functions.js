// /assets/js/app-functions.js

// --- Firebase SDK Imports ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.7.0/firebase-analytics.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
} from "https://www.gstatic.com/firebasejs/11.7.0/firebase-auth.js";
import {
    getFirestore,
    collection,
    addDoc,
    doc,
    query,
    getDocs,
    orderBy,
    deleteDoc,
} from "https://www.gstatic.com/firebasejs/11.7.0/firebase-firestore.js";

// --- Firebase Configuration ---
import { firebaseConfig } from "./firebase-config.js"; // Assuming firebase-config.js is in the same /assets/js/ folder

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Optional: if you use Analytics
const auth = getAuth(app);
const db = getFirestore(app);

// --- Leaflet Map Module-Scoped Variables ---
let mapInputInstance = null;
let inputMarker = null;
let selectedLat = null;
let selectedLng = null;
let mapDisplayInstance = null;

// --- UI Elements & Event Listeners (Attached once DOM is ready for respective pages) ---
document.addEventListener('DOMContentLoaded', () => {
    const btnLogin = document.getElementById("btnLogin");
    if (btnLogin) {
        btnLogin.addEventListener("click", validateUser);
    }

    const btnRegister = document.getElementById("btnRegister");
    if (btnRegister) {
        btnRegister.addEventListener("click", registerUser);
    }

    const btnSave = document.getElementById("btnSave");
    if (btnSave) {
        btnSave.addEventListener("click", registerPlace);
    }

    // Page-specific initializers triggered by path
    const currentPath = window.location.pathname;

    if (currentPath.endsWith("/places/") || currentPath.endsWith("/places/index.html")) {
        showPlaces(); // This will also trigger initMapDisplay
        setupPlaceEventListeners(); // For delete buttons
    }
    // For other pages like index.html, about.html, register.html, their inline scripts
    // in the HTML file will call setupHeader after header.load().
    // updateMainContentVisibility is called from index.html's inline script.
});


// --- Authentication Functions ---
async function registerUser() {
    const divAnimation = document.getElementById("DivAnimation");
    const messageDiv = document.getElementById("message");

    if (divAnimation) $(divAnimation).show();
    if (messageDiv) messageDiv.innerHTML = "";

    let email = document.getElementById("text-email").value;
    let password = document.getElementById("text-password").value;

    if (email.length < 4 || !email.includes("@")) {
        if (divAnimation) $(divAnimation).hide();
        if (messageDiv) messageDiv.innerHTML = '<div class="alert alert-danger">Please enter a valid email address.</div>';
        return;
    }
    if (password.length < 6) {
        if (divAnimation) $(divAnimation).hide();
        if (messageDiv) messageDiv.innerHTML = '<div class="alert alert-danger">Password should be at least 6 characters long.</div>';
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("User registered and signed in successfully:", userCredential.user);
        if (divAnimation) $(divAnimation).hide();
        sessionStorage.setItem("Login", "true");
        window.location.href = "/index.html";
    } catch (error) {
        if (divAnimation) $(divAnimation).hide();
        const errorCode = error.code;
        let displayErrorMessage = "Registration failed. Please try again.";
        if (errorCode === "auth/email-already-in-use") displayErrorMessage = "This email address is already registered.";
        else if (errorCode === "auth/invalid-email") displayErrorMessage = "The email address is not valid.";
        else if (errorCode === "auth/weak-password") displayErrorMessage = "The password is too weak.";
        if (messageDiv) messageDiv.innerHTML = `<div class="alert alert-danger">${displayErrorMessage}</div>`;
        console.error("Registration failed:", errorCode, error.message);
    }
}

async function validateUser() {
    const divAnimationLogin = $("#DivAnimationLogin");
    const messageLoginDiv = document.getElementById("messageLogin");
    
    divAnimationLogin.show();
    if(messageLoginDiv) messageLoginDiv.innerHTML = "";

    let email = document.getElementById("text-email").value;
    let password = document.getElementById("text-password").value;

    if (email.length < 4 || !email.includes('@')) {
        divAnimationLogin.hide();
        if(messageLoginDiv) messageLoginDiv.innerHTML = '<div class="alert alert-danger">Enter a valid email address!</div>';
        return;
    }
    if (password.length < 1) {
        divAnimationLogin.hide();
        if(messageLoginDiv) messageLoginDiv.innerHTML = '<div class="alert alert-danger">Enter a password!</div>';
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Login successful:", userCredential.user);
        sessionStorage.setItem("Login", "true");
        
        if (typeof updateMainContentVisibility === 'function') updateMainContentVisibility();
        if (typeof setupHeader === 'function') setupHeader();

        divAnimationLogin.hide();
    } catch (error) {
        divAnimationLogin.hide();
        const errorCode = error.code;
        let displayErrorMessage = "Login denied! Please check your credentials.";
        if (errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found' || errorCode === 'auth/invalid-credential') {
            displayErrorMessage = "Wrong email or password.";
        } else if (errorCode === 'auth/invalid-email') {
            displayErrorMessage = "The email address is not valid.";
        }
        if(messageLoginDiv) messageLoginDiv.innerHTML = `<div class="alert alert-danger">${displayErrorMessage}</div>`;
        console.error("Login failed:", errorCode, error.message);
    }
}

async function handleLogout() {
    try {
        await firebaseSignOut(auth);
        sessionStorage.removeItem("Login");
        console.log("User signed out successfully.");
        window.location.href = "/index.html";
    } catch (error) {
        console.error("Sign out error:", error);
        alert("Error signing out: " + error.message);
    }
}

// --- UI Update Functions ---
export function setupHeader() {
    const pathname = window.location.pathname;
    const navLinks = document.querySelectorAll('#mainNavLinks .nav-link[href]');
    navLinks.forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
        let linkPath = new URL(link.href, window.location.origin).pathname;
        const cleanPathname = (pathname.endsWith('/') && pathname.length > 1) ? pathname.slice(0, -1) : pathname;
        const cleanLinkPath = (linkPath.endsWith('/') && linkPath.length > 1) ? linkPath.slice(0, -1) : linkPath;
        const isHomePage = (cleanPathname === '' || cleanPathname === '/index.html');
        const isLinkToHomePage = (cleanLinkPath === '' || cleanLinkPath === '/index.html');

        if (isHomePage && isLinkToHomePage) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else if (!isLinkToHomePage && cleanPathname.startsWith(cleanLinkPath) && cleanLinkPath !== '') {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });

    const navLoginLink = document.getElementById('navLoginLink');
    const navLogoutLink = document.getElementById('navLogoutLink');
    const isLoggedIn = sessionStorage.getItem("Login") === "true";

    if (navLoginLink && navLogoutLink) {
        navLoginLink.style.display = isLoggedIn ? 'none' : 'list-item';
        navLogoutLink.style.display = isLoggedIn ? 'list-item' : 'none';
    }

    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.removeEventListener('click', handleLogout);
        btnLogout.addEventListener('click', handleLogout);
    }
}

export function updateMainContentVisibility() {
    const isLoggedIn = sessionStorage.getItem("Login") === "true";
    const DivLogin = document.getElementById('DivLogin');
    const DivPlace = document.getElementById('DivPlace');

    if (DivLogin && DivPlace) {
        if (isLoggedIn) {
            DivLogin.style.display = 'none';
            DivPlace.style.display = 'block';
            const mapInputElement = document.getElementById('mapInput');
            if (mapInputElement && !mapInputInstance && typeof initMapInput === 'function') {
                initMapInput();
            }
            const btnGeolocate = document.getElementById('btnGeolocate');
            if (btnGeolocate && !btnGeolocate.dataset.listenerAttached && typeof requestGeolocation === 'function') {
                btnGeolocate.addEventListener('click', requestGeolocation);
                btnGeolocate.dataset.listenerAttached = 'true';
            }
        } else {
            DivLogin.style.display = 'block';
            DivPlace.style.display = 'none';
            if (mapInputInstance) {
                try { mapInputInstance.remove(); } catch (e) {}
                mapInputInstance = null; inputMarker = null; selectedLat = null; selectedLng = null;
            }
        }
    }
}

// --- Firestore & Place Management Functions ---
async function registerPlace() {
    const divAnimationPlace = $("#DivAnimationPlace");
    const messagePlaceDiv = document.getElementById("messagePlace");
    divAnimationPlace.show();
    if(messagePlaceDiv) messagePlaceDiv.innerHTML = "";

    let fieldColor = document.getElementById("inputColor").value;
    let fieldSection = document.getElementById("inputSection").value;
    let fieldNumber = document.getElementById("inputNumber").value;

    if (fieldColor === "" || fieldSection.trim() === "" || fieldNumber.trim() === "") {
        divAnimationPlace.hide();
        if(messagePlaceDiv) messagePlaceDiv.innerHTML = '<div class="alert alert-danger">Invalid Data! Fill in Color, Section and Number.</div>';
        return;
    }

    const placeData = {
        Date: new Date().toString(),
        Color: fieldColor,
        Section: fieldSection,
        Number: fieldNumber,
        lat: selectedLat,
        lng: selectedLng
    };

    try {
        await addDoc(collection(db, "RegisterPlaces"), placeData);
        divAnimationPlace.hide();
        if(messagePlaceDiv) messagePlaceDiv.innerHTML = '<div class="alert alert-success">Place saved successfully!</div>';
        document.getElementById("inputColor").value = "";
        document.getElementById("inputSection").value = "";
        document.getElementById("inputNumber").value = "";
        selectedLat = null; selectedLng = null;
        if (inputMarker && mapInputInstance) {
            try { mapInputInstance.removeLayer(inputMarker); } catch (e) {}
            inputMarker = null;
        }
    } catch (error) {
        divAnimationPlace.hide();
        if(messagePlaceDiv) messagePlaceDiv.innerHTML = `<div class="alert alert-danger">Error saving place: ${error.message}</div>`;
        console.error("Error adding document: ", error);
    }
}

async function showPlaces() {
    if (sessionStorage.getItem("Login") !== "true") {
        window.location.href = "/index.html"; return;
    }

    const divAnimation = document.getElementById("DivAnimation");
    const divPlaces = document.getElementById("divPlaces");
    const messagePlacesDiv = document.getElementById("messagePlaces");

    if (divAnimation) $(divAnimation).show();
    if (messagePlacesDiv) messagePlacesDiv.innerHTML = "";
    if (divPlaces) divPlaces.innerHTML = "";

    let placesForMap = [];

    try {
        const q = query(collection(db, "RegisterPlaces"), orderBy("Date", "desc"));
        const querySnapshot = await getDocs(q);
        let HTMLstring = "";

        if (querySnapshot.empty) {
            HTMLstring = `<div class="list-group-item text-center text-muted p-3"><i class="fas fa-info-circle me-2"></i>No parking places registered yet.</div>`;
            if (typeof initMapDisplay === 'function') initMapDisplay([]);
        } else {
            querySnapshot.forEach((itemDoc) => {
                let data = itemDoc.data();
                placesForMap.push({ id: itemDoc.id, ...data }); // Collect data for map, including Firestore doc ID

                let displayDate = data.Date ? new Date(data.Date).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }) : "N/A";
                let badgeCssColor = data.Color ? defineColor(data.Color.trim()) : "lightgrey";
                let badgeTextColor = (["blue", "green", "red", "darkblue", "darkgreen", "darkred", "black"].includes(badgeCssColor)) ? "text-light" : "text-dark";
                if (["yellow", "orange", "lightyellow", "lightorange", "lightgrey"].includes(badgeCssColor)) badgeTextColor = 'text-dark';

                HTMLstring += `
                    <div class="list-group-item list-group-item-action flex-column align-items-start mb-3 shadow-sm rounded">
                        <div class="d-flex w-100 justify-content-between mb-2">
                            <h5 class="mb-1 fw-bold text-primary"><i class="fas fa-map-marker-alt me-2"></i>Section ${data.Section || "N/A"} - Spot ${data.Number || "N/A"}</h5>
                            <small class="text-muted">${displayDate}</small>
                        </div>
                        <p class="mb-1"><span class="fw-medium">Color:</span> <span class="badge ${badgeTextColor} p-2" style="background-color: ${badgeCssColor}; font-size: 0.9rem;">${data.Color || "N/A"}</span></p>
                        ${(data.lat && data.lng) ? `<small class="text-success d-block"><i class="fas fa-check-circle me-1"></i>Location on map</small>` : '<small class="text-muted d-block">No location marked</small>'}
                        <div class="mt-2 text-end">
                            <button class="btn btn-outline-danger btn-sm btn-delete-place" data-doc-id="${itemDoc.id}"><i class="fas fa-trash-alt me-1"></i>Delete</button>
                        </div>
                    </div>`;
            });
            if (divPlaces) divPlaces.innerHTML = HTMLstring;
            if (typeof initMapDisplay === 'function') initMapDisplay(placesForMap); // Call initMapDisplay with the fetched places
        }
    } catch (error) {
        console.error("Error getting documents: ", error);
        const errorMessage = `<div class="alert alert-danger">Error loading places: ${error.message}</div>`;
        if (messagePlacesDiv) messagePlacesDiv.innerHTML = errorMessage;
        else if (divPlaces) divPlaces.innerHTML = errorMessage;
        if (typeof initMapDisplay === 'function') initMapDisplay([]); // Attempt to init map even on error
    } finally {
        if (divAnimation) $(divAnimation).hide();
    }
}

async function deletePlace(docId) {
    if (!docId) { alert("Error: Document ID missing."); return; }
    const placeDocRef = doc(db, "RegisterPlaces", docId); // Ensure 'doc' function is imported from Firestore SDK
    const messagePlacesDiv = document.getElementById("messagePlaces");

    try {
        await deleteDoc(placeDocRef); // Ensure 'deleteDoc' is imported from Firestore SDK
        if (messagePlacesDiv) {
            messagePlacesDiv.innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">Place deleted! <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
            setTimeout(() => { const alertEl = messagePlacesDiv.querySelector('.alert'); if(alertEl && typeof bootstrap !== 'undefined' && bootstrap.Alert.getInstance(alertEl)) $(alertEl).alert('close'); else if(alertEl) alertEl.remove(); }, 4000);
        } else { alert("Place deleted successfully!"); }
        await showPlaces();
    } catch (error) {
        console.error("Error deleting document: ", error);
        if (messagePlacesDiv) messagePlacesDiv.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">Error deleting: ${error.message} <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
        else alert("Error deleting place: " + error.message);
    }
}

function setupPlaceEventListeners() {
    const divPlacesContainer = document.getElementById('divPlaces');
    if (divPlacesContainer && divPlacesContainer.dataset.listenerAttached !== 'true') {
        divPlacesContainer.addEventListener('click', async function(event) {
            const targetButton = event.target.closest('.btn-delete-place');
            if (targetButton) {
                event.preventDefault();
                const docId = targetButton.dataset.docId;
                if (docId && window.confirm("Are you sure you want to delete this parking place entry?")) {
                    await deletePlace(docId);
                }
            }
        });
        divPlacesContainer.dataset.listenerAttached = 'true';
    }
}

// --- Leaflet Map Functions ---
function requestGeolocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(updateMapToCurrentLocation, handleGeolocationError, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
    } else { alert("Geolocation is not supported by this browser."); }
}

function updateMapToCurrentLocation(position) {
    const userCoords = [position.coords.latitude, position.coords.longitude];
    if (mapInputInstance && typeof mapInputInstance.setView === 'function') {
        mapInputInstance.setView(userCoords, 16);
        if (inputMarker) try { mapInputInstance.removeLayer(inputMarker); } catch(e){}
        inputMarker = L.marker(userCoords, { draggable: true }).addTo(mapInputInstance)
            .bindPopup("Your current location.<br>Drag to adjust or click map to set new.").openPopup();
        selectedLat = userCoords[0]; selectedLng = userCoords[1];
        inputMarker.on('dragend', (event) => {
            const pos = event.target.getLatLng();
            selectedLat = pos.lat; selectedLng = pos.lng;
            console.log("Marker dragged to:", selectedLat, selectedLng);
        });
    } else {
        alert(`Location: Lat ${userCoords[0].toFixed(5)}, Lng ${userCoords[1].toFixed(5)}.\nMap not ready for update.`);
    }
}

function handleGeolocationError(error) {
    let message = "Geolocation error: ";
    switch (error.code) {
        case error.PERMISSION_DENIED: message += "Permission denied."; break;
        case error.POSITION_UNAVAILABLE: message += "Location unavailable."; break;
        case error.TIMEOUT: message += "Timeout."; break;
        default: message += "Unknown error."; break;
    }
    alert(message); console.error("Geolocation Error Full:", error);
}

function initMapInput() {
    const mapContainer = document.getElementById('mapInput');
    if (!mapContainer || typeof L === 'undefined' || mapInputInstance) return; // Check Leaflet (L) and if already initialized
    
    selectedLat = null; selectedLng = null;
    if (inputMarker && mapInputInstance) { try { mapInputInstance.removeLayer(inputMarker); } catch(e){} inputMarker = null; }

    try {
        mapInputInstance = L.map('mapInput').setView([41.14961, -8.61099], 13); // Default: Porto
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInputInstance);
        
        mapInputInstance.on('click', (e) => {
            selectedLat = e.latlng.lat; selectedLng = e.latlng.lng;
            if (inputMarker) mapInputInstance.removeLayer(inputMarker);
            inputMarker = L.marker([selectedLat, selectedLng], { draggable: true }).addTo(mapInputInstance)
                .bindPopup("Selected location.<br>Drag to adjust.").openPopup();
            inputMarker.on('dragend', (event) => {
                const pos = event.target.getLatLng();
                selectedLat = pos.lat; selectedLng = pos.lng;
                console.log("Marker dragged to:", selectedLat, selectedLng);
            });
        });
        // Use a slight delay for invalidateSize, especially if map is in a initially hidden div
        setTimeout(() => { if (mapInputInstance) mapInputInstance.invalidateSize(); }, 250); 
        console.log("Input map initialized.");
    } catch (error) {
        console.error("Error initializing input map:", error);
        mapContainer.innerHTML = '<p class="text-danger text-center p-3">Error loading map. Ensure internet connection.</p>';
    }
}

function initMapDisplay(places = []) {
    const mapContainer = document.getElementById('mapDisplay');
    const mapLoadingDiv = document.getElementById('mapDisplayLoading');

    if (!mapContainer || typeof L === 'undefined') {
        console.error("Element #mapDisplay not found or Leaflet library not loaded.");
        if(mapLoadingDiv) mapLoadingDiv.style.display = 'none';
        return;
    }
    if (mapLoadingDiv) $(mapLoadingDiv).show();
    if (mapContainer) mapContainer.innerHTML = '';

    if (mapDisplayInstance) { try { mapDisplayInstance.remove(); } catch (e) {} mapDisplayInstance = null; }
    
    const defaultCoords = [41.14961, -8.61099]; // Porto
    const defaultZoom = 7;

    try {
        mapDisplayInstance = L.map('mapDisplay').setView(defaultCoords, defaultZoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapDisplayInstance);

        const markers = [];
        const placesWithCoords = places.filter(p => 
            p.lat != null && p.lng != null && 
            !isNaN(parseFloat(p.lat)) && !isNaN(parseFloat(p.lng))
        );

        if (placesWithCoords.length > 0) {
            placesWithCoords.forEach(place => {
                const coords = [parseFloat(place.lat), parseFloat(place.lng)];
                const popupText = `<b>Color: ${place.Color || 'N/A'}</b><br>Sec: ${place.Section || 'N/A'}, No: ${place.Number || 'N/A'}`;
                
                const markerCssColor = defineColor(place.Color ? place.Color.trim() : ''); 
                const iconSvg = `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 30" width="30px" height="38px">
                        <path d="M12 0C7.03 0 3 4.03 3 9c0 6.05 9 18.44 9 18.44S21 15.05 21 9c0-4.97-4.03-9-9-9zm0 12.75c-2.07 0-3.75-1.68-3.75-3.75S9.93 5.25 12 5.25s3.75 1.68 3.75 3.75-1.68 3.75-3.75 3.75z" 
                              fill="${markerCssColor}" stroke="#FFFFFF" stroke-width="1.5"/>
                        <circle cx="12" cy="9" r="3" fill="white" opacity="0.7"/>
                    </svg>`;

                const customIcon = L.divIcon({
                    html: iconSvg,
                    className: 'custom-leaflet-div-icon',
                    iconSize: [30, 38],
                    iconAnchor: [15, 38],
                    popupAnchor: [0, -38]
                });

                markers.push(L.marker(coords, { icon: customIcon }).bindPopup(popupText));
            });
            if (markers.length > 0) {
                const group = L.featureGroup(markers).addTo(mapDisplayInstance);
                mapDisplayInstance.fitBounds(group.getBounds().pad(0.2));
            }
        } else {
            if (mapContainer) mapContainer.innerHTML = '<p class="text-muted text-center p-5">No locations with coordinates to display on the map.</p>';
        }
        setTimeout(() => { if (mapDisplayInstance) mapDisplayInstance.invalidateSize(); }, 250);
    } catch (error) {
        console.error("Error initializing display map:", error);
        if (mapContainer) mapContainer.innerHTML = '<p class="text-danger text-center p-3">Error loading map. Ensure internet connection.</p>';
    } finally {
        if (mapLoadingDiv) $(mapLoadingDiv).hide();
    }
}

// --- Helper Functions ---
function defineColor(colorName) {
    if (!colorName) return 'grey'; // Default color if name is undefined or empty
    switch (colorName.toLowerCase()) {
        case "yellow": return "gold";    // Using "gold" for better visibility than "yellow"
        case "red":    return "red";
        case "green":  return "green";
        case "blue":   return "dodgerblue"; // Using "dodgerblue" for better visibility
        case "orange": return "orange";
        default:       return "grey";   // Default for unknown colors
    }
}

// --- End of app-functions.js ---