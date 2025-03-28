# 🚗 Estaciona JS - Your Car Park Locator

A simple web application designed to help you remember where you parked your car! 🅿️ Save the colour, section, number, and pinpoint the location on a map, all stored directly in your browser's local storage.

---

## 🎓 Academic Context

This project was developed within the following academic framework:

* **Institution:** ISLA Gaia – Instituto Politécnico de Gestão e Tecnologia 🇵🇹
* **Master's Degree:** Engenharia de Tecnologias e Sistemas Web (Engineering of Web Technologies and Systems)
* **Course:** Programação Web Avançada (Advanced Web Programming)
* **Student:** Adelino Masioli

---

## ✨ Features

* 📝 Input form for parking spot details (Colour, Section, Number).
* 🗺️ Interactive map (using Leaflet.js) to visually select or pinpoint your exact parking location.
* 📍 Option to use your current GPS location to centre the map (requires browser permission).
* 💾 Saves data persistently in the browser's `localStorage` – no server-side database needed!
* 👀 View the last saved parking spot details, including its location marked clearly on a map.
* 🎨 Dynamic background colour on the details page that matches the saved spot colour for quick visual reference.
* 💅 Styled with Bootstrap 5 for a clean, responsive interface.
* 🧩 Uses jQuery to dynamically load reusable header and footer components across different pages.
* 📁 Organised project structure with separate pages for different functions (`register`, `view`, `about`).

---

## 🛠️ Tech Stack

This project utilises the following technologies:

* ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
* ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
* ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
* ![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)
* ![jQuery](https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white)
* ![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)
* 💾 Browser LocalStorage API

---

## 📂 Project Structure

* 📁 `ESTACIONAJS/`
    * 📁 `estilos/`
        * 📄 `style.css`         *(Custom application styles)*
    * 📁 `images/`
        * 🖼️ `estacionamento.png` *(Main application icon)*
        * 🖼️ `favicon.ico`       *(Browser tab icon)*
    * 📁 `includes/`
        * 📄 `footer.html`       *(Reusable footer component)*
        * 📄 `header.html`       *(Reusable header/navigation component)*
    * 📁 `js/`
        * 📄 `index.js`          *(Core application JavaScript logic)*
    * 📁 `lugar/`
        * 📄 `index.html`        *(Page to view the saved parking spot)*
    * 📁 `sobre/`
        * 📄 `index.html`        *(About page providing application info)*
    * 📄 `index.html`            *(Main page to register a parking spot)*

---

## 🚀 Getting Started

To run this application locally, follow these steps:

1.  **Clone or Download:** Get a copy of this repository onto your local machine.
2.  **Web Server Required:** This project needs to be served by a web server due to the use of jQuery's `.load()` for includes and potentially for the Geolocation API context. Simply opening the `index.html` file directly in the browser (`file:///...`) will likely **not** work correctly.
3.  **Using VS Code & Live Server (Recommended):**
    * Ensure you have [Visual Studio Code](https://code.visualstudio.com/) installed.
    * Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension from the VS Code Marketplace.
    * Open the project folder (`ESTACIONAJS/`) in VS Code.
    * Right-click on the root `index.html` file within the VS Code Explorer.
    * Select "Open with Live Server".
4.  **Access the App:** Your default web browser should automatically open the application, typically at an address like `http://127.0.0.1:5500` (the port number may vary).
5.  **Usage:**
    * Use the navigation menu ("Registar Lugar", "Ver Lugar", "Sobre") to move between pages.
    * On the "Registar Lugar" page, fill in the details and optionally click/drag on the map to set the location.
    * Click "Usar Localização" in the menu to attempt centering the map on your current GPS location (you will need to grant permission when the browser asks).
    * Click "Guardar lugar" to save the information.
    * Visit "Ver Lugar" to see the saved details and map marker.

---

## 🙏 Credits

This application is based on an exercise specification provided by METSW (2024-2025) and developed in the context mentioned above.

---