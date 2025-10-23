# GameZone - Setup & Requirements

This document provides instructions on how to set up and run the GameZone application on your local machine.

---

## 1. Prerequisites

Before you begin, ensure you have the following installed:

- **A Modern Web Browser**: Google Chrome, Mozilla Firefox, Safari, or Microsoft Edge.
- **A Code Editor (Optional)**: Visual Studio Code with the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) is recommended for the best experience.
- **Internet Connection**: Required to fetch game data from the live RAWG API.

> **Note**: This project does **not** require Node.js, npm, or any package manager. All dependencies are loaded directly in the browser via a CDN.

---

## 2. Installation & Running

The application is designed to be run directly in a browser without a complex build process.

### Step 1: Get the Code

Download the project files as a ZIP archive or clone the repository to your local machine.

### Step 2: Configure the API Key (Optional but Recommended)

The application requires an API key to fetch data from the RAWG Video Games Database. A public, placeholder key is already included for immediate use. However, these keys can sometimes be rate-limited. For the most reliable experience, it is highly recommended to get your own free API key.

1.  Visit [rawg.io/apidocs](https://rawg.io/apidocs) and create a free account.
2.  You will be given a personal API key.
3.  Open the `index.html` file in your code editor.
4.  Find the following script block near the bottom of the file:
    ```html
    <script>
      var process = {
        env: {
          RAWG_API_KEY: '5dd85062352e4af7979fc7e87121af6e' // <-- REPLACE THIS VALUE
        }
      };
    </script>
    ```
5.  Replace the placeholder `RAWG_API_KEY` value with your own personal key. Save the file.

### Step 3: Run the Application

Because the application loads modules (`index.tsx`), you must serve the files from a local web server. **Simply opening the `index.html` file directly in your browser from your file system will not work.**

#### Recommended Method: VS Code Live Server

1.  Open the project folder in Visual Studio Code.
2.  If you don't have it, install the **Live Server** extension from the Extensions marketplace.
3.  Right-click the `index.html` file in the Explorer panel and select **"Open with Live Server"**.
4.  Your browser will automatically open the application, running on a local server (e.g., `http://127.0.0.1:5500`).

#### Alternative Method: Python Web Server

If you have Python installed, you can use its built-in web server.

1.  Open your terminal or command prompt.
2.  Navigate into the project directory (the folder containing `index.html`).
3.  Run the following command:
    ```bash
    python -m http.server
    ```
4.  Open your web browser and go to `http://localhost:8000`.

---

## 3. Dependencies

All external dependencies are loaded via a Content Delivery Network (CDN) using an `importmap` in `index.html`. This means there is **no `npm install` step required**.

The following libraries are used:
- **React** & **React DOM**
- **React Router**
- **Tailwind CSS** (via its CDN script)
