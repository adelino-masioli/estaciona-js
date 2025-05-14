# 🚗 Firebase Park  
### *Your Cloud-Powered Car Park Locator*

---

## 👤 Author

**Adelino Masioli** — *Software Engineer*  
✉️ [adelinomasioli@gmail.com](mailto:adelinomasioli@gmail.com)  
🌐 [adelinomasioli.com](https://adelinomasioli.com)  
📱 +351 932 992 170  

## 🎓 Professor

**José Joaquim Moreira** — *Project Coordinator*  
✉️ [jose.moreira@islagaia.pt](mailto:jose.moreira@islagaia.pt)

---

## 🅿️ About the Project

**Firebase Park** (formerly *Estaciona JS*) is a web application that helps you **remember where you parked your car**. This enhanced version uses **Firebase** for backend services, including:

- 🔐 User Authentication  
- ☁️ Cloud Firestore (real-time NoSQL database)

Users can save important details like color, section, number, and pinpoint the exact location using an interactive map. All data is securely stored in the cloud and accessible from any device after login.

---

## 📸 Screenshots

> *(Screenshots might need an update to reflect Firebase integration and UI improvements)*

**Login / Register Spot**  
![Home Page](assets/images/screen/screencapture-home.png)

**View Saved Parking Places (with map & colored pins)**  
![View Parking Spot](assets/images/screen/screencapture-place.png)

**About Page**  
![About Page](assets/images/screen/screencapture-about.png)

---

## 🎓 Academic Context

This project was developed as part of the **Master’s in Engineering of Web Technologies and Systems** at  
**ISLA Gaia – Instituto Politécnico de Gestão e Tecnologia** 🇵🇹  
for the course: **Programação Web Avançada** (Advanced Web Programming).

**Student:** Adelino Masioli  
**Degree:** Mestrado em Engenharia de Tecnologias e Sistemas Web  

---

## ✨ Features

- 🔐 **User Authentication** via Firebase
- ☁️ **Cloud Database (Firestore)** for storing parking spots
- 📝 **Form Input**: Register spot details (color, section, number, map location)
- 🗺️ **Interactive Map** with Leaflet.js for location selection
- 📍 **GPS Integration**: Option to use current location
- 🎨 **Colored Pins**: Markers match the chosen color for each spot
- 🚮 **Delete Functionality**: Remove saved entries
- 🔄 **Dynamic UI Updates**: Login/logout and navigation state updates
- 💅 **Responsive Design**: Built with Bootstrap 5
- 🧩 **Reusable Components**: Header/footer with jQuery includes
- 📁 **Organized Codebase**: Clean project structure for maintainability

---

## 🛠️ Tech Stack

| Tech | Badge |
|------|-------|
| HTML5 | ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) |
| CSS3 | ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) |
| JavaScript | ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) |
| Bootstrap 5 | ![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white) |
| jQuery | ![jQuery](https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white) |
| Leaflet.js | ![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white) |
| Firebase | ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black) |

---

## 📂 Project Structure


*(Adjust if your paths for `styles.css`, `app-functions.js`, etc., have changed to be within `/assets/` as per recent code snippets)*

* 📁 `FIREBASE_PARK/` (Or your project's root folder name)
    * 📁 `about/`
        * 📄 `index.html`        *(About page)*
    * 📁 `assets/`
        * 📁 `css/`
            * 📄 `styles.css`     *(Custom application styles)*
        * 📁 `images/`
            * 🖼️ `park.png`       *(Main application icon used in pages)*
            * 🖼️ `park-icon.png`  *(Smaller icon for header, optional)*
            * 🖼️ `favicon.ico`    *(Browser tab icon)*
            * 📁 `screen/`        *(Folder for screenshots)*
                * 🖼️ `screencapture-home.png`
                * 🖼️ `screencapture-place.png`
                * 🖼️ `screencapture-about.png`
        * 📁 `js/`
            * 📄 `app-functions.js`  *(Core application JavaScript logic with Firebase)*
            * 📄 `firebase-config.js` *(Firebase project configuration)*
    * 📁 `includes/`
        * 📄 `footer.html`       *(Reusable footer component)*
        * 📄 `header.html`       *(Reusable header/navigation component)*
    * 📁 `places/`
        * 📄 `index.html`        *(Page to view saved parking spots and map)*
    * 📁 `register/`
        * 📄 `index.html`        *(User registration page)*
    * 📄 `index.html`            *(Main page: Login / Register a parking spot)*
    * 📄 `README.md`            *(This file)*


---

## 🚀 Getting Started

### 1. **Firebase Setup**

- Create a Firebase project at [firebase.google.com](https://firebase.google.com/)
- Add a Web App and copy the config object
- Paste it into `/assets/js/firebase-config.js`
- Enable:
  - 🔐 **Authentication** (Email/Password)
  - ☁️ **Firestore Database** (use Native mode)
  - ⚠️ For development:  
    ```
    allow read, write: if true;
    ```
    *(Secure this for production!)*

### 2. **Clone & Run**

- Download or clone the repo
- Open with a web server (direct `file://` won't work)

### 3. **Using VS Code + Live Server (Recommended)**

- Install [VS Code](https://code.visualstudio.com/)
- Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension
- Open the project folder
- Right-click `index.html` → "Open with Live Server"
- Navigate to `http://127.0.0.1:5500` in your browser

### 4. **App Usage**

- Register or log in
- On the **Home** page:
  - Enter parking details
  - Choose location via map or GPS
  - Click **Save Place**
- Go to **Places** to view/delete saved entries
- Use **Logout** in the header to sign out

---

## 🙏 Credits

Developed as part of the **METS (2024–2025)** academic program, this project expands upon an original exercise by incorporating **Firebase** integration and enhanced functionality.

---
