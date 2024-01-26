const user = firebase.auth().currentUser;
const database = firebase.database();
const firestore = firebase.firestore();
let waitTimeBetweenQuestions = 5000; // 5 seconds

let uid = user ? user.uid : null;

firebase.auth().onAuthStateChanged((user) => {
   if (user) {
      uid = user.uid;

      // Get user personal data from firestore

      const userRef = firestore.collection("users").doc(uid);

      userRef.get().then((doc) => {
         if (doc.exists) {
            const data = doc.data();

            username = data.username;
            email = data.email;
            fullname = data.fullName;
         } else {
            console.log(":(");
         }
      });
   } else {
      uid = null;
   }
});

let email;
let username;
let fullname;

const myQuizRef = firebase.database().ref("quizesP/" + uid + "/");

const allQuizRef = firebase.database().ref("quizes/public/").orderByChild("time");
const allQuizRef2 = firebase.database().ref("quizes/public/");

const myREF = firebase.database().ref("usersP/" + uid + "/");

function createQuiz() {
   // Check if the user has given an input json file

   const file = document.getElementById("importFile").files[0];

   if (file) {
      // If file is JSON

      if (!file.name.endsWith(".json")) {
         toast("Invalid File Type - Only JSON Files are allowed");
         return false;
      }

      // Read the file
      const reader = new FileReader();
      reader.onload = function (e) {
         try {
            const json = JSON.parse(e.target.result);
            const quizName = json.name;
            const quizDescription = json.description;
            const quizReward = json.reward;
            let quizTime = json.time;
            let visibility = json.visibility;

            // SEE if the user has given a valid visibility if not leave it as it is

            if (
               document.getElementById("public").checked === false &&
               document.getElementById("private").checked === false
            ) {
               visibility = visibility;
            } else {
               if (document.getElementById("public").checked) {
                  visibility = "public";
               } else {
                  visibility = "private";
               }
            }

            const quizAnswerTime = json.answerTime;
            const quizPoints = json.pointsPerQuestion;
            let questionsArray = [];
            const questions = json.questions;
            let time = document.getElementById("quizTime").value;
            let unlockTime = 0;
            let correctAnsRevealT = 0;
            let timeInTimestamp = new Date(time).getTime();
            quizTime = new Date(time).getTime();

            for (let i = 0; i < questions.length; i++) {
               const question = questions[i];

               let questionUnlock = timeInTimestamp + waitTimeBetweenQuestions + unlockTime;

               let correctAnsRevealTime = timeInTimestamp + correctAnsRevealT;
               correctAnsRevealT += quizAnswerTime * 1000;

               if (i === 0) {
                  questionUnlock = timeInTimestamp;
                  unlockTime += quizAnswerTime * 1000;
               } else {
                  unlockTime += quizAnswerTime * 1000 + waitTimeBetweenQuestions;
               }

               let questionObject = {
                  question: question.question,
                  answers: [
                     question.answers[0],
                     question.answers[1],
                     question.answers[2],
                     question.answers[3],
                  ],
                  correct: question.correct,
                  unlockTime: questionUnlock,
                  correctAnsRevealTime: correctAnsRevealTime,
               };
               questionsArray.push(questionObject);
            }

            const quiz = {
               name: quizName,
               description: quizDescription,
               reward: quizReward,
               time: quizTime,
               visibility: visibility,
               questions: questionsArray,
               creator: uid,
               creation_time: Date.now(),
               leaderboard: [],
               pointsPerQuestion: quizPoints,
               answerTime: quizAnswerTime,
               responses: [],
               waitTimeBetweenQuestions: waitTimeBetweenQuestions,
            };
            console.log(quiz);
            let randomQuizCode = Math.floor(Math.random() * 1000000000);
            quiz.code = randomQuizCode;
            // Add the quiz to the database
            if (visibility === "public") {
               database.ref("quizes/public/").push().set(quiz);
               database
                  .ref("quizesP/" + uid + "/")
                  .push()
                  .set(quiz);
               toast("Quiz Created Successfully");
            } else {
               database.ref(`quizes/private/${randomQuizCode}`).set(quiz);
               database
                  .ref("quizesP/" + uid + "/")
                  .push()
                  .set(quiz);
               toast("Quiz Created Successfully with code: " + randomQuizCode);
            }
         } catch (error) {
            toast("Invalid JSON File");
            return false;
         }
      };
      reader.readAsText(file);
   } else {
      const quizName = document.getElementById("qtitle").value;
      const quizDescription = document.getElementById("qdescription").value;
      const quizReward = document.getElementById("quizReward").value;
      const quizTime = document.getElementById("quizTime").value;
      const public = document.getElementById("public").checked;
      const private = document.getElementById("private").checked;

      let visibility;

      if (public) {
         visibility = "public";
      } else if (private) {
         visibility = "private";
      } else {
         visibility = "public";
      }

      const quizAnswerTime = document.getElementById("quizAnswerTime").value;
      const quizPoints = document.getElementById("quizPoints").value;

      let questionsArray = [];

      let time = new Date(quizTime);

      const questions = document.getElementById("questions").children;

      let unlockTime = 0;
      let correctAnsRevealT = 0;

      let timeInTimestamp = time.getTime();

      for (let i = 0; i < questions.length; i++) {
         let question = questions[i].children;

         // Make question unlock time 5 s after each other question to prevent cheating and to make the quiz more fun

         let questionUnlock = timeInTimestamp + waitTimeBetweenQuestions + unlockTime;

         let correctAnsRevealTime = timeInTimestamp + correctAnsRevealT;
         correctAnsRevealT += quizAnswerTime * 1000;

         if (i === 0) {
            questionUnlock = timeInTimestamp;
            unlockTime += quizAnswerTime * 1000;
         } else {
            unlockTime += quizAnswerTime * 1000 + waitTimeBetweenQuestions;
         }

         let questionObject = {
            question: question[0].value,
            answers: [question[1].value, question[2].value, question[3].value, question[4].value],
            correct: question[5].value,
            unlockTime: questionUnlock,
            correctAnsRevealTime: correctAnsRevealTime,
         };

         questionsArray.push(questionObject);
      }

      const quiz = {
         name: quizName,
         description: quizDescription,
         reward: quizReward,
         time: new Date(quizTime).getTime(),
         visibility: visibility,
         questions: questionsArray,
         creator: uid,
         creation_time: Date.now(),
         leaderboard: [],
         pointsPerQuestion: quizPoints,
         answerTime: quizAnswerTime,
         responses: [],
         waitTimeBetweenQuestions: waitTimeBetweenQuestions,
      };

      console.log(quiz);

      let randomQuizCode = Math.floor(Math.random() * 1000000000);

      quiz.code = randomQuizCode;

      // Add the quiz to the database

      if (visibility === "public") {
         database.ref("quizes/public/").push().set(quiz);
         database
            .ref("quizesP/" + uid + "/")
            .push()
            .set(quiz);
         toast("Quiz Created Successfully");
      } else {
         database.ref(`quizes/private/${randomQuizCode}`).push().set(quiz);
         database
            .ref("quizesP/" + uid + "/")
            .push()
            .set(quiz);
         toast("Quiz Created Successfully with code: " + randomQuizCode);
      }
   }
}

