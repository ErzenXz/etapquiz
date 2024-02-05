# eTapQuiz - Online Quiz App

Welcome to eTapQuiz, an online quiz application where users can create quizzes, set start times, and challenge others to participate in live quizzes. This README provides an overview of the project, its features, and instructions for setup.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [Creating a Quiz](#creating-a-quiz)
  - [Joining a Quiz](#joining-a-quiz)
- [Live Quiz Experience](#live-quiz-experience)
- [Leaderboard](#leaderboard)
- [Contributing](#contributing)
- [License](#license)

## Features

- Users can create and manage quizzes.
- Set a start time for quizzes to make them live for participants.
- Participants join quizzes at the scheduled start time.
- All participants receive the same set of questions simultaneously.
- Real-time quiz experience with a countdown timer.
- Leaderboard to track and display participants' scores.

## Getting Started

### Prerequisites

- **Web Server:** Any server capable of hosting websites should work. If you don't have one, you can install [Nginx](https://nginx.org/) or [Apache](https://httpd.apache.org/).
- **Firebase Account:**
  - Ensure you have a Firebase account. If not, you can [sign up for Firebase](https://firebase.google.com/).
  - Create a Firestore database for storing user data.
  - Set up a Realtime Database for additional real-time functionality.


### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/eTapQuiz.git
   ```

2. Navigate to the project directory:

```bash
cd eTapQuiz
```

3. Change Firebase credentials to your own:

```html
<script>

         const firebaseConfig = {
            apiKey: "",
            authDomain: "",
            databaseURL: "",
            projectId: "",
            storageBucket: "",
            messagingSenderId: "",
            appId: "",
            measurementId: "",
         };
         firebase.initializeApp(firebaseConfig);
      </script>
```

4. Start the application:

```
You need to have a web server, if your testing this use Live Server from VSCode
```
The application should be accessible at http://localhost:5500.
You need to check the port your server is running because it may be different from this.

## Usage

### Creating a Quiz
1. Log in or create a new account.
2. Navigate to the "Create Quiz" section.
3. Fill in the details, set the start time, and add questions.
4. Save the quiz.

### Joining a Quiz
1. Log in or create a new account.
2. Browse the available quizzes.
3. Enroll in a quiz before the scheduled start time by just clicking on it.
4. Wait until it says Started then join!

### Live Quiz Experience
- Participants experience the quiz in real-time.
- Questions are presented simultaneously to all participants.
- Countdown timer ensures a time-limited challenge.
- Participants submit their answers within the given time.

## Leaderboard
- The leaderboard displays participants' scores in real-time.
- Updated dynamically as participants submit answers.

## Contributing
Contributions are welcome! Please follow the [contribution guidelines](CONTRIBUTING.md).

## License
This project is licensed under the [GNU Affero General Public License v3.0](LICENSE).


