# Wrestling Universe

## Project Description
Our platform offers a complete experience inspired by the WWE Universe mode, designed for every user to manage their own wrestling world in a dynamic, customizable, and intuitive way. From managing wrestlers to setting up events and rivalries, the system is built to continuously evolve and expand (some features are still in development).

**Key Features:**
* **Settings:** Customize your experience by selecting the language, light/dark mode, adjusting music and sound effects volume, toggling intergender matches, and managing your account/session.
* **Jukebox:** Access all available songs on the platform. Create custom playlists (minimum one song), shuffle your selections, or instantly play any track directly from the Jukebox view without adding it to a playlist.
* **Minigames:** Currently featuring one available title where you choose one of 12 characters and battle the other 11 in matches up to three rounds, adding a quick, competitive challenge to the experience.
* **Admin Dashboard:** An exclusive view for administrators to manage the core content of the site. It allows creating, modifying, and deleting wrestlers, as well as assigning their theme songs.
* **Authentication:** All features are protected by user authentication. Unauthenticated users are automatically redirected to the login page. The app also includes a registration view and a 404 error page to ensure complete and coherent navigation.

## Framework & Libraries
This project is built using **React** with **Vite** as the bundler.

**Core:**
* React (`^19.2.0`)
* React DOM (`^19.2.0`)
* Vite (`^7.2.4`)
* React Router DOM (`^7.12.0`) - *Routing*

**Backend / Services:**
* Supabase JS (`^2.90.1`) - *Database, Auth & API*

**UI / Styling / Animation:**
* Bootstrap (`^5.3.8`) - *Responsive Design*
* Sass Embedded (`^1.97.2`) - *CSS Preprocessor*
* Framer Motion (`^12.27.1`) - *Animations*
* SweetAlert2 (`^11.26.21`) - *Custom Alerts*
* FontAwesome Free (`^7.1.0`) - *Icons*

**Internationalization (i18n):**
* i18next (`^25.8.0`)
* react-i18next (`^16.5.3`)
* i18next-browser-languagedetector (`^8.2.0`)
* i18next-http-backend (`^3.0.2`)

**Deployment & PWA Tools:**
* gh-pages (`^6.3.0`) - *GitHub Pages Deployment*
* vite-plugin-pwa (`^1.2.0`) - *PWA Support*

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Installation Guide

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/IvanSanchez18/tfg-2daw-ivan.git](https://github.com/IvanSanchez18/tfg-2daw-ivan.git)
   cd wrestling_universe
2. **Install dependencies:**
   ```bash
   npm install
3. **Environment Variables:**# Wrestling Universe

## Project Description
Our platform offers a complete experience inspired by the WWE Universe mode, designed for every user to manage their own wrestling world in a dynamic, customizable, and intuitive way. From managing wrestlers to setting up events and rivalries, the system is built to continuously evolve and expand (some features are still in development).

**Key Features:**
* **Settings:** Customize your experience by selecting the language, light/dark mode, adjusting music and sound effects volume, toggling intergender matches, and managing your account/session.
* **Jukebox:** Access all available songs on the platform. Create custom playlists (minimum one song), shuffle your selections, or instantly play any track directly from the Jukebox view without adding it to a playlist.
* **Minigames:** Currently featuring one available title where you choose one of 12 characters and battle the other 11 in matches up to three rounds, adding a quick, competitive challenge to the experience.
* **Admin Dashboard:** An exclusive view for administrators to manage the core content of the site. It allows creating, modifying, and deleting wrestlers, as well as assigning their theme songs.
* **Authentication:** All features are protected by user authentication. Unauthenticated users are automatically redirected to the login page. The app also includes a registration view and a 404 error page to ensure complete and coherent navigation.

## Framework & Libraries
This project is built using **React** with **Vite** as the bundler.

**Core:**
* React (`^19.2.0`)
* React DOM (`^19.2.0`)
* Vite (`^7.2.4`)
* React Router DOM (`^7.12.0`) - *Routing*

**Backend / Services:**
* Supabase JS (`^2.90.1`) - *Database, Auth & API*

**UI / Styling / Animation:**
* Bootstrap (`^5.3.8`) - *Responsive Design*
* Sass Embedded (`^1.97.2`) - *CSS Preprocessor*
* Framer Motion (`^12.27.1`) - *Animations*
* SweetAlert2 (`^11.26.21`) - *Custom Alerts*
* FontAwesome Free (`^7.1.0`) - *Icons*

**Internationalization (i18n):**
* i18next (`^25.8.0`)
* react-i18next (`^16.5.3`)
* i18next-browser-languagedetector (`^8.2.0`)
* i18next-http-backend (`^3.0.2`)

**Deployment & PWA Tools:**
* gh-pages (`^6.3.0`) - *GitHub Pages Deployment*
* vite-plugin-pwa (`^1.2.0`) - *PWA Support*

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Installation Guide

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/IvanSanchez18/tfg-2daw-ivan.git](https://github.com/IvanSanchez18/tfg-2daw-ivan.git)
   cd wrestling_universe
2. **Install dependencies:**
   ```bash
   npm install
3. **Environment Variables:**

    Create a .env file in the root directory and add your Supabase credentials (and any other necessary variables):
    ```
    VITE_SUPABASE_URL=provided_url
    VITE_SUPABASE_ANON_KEY=provided_anon_key
    ```
4. **Run the development server:**
    ```bash
   npm run dev

    Create a .env file in the root directory and add your Supabase credentials (and any other necessary variables):
    ```
      VITE_SUPABASE_URL=provided_url
      VITE_SUPABASE_ANON_KEY=provided_anon_key
 
4. **Run the development server:**
    ```bash
   npm run dev