let questionNO = 0;

function addQuestion() {
   questionNO++;
   const question = document.getElementById("questions");

   let qI = document.createElement("input");
   qI.type = "text";
   qI.placeholder = "Question " + questionNO;
   qI.className = "form-control";

   let aI = document.createElement("input");
   aI.type = "text";
   aI.placeholder = "A";
   aI.className = "form-control";

   let bI = document.createElement("input");
   bI.type = "text";
   bI.placeholder = "B";
   bI.className = "form-control";

   let cI = document.createElement("input");
   cI.type = "text";
   cI.placeholder = "C";
   cI.className = "form-control";

   let dI = document.createElement("input");
   dI.type = "text";
   dI.placeholder = "D";
   dI.className = "form-control";

   let correctI = document.createElement("input");
   correctI.type = "text";
   correctI.placeholder = "Correct Answer";
   correctI.className = "form-control";

   let questionDiv = document.createElement("div");
   questionDiv.className = "form-group";

   let deleteButton = document.createElement("span");
   deleteButton.className = "btn btn-danger";
   deleteButton.innerHTML = `<i class="fa-solid fa-trash"></i>`;
   deleteButton.onclick = function () {
      question.removeChild(questionDiv);
   };

   questionDiv.appendChild(qI);
   questionDiv.appendChild(aI);
   questionDiv.appendChild(bI);
   questionDiv.appendChild(cI);
   questionDiv.appendChild(dI);
   questionDiv.appendChild(correctI);
   questionDiv.appendChild(deleteButton);

   question.appendChild(questionDiv);
}

let timeNOW;

let timeDiff = 0;

// Function to sync the time with the server

let api = "https://worldtimeapi.org/api/timezone/Europe/Belgrade";

function syncTime() {
   fetch(api)
      .then((response) => {
         return response.json();
      })
      .then((data) => {
         timeNOW = data.unixtime * 1000;
         timeDiff = timeNOW - new Date().getTime();
      });
}

setInterval(() => {
   syncTime();
}, 1000);

syncTime();

setInterval(() => {
   timeNOW = new Date().getTime() + timeDiff;
}, 1);

