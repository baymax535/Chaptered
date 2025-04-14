# Chaptered
A sleek web app for discovering, summarizing, and reviewing books &amp; movies.
## Table of Contents  
- [Chaptered](#chaptered)
  - [Table of Contents](#table-of-contents)
  - [How to run the WebApp](#how-to-run-the-webapp)
  - [Project Structure](#project-structure)

## How to run the WebApp

1. Open a terminal 
2. Navigate to the web app directory using this command 

```sh
cd WebApp
```

3. Install the dependencies 

```sh
npm install
npm install react-router-dom axios

```

4. Start the server 

```sh
npm run dev
```

5. Click on the link when it appears to view the website


## Project Structure
```sh
Chaptered/
│── WebApp/               # Frontend of the application
│   ├── public/           # Static assets (logos, images, etc.)
│   ├── src/              # Source files
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components (Home, Reviews, etc.)
│   │   ├── assets/       # Images, icons, etc.
│   │   ├── App.tsx       # Main application file
│   │   ├── main.tsx      # React entry point
│   │   ├── index.css     # Global styles
│   ├── package.json      # Project dependencies and scripts
│   ├── vite.config.ts    # Vite configuration
│── Backend/              # Backend API (Django)
│   
│── database/             # SQL database setup & migrations
│   
│── README.md             # Project documentation
```
