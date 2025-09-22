# EventFrame: A Dual Photo Frame Generator

This project contains two photo frame applications built with React, TypeScript, and Firebase, designed to be deployed as a single, cohesive web app.

## Live Applications

-   **"I will be Seen" (Attending Frame):** [https://gefmixer.web.app](https://gefmixer.web.app)
    -   *Generate a custom profile picture to show you'll be attending an event.*
-   **"I was at the Event" (Live Gallery Frame):** [https://gefmixer.web.app/gallery](https://gefmixer.web.app/gallery)
    -   *A live photo booth experience for attendees at an event.*

## Features

-   **Two Projects in One:** A seamless user experience combining a pre-event "I will be attending" frame generator and a live event photo booth.
-   **Image Upload & Cropping:** Users can upload, pan, and zoom their photos to get the perfect fit.
-   **Real-time Galleries:** Photo galleries update in real-time as new images are created, powered by Firestore.
-   **Social Sharing:** Easily share the generated photos to Twitter, Facebook, LinkedIn, or download them directly.
-   **Built with Firebase:** Leverages Firebase Storage for image hosting and Firestore for real-time database updates.

## Tech Stack

-   **Frontend:** React, TypeScript
-   **Backend:** Firebase (Firestore, Storage)
-   **Styling:** CSS
-   **Deployment:** Firebase Hosting

## Contributing

This project is open for contributions! Feel free to fork the repository, make changes, and submit a pull request.

**GitHub Repo:** [https://github.com/stont/eventframe](https://github.com/stont/eventframe)

### Local Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/stont/eventframe.git
    cd eventframe
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up Firebase:**
    -   Create a new Firebase project.
    -   Copy your Firebase configuration into `src/firebase.ts`.
4.  **Run the development server:**
    ```bash
    npm run dev
    ```