function loadAllQuizes() {
   allQuizRef.limitToLast(items).on("child_added", (snapshot) => {
      const quizes = snapshot.val();

      const quizKey = snapshot.key;

      const quizesDiv = document.getElementById("quizContainer");

      let quizObject = quizes;

      const quizSTARTTIME = new Date(quizObject.time).getTime();
      const timeperQuestion = quizObject.answerTime * 1000;
      const totalQuestions = quizObject.questions.length;

      const quizENDTIME =
         quizSTARTTIME + (timeperQuestion + waitTimeBetweenQuestions) * totalQuestions;

      // Update the time remaining for the quiz automatically

      let startTime = new Date(quizObject.time).getTime();
      let currentTime = timeNOW;
      let timeRemaining = startTime - currentTime;

      let formattedTime = "";

      let days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      let hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

      if (days > 0) {
         formattedTime += days + "d ";
      }

      if (hours > 0) {
         formattedTime += hours + "h ";
      }

      if (minutes > 0) {
         formattedTime += minutes + "m ";
      }

      if (seconds > 0) {
         formattedTime += seconds + "s";
      }

      let images = [];

      let imagesToAdd = 18;

      for (let i = 0; i < imagesToAdd; i++) {
         images.push("./images/image" + (i + 1) + "S.jpg");
      }

      let randomImage = images[Math.floor(Math.random() * images.length)];

      let html = `
            <div class="quiz" onclick="loadQuiz('${quizKey}')">
            <div class="quiz-title">
            <h3>${quizObject.name}</h3>
            </div>
               <p class="quiz-desc">${quizObject.description}</p>
               <div class="quiz-info">
               <p>Reward: ${quizObject.reward}</p>
               <p id="quizTime${quizKey}">${formattedTime}</p>
               </div>
               <img src="${randomImage}" alt="Theme" width="250" height="300">
            </div>

         `;
      document.getElementById("loading").style.display = "none";

      if (timeNOW > quizENDTIME || others.includes(quizKey) === true) {
         items++;
      } else {
         others.push(quizKey);
         setInterval(() => {
            let quizTime = document.getElementById("quizTime" + quizKey);

            if (quizTime) {
               let startTime = new Date(quizObject.time).getTime();
               let currentTime = timeNOW;

               let timeRemaining = startTime - currentTime;

               let formattedTime = "";

               let days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
               let hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
               let minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
               let seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

               if (days > 0) {
                  formattedTime += days + "d ";
               }

               if (hours > 0) {
                  formattedTime += hours + "h ";
               }

               if (minutes > 0) {
                  formattedTime += minutes + "m ";
               }

               if (seconds > 0) {
                  formattedTime += seconds + "s";
               }

               if (timeRemaining < 0) {
                  formattedTime = "Started";
               }

               quizTime.innerHTML = formattedTime;
            }
         }, 500);

         quizesDiv.innerHTML += html;
      }
   });
}

let items = 12;
let others = [];
let searchIndex = [];

function doDynamic() {
   items = Math.max(0, Math.min(items + 2 * Math.floor(items / 2), 100));

   document.getElementById("loading").style.display = "flex";
   allQuizRef.limitToLast(items).once("value", (snapshot) => {
      const quizes = snapshot.val();

      const quizesDiv = document.getElementById("quizContainer");

      for (let quizKey in quizes) {
         let quizObject = quizes[quizKey];

         const quizSTARTTIME = new Date(quizObject.time).getTime();
         const timeperQuestion = quizObject.answerTime * 1000;
         const totalQuestions = quizObject.questions.length;

         const quizENDTIME =
            quizSTARTTIME + (timeperQuestion + waitTimeBetweenQuestions) * totalQuestions;

         // If the quiz has started and the quiz has ended

         if (timeNOW > quizENDTIME) {
            continue;
         }

         // Update the time remaining for the quiz automatically

         let startTime = new Date(quizObject.time).getTime();
         let currentTime = timeNOW;
         let timeRemaining = startTime - currentTime;

         let formattedTime = "";

         let days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
         let hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
         let minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
         let seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

         if (days > 0) {
            formattedTime += days + "d ";
         }

         if (hours > 0) {
            formattedTime += hours + "h ";
         }

         if (minutes > 0) {
            formattedTime += minutes + "m ";
         }

         if (seconds > 0) {
            formattedTime += seconds + "s";
         }

         let images = [];

         let imagesToAdd = 18;

         for (let i = 0; i < imagesToAdd; i++) {
            images.push("./images/image (Small)" + (i + 1) + ".jpg");
         }

         let randomImage = images[Math.floor(Math.random() * images.length)];

         let html = `
            <div class="quiz" onclick="loadQuiz('${quizKey}')">
            <div class="quiz-title">
            <h3>${quizObject.name}</h3>
            </div>
               <p class="quiz-desc">${quizObject.description}</p>
               <div class="quiz-info">
               <p>Reward: ${quizObject.reward}</p>
               <p id="quizTime${quizKey}">${formattedTime}</p>
               </div>
               <img src="${randomImage}" alt="Theme" width="250" height="300">
            </div>

         `;

         setTimeout(() => {
            document.getElementById("loading").style.display = "none";
         }, 100);

         if (timeNOW > quizENDTIME || others.includes(quizKey) === true) {
            items++;
         } else {
            others.push(quizKey);
            setInterval(() => {
               let quizTime = document.getElementById("quizTime" + quizKey);

               if (quizTime) {
                  let startTime = new Date(quizObject.time).getTime();
                  let currentTime = timeNOW;

                  let timeRemaining = startTime - currentTime;

                  let formattedTime = "";

                  let days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
                  let hours = Math.floor(
                     (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                  );
                  let minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                  let seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

                  if (days > 0) {
                     formattedTime += days + "d ";
                  }

                  if (hours > 0) {
                     formattedTime += hours + "h ";
                  }

                  if (minutes > 0) {
                     formattedTime += minutes + "m ";
                  }

                  if (seconds > 0) {
                     formattedTime += seconds + "s";
                  }

                  if (timeRemaining < 0) {
                     formattedTime = "Started";
                  }

                  quizTime.innerHTML = formattedTime;
               }
            }, 500);

            quizesDiv.innerHTML += html;
         }
      }
   });
}

loadAllQuizes();

function loadQuiz(quizKey) {
   allQuizRef2.child(quizKey).on("value", (snapshot) => {
      const quiz = snapshot.val();

      const secureTIMENOW = timeNOW;

      let quizStartTime = quiz.time;

      // Format the time into timestamp

      quizStartTime = new Date(quizStartTime).getTime();

      // Check if the quiz has started

      if (secureTIMENOW < quizStartTime) {
         // Check if the user is enrolled in the quiz
         firebase
            .database()
            .ref("usersP/" + uid + "/")
            .child("enrolled")
            .once("value", (snapshot) => {
               const enrolled = snapshot.val();

               let enrolledInQuiz = false;

               for (let enrolledKey in enrolled) {
                  if (enrolled[enrolledKey] === quizKey) {
                     enrolledInQuiz = true;
                  }
               }

               if (enrolledInQuiz) {
                  toast("The quiz has not started yet");
               } else {
                  // Enroll the user in the quiz
                  firebase
                     .database()
                     .ref("usersP/" + uid + "/")
                     .child("enrolled")
                     .push()
                     .set(quizKey);
                  toast("You have been enrolled in the quiz");
               }
            });
      } else {
         // Check if the user is enrolled in the quiz
         firebase
            .database()
            .ref("usersP/" + uid + "/")
            .child("enrolled")
            .once("value", (snapshot) => {
               const enrolled = snapshot.val();

               let enrolledInQuiz = false;

               for (let enrolledKey in enrolled) {
                  if (enrolled[enrolledKey] === quizKey) {
                     enrolledInQuiz = true;
                  }
               }

               if (enrolledInQuiz) {
                  // Load the quiz
                  loadQuizPage(quizKey);
               } else {
                  toast("You are not enrolled in this quiz");
               }
            });
      }
   });
}

function showAddQuiz() {
   document.getElementById("createQuiz").classList.remove("hidden");
   document.getElementById("createQuiz").classList.add("show");
}

function closeADD() {
   document.getElementById("createQuiz").classList.remove("show");
   document.getElementById("createQuiz").classList.add("hidden");
}

// Function to load the quiz page

let quizKey = 0;
let pointsQ = 0;
let answerT = 0;
let quizCode = 0;
let quizType = "";
let quizWaitingTime = waitTimeBetweenQuestions;

let shownQuestions = [];
let quizOver = false; // flag to indicate if the quiz is over

function loadQuizPage(qD) {
   document.getElementById("quizBB").classList.remove("hidden");

   let quizData = undefined;

   allQuizRef2.child(qD).on("value", (snapshot) => {
      quizData = snapshot.val();

      const KEY = snapshot.key;

      const quizTitle = document.getElementById("quizTitle");
      const quizDescription = document.getElementById("quizDescription");
      const quizReward = document.getElementById("quizReward1");

      quizTitle.innerHTML = quizData.name;
      quizDescription.innerHTML = quizData.description;
      quizReward.innerHTML = quizData.reward;

      quizKey = KEY;
      pointsQ = quizData.pointsPerQuestion;
      answerT = quizData.answerTime;
      quizCode = quizData.code;
      quizType = quizData.visibility;

      // If waitingTimeBetweenQuestions is not defined then set it to 5 seconds

      if (quizData.waitTimeBetweenQuestions) {
         waitTimeBetweenQuestions = quizData.waitTimeBetweenQuestions;
         quizWaitingTime = waitTimeBetweenQuestions;
      } else {
         quizWaitingTime = waitTimeBetweenQuestions;
      }

      let firstUnlockedIndex = 0; // index of the first unlocked question

      function showNextQuestion() {
         // find the current question
         let currentIndex = firstUnlockedIndex; // start from the first unlocked index
         let currentTime = timeNOW; // get the current time
         while (
            currentIndex < quizData.questions.length &&
            currentTime >
               quizData.questions[currentIndex].unlockTime +
                  (1000 * answerT + waitTimeBetweenQuestions)
         ) {
            // if the current time is past the question's unlock time plus the answer time and the wait time, skip the question
            currentIndex++;
         }

         // check if there are any questions left
         if (currentIndex < quizData.questions.length) {
            // show the current question
            const question = quizData.questions[currentIndex];

            // Check if this is the last question
            let nextQuestionUnlockTime;
            if (currentIndex === quizData.questions.length - 1) {
               nextQuestionUnlockTime =
                  quizData.questions[currentIndex].unlockTime +
                  (1000 * answerT + waitTimeBetweenQuestions);
            } else {
               nextQuestionUnlockTime = quizData.questions[currentIndex + 1].unlockTime;
            }

            showQuestion(question, pointsQ, answerT, quizKey, nextQuestionUnlockTime);

            // update the first unlocked index
            firstUnlockedIndex = currentIndex + 1;
            // schedule the next question
            setTimeout(() => {
               showNextQuestion();
            }, nextQuestionUnlockTime - currentTime);
         } else {
            // no more questions, end the quiz
            quizOver = true;
            endQuiz();
         }
      }

      // start showing questions
      showNextQuestion();
   });
}

let tm1;

// Function to show the question

function showQuestion(question, pointsPerQuestion, answerTime, quizKey, nextQuestionUnlockTime) {
   const questionTitle = document.getElementById("questionText");
   questionTitle.innerText = question.question;

   const answers = question.answers;

   for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];

      const answerD = document.getElementById(`answer${i + 1}`);
      answerD.innerText = answer;
      answerD.disabled = false;
      answerD.classList.remove("correct");
      answerD.classList.remove("wrong");
      answerD.classList.remove("disabled");
      answerD.classList.remove("selected");
   }

   // Start the timer

   let timeRemaining = Math.ceil(
      (nextQuestionUnlockTime - timeNOW - waitTimeBetweenQuestions) / 1000
   );
   tm1 = timeRemaining;

   // let timeRemaining = answerTime;

   const timer = document.getElementById("timer");
   timer.innerHTML = timeRemaining + "s";

   const timerInterval = setInterval(() => {
      timeRemaining--;
      tm1 = timeRemaining;
      timer.innerHTML = timeRemaining + "s";

      if (timeRemaining <= 0) {
         timer.innerHTML = "Verifying...";
         showLeaderboard();
         clearInterval(timerInterval);
      }
   }, 1000);

   const in2 = setInterval(() => {
      timeNow = timeNOW;

      tm1 = nextQuestionUnlockTime - timeNow - waitTimeBetweenQuestions;

      if (timeRemaining <= 0) {
         clearInterval(in2);
      }
   }, 1);
}

// Function to submit the answer

function checkAnswer(i) {
   const answer = document.getElementById("answer" + i).innerText;
   const question = document.getElementById("questionText").innerText;

   // If the button is disabled then return

   if (document.getElementById("answer" + i).classList.contains("disabled")) {
      return;
   }

   // If the timer is "Verifying..." then return

   if (document.getElementById("timer").innerText === "Verifying...") {
      return;
   }

   document.getElementById("answer" + i).classList.add("selected");

   const answerObject = {
      question: question,
      answer: answer,
      uid: uid,
      time: timeNOW,
   };

   let quizRef = undefined;
   let quizRef2 = undefined;

   // If the quiz is public
   if (quizType === "public") {
      quizRef = firebase.database().ref("quizesR/public/").child(quizKey);
      quizRef2 = firebase.database().ref("quizes/public/").child(quizKey);
      quizRef.child("responses").push().set(answerObject);
   } else {
      // If the quiz is private

      quizRef = firebase.database().ref("quizesR/private/").child(quizCode);
      quizRef2 = firebase.database().ref("quizes/private/").child(quizCode);
      quizRef.child("responses").push().set(answerObject);
   }

   // Disable the buttons

   for (let i = 0; i < 4; i++) {
      document.getElementById("answer" + (i + 1)).classList.add("disabled");
   }

   const quizR = quizRef2.once("value", (snapshot) => {
      const quiz = snapshot.val();

      const questions = quiz.questions;

      const currentQuestion = document.getElementById("questionText").innerText;

      let correctAnswer = "";

      for (let k = 0; k < questions.length; k++) {
         const question = questions[k];

         if (question.question === currentQuestion) {
            correctAnswer = question.correct;
         }
      }

      if (answer === correctAnswer) {
         // Make the selected option green

         // Add the points to the user's account and update the leaderboard

         // Calcule the points based on the time remaining

         let timeRemaining = tm1 / 1000;

         let pointsPerQuestion = pointsQ;

         if (timeRemaining > 0) {
            pointsPerQuestion = Math.round(pointsPerQuestion * timeRemaining);
            pointsPerQuestion = Math.max(200, pointsPerQuestion);
         }

         setTimeout(() => {
            document.getElementById("answer" + i).classList.add("correct");
            toast("Correct Answer! You got " + pointsPerQuestion + " points!");
         }, tm1 + 1500);

         const leaderboardRef = firebase
            .database()
            .ref("quizesR/public/" + quizKey + "/leaderboard");

         // Put the user in the leaderboard if he is not already in it

         leaderboardRef.once("value", (snapshot) => {
            const leaderboard = snapshot.val();

            let userInLeaderboard = false;

            for (let leaderboardKey in leaderboard) {
               const leaderboardObject = leaderboard[leaderboardKey];

               if (leaderboardObject.uid === uid) {
                  userInLeaderboard = true;
               }
            }

            if (!userInLeaderboard) {
               setTimeout(() => {
                  leaderboardRef.push().set({
                     points: pointsPerQuestion,
                     uid: uid,
                     username,
                     email,
                     fullname,
                  });
               }, tm1 + 1000);
            } else {
               // Update the points

               for (let leaderboardKey in leaderboard) {
                  const leaderboardObject = leaderboard[leaderboardKey];

                  if (leaderboardObject.uid === uid) {
                     setTimeout(() => {
                        firebase
                           .database()
                           .ref("quizesR/public/" + quizKey + "/leaderboard/" + leaderboardKey)
                           .update({
                              points: Number(leaderboardObject.points) + Number(pointsPerQuestion),
                           });
                     }, tm1 + 1000);
                  }
               }
            }
         });
      } else {
         // Make the correct answer green and the other option red

         setTimeout(() => {
            for (let i = 0; i < 4; i++) {
               if (document.getElementById("answer" + (i + 1)).innerText === correctAnswer) {
                  document.getElementById("answer" + (i + 1)).classList.add("correct");
               } else {
                  document.getElementById("answer" + (i + 1)).classList.add("wrong");
               }
            }
         }, tm1 + 1000);
      }
   });
}

// Function to show the leaderboard

function showLeaderboard() {
   const leaderboardD = document.getElementById("leaderboardList");

   leaderboardD.innerHTML = "";

   const leaderboardRef = firebase.database().ref("quizesR/public/" + quizKey + "/leaderboard");

   leaderboardRef.orderByChild("points").on("value", (snapshot) => {
      const leaderboard = snapshot.val();

      let key = snapshot.key;

      leaderboardD.innerHTML = "";

      // Convert leaderboard object to an array
      const leaderboardArray = Object.entries(leaderboard);

      // Sort the leaderboard array based on points in descending order
      leaderboardArray.sort((a, b) => b[1].points - a[1].points);

      for (let i = 0; i < leaderboardArray.length; i++) {
         const leaderboardObject = leaderboardArray[i][1];

         const leaderboardDiv = document.createElement("div");
         leaderboardDiv.className = "leaderboardItem";

         const leaderboardName = document.createElement("p");
         leaderboardName.innerHTML = leaderboardObject.fullname;
         leaderboardName.title = leaderboardObject.username;
         leaderboardName.className = "leaderboardItem__name";

         const leaderboardPoints = document.createElement("p");
         leaderboardPoints.innerHTML = leaderboardObject.points;
         leaderboardPoints.className = "leaderboardItem__points";

         leaderboardDiv.appendChild(leaderboardName);
         leaderboardDiv.appendChild(leaderboardPoints);

         leaderboardD.appendChild(leaderboardDiv);
      }
   });
}

function toast(message, duration = 4500, delay = 0) {
   // Check for existing toast class elements

   const existingToast = document.querySelector(".toast");

   if (existingToast) {
      existingToast.remove();
   }

   const toastContainer = document.createElement("div");
   toastContainer.style.position = "fixed";
   toastContainer.style.top = "1rem";
   toastContainer.style.right = "1rem";
   toastContainer.style.display = "flex";
   toastContainer.style.alignItems = "center";
   toastContainer.style.justifyContent = "center";
   toastContainer.style.width = "16rem";
   toastContainer.style.padding = "1rem";
   toastContainer.style.backgroundColor = "#1F2937";
   toastContainer.style.color = "#FFF";
   toastContainer.style.borderRadius = "0.25rem";
   toastContainer.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.25)";
   toastContainer.style.overflow = "auto";
   toastContainer.style.maxHeight = "500px";
   toastContainer.style.minWidth = "200px";
   toastContainer.style.width = "fit-content";
   toastContainer.style.zIndex = "9999";
   toastContainer.setAttribute("class", "toast");

   const toastText = document.createElement("span");
   toastText.style.whiteSpace = "nowrap";
   toastText.style.overflow = "hidden";
   toastText.style.textOverflow = "ellipsis";
   toastText.textContent = message;
   toastContainer.appendChild(toastText);

   document.body.appendChild(toastContainer);

   setTimeout(() => {
      toastContainer.style.opacity = "0";
      setTimeout(() => {
         toastContainer.remove();
      }, 300);
   }, duration + delay);

   toast.dismiss = function () {
      toastContainer.style.opacity = "0";
      setTimeout(() => {
         toastContainer.remove();
      }, 300);
   };
}

function endQuiz() {
   let winner =
      document.getElementById("leaderboardList").children[0].children[0].innerText ?? "No one";

   victory(winner);

   document.getElementById("timer").innerText = "The quiz has ended!";

   setTimeout(() => {
      // toast("The quiz has ended!");
      toast("This page will refresh in 60 seconds!");
   }, 10000);

   showLeaderboard();

   setTimeout(() => {
      document.getElementById("quizBB").classList.add("hidden");
   }, 60000);
}

// // Security check, if the user changes tab then don't allow him answer the question
// let warns = 0;
// window.addEventListener("blur", () => {
//    // Check if the user is enrolled in the quiz
//    firebase
//       .database()
//       .ref("usersP/" + uid + "/")
//       .child("enrolled")
//       .once("value", (snapshot) => {
//          const enrolled = snapshot.val();

//          let enrolledInQuiz = false;

//          for (let enrolledKey in enrolled) {
//             if (enrolled[enrolledKey] === quizKey) {
//                enrolledInQuiz = true;
//             }
//          }

//          if (enrolledInQuiz && warns < 2) {
//             toast("You are not allowed to change tabs");
//             window.location.reload();
//          }
//       });

//    // Check if the quiz is over

//    if (
//       !quizOver &&
//       warns < 2 &&
//       document.getElementById("timer").innerText !== "Verifying..." &&
//       tm1 > 0 &&
//       document.getElementById("timer").innerText !== "The quiz has ended!" &&
//       document.getElementById("quizBB").classList.contains("hidden") === false
//    ) {
//       warns++;

//       switch (warns) {
//          case 1:
//             toast("You are not allowed to change tabs, if you do you will be disqualified!");
//             break;
//          case 2:
//             toast("This is your last warning, if you change tabs you will be disqualified!");
//             break;
//          case 3:
//             // Remove 700 points from the user's account
//             firebase
//                .database()
//                .ref(`quizesR/${quizType}/` + quizKey + "/leaderboard")
//                .once("value", (snapshot) => {
//                   const leaderboard = snapshot.val();

//                   for (let leaderboardKey in leaderboard) {
//                      const leaderboardObject = leaderboard[leaderboardKey];

//                      if (leaderboardObject.uid === uid) {
//                         firebase
//                            .database()
//                            .ref(`quizesR/${quizType}/` + quizKey + "/leaderboard/" + leaderboardKey)
//                            .update({
//                               points: Math.min(0, Number(leaderboardObject.points) - 700),
//                            });
//                      }
//                   }
//                });
//             break;
//          case 4:
//             toast("You have been disqualified!");
//             // Unenroll the user from the quiz
//             firebase
//                .database()
//                .ref("usersP/" + uid + "/")
//                .child("enrolled")
//                .once("value", (snapshot) => {
//                   const enrolled = snapshot.val();

//                   for (let enrolledKey in enrolled) {
//                      if (enrolled[enrolledKey] === quizKey) {
//                         firebase
//                            .database()
//                            .ref("usersP/" + uid + "/")
//                            .child("enrolled")
//                            .child(enrolledKey)
//                            .remove();
//                      }
//                   }
//                })
//                .then(() => {
//                   // Remove the user from the leaderboard
//                   firebase
//                      .database()
//                      .ref(`quizesR/${quizType}/` + quizKey + "/leaderboard")
//                      .once("value", (snapshot) => {
//                         const leaderboard = snapshot.val();

//                         for (let leaderboardKey in leaderboard) {
//                            const leaderboardObject = leaderboard[leaderboardKey];

//                            if (leaderboardObject.uid === uid) {
//                               firebase
//                                  .database()
//                                  .ref(
//                                     `quizesR/${quizType}/` +
//                                        quizKey +
//                                        "/leaderboard/" +
//                                        leaderboardKey
//                                  )
//                                  .remove();
//                            }
//                         }
//                      })
//                      .then(() => {
//                         window.location.reload();
//                      });
//                });

//             break;
//          default:
//             break;
//       }
//    }
// });

// Function to join a quiz with a code

let tm = false;

function joinQuizCode() {
   const code = prompt("Enter the quiz code");

   if (!code) {
      return;
   }

   // Check if the quiz is public or private

   firebase
      .database()
      .ref("quizes/private/" + code)
      .once("value", (snapshot) => {
         const quiz = snapshot.val();

         // Check if the quiz exists

         if (!quiz) {
            toast("This quiz does not exist");
            return;
         }

         const quizTime = quiz.time;

         const questions = quiz.questions;
         const answerTime = quiz.answerTime;

         const quizEndTime =
            quizTime + (answerTime * 1000 + waitTimeBetweenQuestions) * questions.length;

         // Calcule the time remaining

         const timeRemaining = quizTime - timeNOW;

         if (timeRemaining < 0 && timeNOW > quizEndTime) {
            toast("The quiz has ended");
            return;
         } else {
            // toast the user in how much time the quiz will start

            let formattedTime = "Starts in: ";

            let days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
            let hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

            if (days > 0) {
               formattedTime += days + "d ";
            }

            if (hours > 0) {
               formattedTime += hours + "h ";
            }

            if (minutes > 0) {
               formattedTime += minutes + "m ";
            }

            if (seconds > 0) {
               formattedTime += seconds + "s";
            }

            if (timeRemaining < 0) {
               formattedTime =
                  "Started (" +
                  Math.abs(days) +
                  "d " +
                  Math.abs(hours) +
                  "h " +
                  Math.abs(minutes) +
                  "m " +
                  Math.abs(seconds) +
                  "s ago)";
            }

            toast(formattedTime);
         }

         if (quiz) {
            // If the quiz is private

            // Check if the user is enrolled in the quiz
            firebase
               .database()
               .ref("usersP/" + uid + "/")
               .child("enrolled")
               .once("value", (snapshot) => {
                  const enrolled = snapshot.val();

                  let enrolledInQuiz = false;

                  for (let enrolledKey in enrolled) {
                     if (enrolled[enrolledKey] === code) {
                        enrolledInQuiz = true;
                     }
                  }

                  if (enrolledInQuiz) {
                     if (!tm) {
                        setTimeout(() => {
                           loadQuizPr(code);
                        }, timeRemaining);
                        tm = true;
                     } else {
                        toast(
                           "You have been enrolled in the quiz, you will be redirected automatically in" +
                              timeRemaining +
                              "seconds"
                        );
                     }
                  } else {
                     // Enroll the user in the quiz
                     firebase
                        .database()
                        .ref("usersP/" + uid + "/")
                        .child("enrolled")
                        .push()
                        .set(code);
                     toast(
                        "You have been enrolled in the quiz, you will be redirected automatically in" +
                           timeRemaining +
                           "seconds"
                     );

                     if (tm) {
                        setTimeout(() => {
                           loadQuizPr(code);
                        }, timeRemaining);
                        tm = true;
                     } else {
                        toast(
                           "You have been enrolled in the quiz, you will be redirected automatically in" +
                              timeRemaining +
                              "seconds"
                        );
                     }
                  }
               });
         } else {
            // If the quiz is public

            // Check if the user is enrolled in the quiz
            toast("The quiz is public, you can join it without a code!");
         }
      });
}

function loadQuizPr(code) {
   firebase
      .database()
      .ref("quizes/private/" + code)
      .once("value", (snapshot) => {
         const quiz = snapshot.val();

         const secureTIMENOW = timeNOW;

         let quizStartTime = quiz.time;

         // Format the time into timestamp

         quizStartTime = new Date(quizStartTime).getTime();

         // Check if the quiz has started

         if (secureTIMENOW < quizStartTime) {
            // Check if the user is enrolled in the quiz
            firebase
               .database()
               .ref("usersP/" + uid + "/")
               .child("enrolled")
               .once("value", (snapshot) => {
                  const enrolled = snapshot.val();

                  let enrolledInQuiz = false;

                  for (let enrolledKey in enrolled) {
                     if (enrolled[enrolledKey] === code) {
                        enrolledInQuiz = true;
                     }
                  }

                  if (enrolledInQuiz) {
                     toast("The quiz has not started yet");
                  } else {
                     // Enroll the user in the quiz
                     firebase
                        .database()
                        .ref("usersP/" + uid + "/")
                        .child("enrolled")
                        .push()
                        .set(code);
                     toast("You have been enrolled in the quiz");
                  }
               });
         } else {
            // Check if the user is enrolled in the quiz
            firebase
               .database()
               .ref("usersP/" + uid + "/")
               .child("enrolled")
               .once("value", (snapshot) => {
                  const enrolled = snapshot.val();

                  let enrolledInQuiz = false;

                  for (let enrolledKey in enrolled) {
                     if (enrolled[enrolledKey] === code) {
                        enrolledInQuiz = true;
                     }
                  }

                  if (enrolledInQuiz) {
                     // Load the quiz
                     loadQuizPagePr(code);
                  } else {
                     toast("You are not enrolled in this quiz");
                  }
               });
         }
      });
}

function loadQuizPagePr(code) {
   document.getElementById("quizBB").classList.remove("hidden");

   let quizData = undefined;

   firebase
      .database()
      .ref("quizes/private/" + code)
      .once("value", (snapshot) => {
         quizData = snapshot.val();

         const KEY = snapshot.key;

         const quizTitle = document.getElementById("quizTitle");
         const quizDescription = document.getElementById("quizDescription");
         const quizReward = document.getElementById("quizReward1");

         quizTitle.innerHTML = quizData.name;
         quizDescription.innerHTML = quizData.description;
         quizReward.innerHTML = quizData.reward;

         quizKey = KEY;
         pointsQ = quizData.pointsPerQuestion;
         answerT = quizData.answerTime;
         quizCode = quizData.code;
         quizType = quizData.visibility;

         let firstUnlockedIndex = 0; // index of the first unlocked question

         function showNextQuestion() {
            // find the current question
            let currentIndex = firstUnlockedIndex; // start from the first unlocked index
            let currentTime = timeNOW; // get the current time
            while (
               currentIndex < quizData.questions.length &&
               currentTime >
                  quizData.questions[currentIndex].unlockTime +
                     (1000 * answerT + waitTimeBetweenQuestions)
            ) {
               // if the current time is past the question's unlock time plus the answer time and the wait time, skip the question
               currentIndex++;
            }

            // check if there are any questions left
            if (currentIndex < quizData.questions.length) {
               // show the current question
               const question = quizData.questions[currentIndex];

               // Check if this is the last question
               let nextQuestionUnlockTime;
               if (currentIndex === quizData.questions.length - 1) {
                  nextQuestionUnlockTime =
                     quizData.questions[currentIndex].unlockTime +
                     (1000 * answerT + waitTimeBetweenQuestions);
               } else {
                  nextQuestionUnlockTime = quizData.questions[currentIndex + 1].unlockTime;
               }

               showQuestion(question, pointsQ, answerT, quizKey, nextQuestionUnlockTime);

               // update the first unlocked index
               firstUnlockedIndex = currentIndex + 1;
               // schedule the next question
               setTimeout(() => {
                  showNextQuestion();
               }, nextQuestionUnlockTime - currentTime);
            } else {
               // no more questions, end the quiz
               quizOver = true;
               endQuiz();
            }
         }

         // start showing questions
         showNextQuestion();
      });
}

function logOut() {
   let conf = confirm("Are you sure you want to log out?");

   if (!conf) {
      return;
   }

   toast("Logging out...");
   firebase
      .auth()
      .signOut()
      .then(() => {
         window.location.href = "./account/index.html";
      })
      .catch((error) => {
         toast(error.message);
      });
}

// Function to toggle the menu
function toggleMenu() {
   const navLinks = document.getElementById("navLinks");
   const navAuth = document.getElementById("navAuth");
   const navBurger = document.querySelector(".nav__burger");

   navLinks.classList.toggle("show");
   navAuth.classList.toggle("show");
   navBurger.classList.toggle("active");
}

// Close the menu when a link is clicked
const navLinks = document.querySelectorAll(".nav__links a");
navLinks.forEach((link) => {
   link.addEventListener("click", () => {
      const navLinks = document.getElementById("navLinks");
      const navAuth = document.getElementById("navAuth");
      const navBurger = document.querySelector(".nav__burger");

      navLinks.classList.remove("show");
      navAuth.classList.remove("show");
      navBurger.classList.remove("active");
   });
});
