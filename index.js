const user = firebase.auth().currentUser;
const database = firebase.database();
const firestore = firebase.firestore();
let waitTimeBetweenQuestions = 5000; // 5 seconds
let autoJoinQuizKey = null;

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

let timeNOW;

let timeDiff = 0;

// Function to sync the time with the server

let api = "https://worldtimeapi.org/api/timezone/Europe/Belgrade";

async function syncUserTimeToRealTime() {
   try {
      const clientRequestTime = new Date();

      const requestStartTime = performance.now();
      const response = await fetch(
         `${api}?clientRequestTime=${encodeURIComponent(clientRequestTime.toISOString())}`
      );
      const requestEndTime = performance.now();

      if (!response.ok) {
         throw new Error("Failed to fetch time from the API");
      }

      const data = await response.json();

      const requestTime = requestEndTime - requestStartTime;

      const serverClientDifferenceTimeWithRequestTime =
         new Date(data.utc_datetime) - new Date(data.clientRequestTime);
      const serverTime = new Date(data.utc_datetime);

      await new Promise((resolve) => setTimeout(resolve, 200));

      const responseTime = requestEndTime - requestStartTime;

      const synchronizedTimeOnClient = new Date(serverTime.getTime() + responseTime / 2);

      const timeDifference = clientRequestTime - serverTime;

      let ping = removeTags(responseTime.toFixed(2));
      let pingSTR;

      if (ping > 500) {
         pingSTR = `<i class="fa-solid fa-wifi redWIFI"></i> <span>${ping}ms</span>`;
      } else if (ping > 200) {
         pingSTR = `<i class="fa-solid fa-wifi yellowWIFI"></i> <span>${ping}ms</span>`;
      } else {
         pingSTR = `<i class="fa-solid fa-wifi greenWIFI"></i> <span>${ping}ms</span>`;
      }

      document.getElementById("ping").innerHTML = pingSTR;

      timeDiff = serverTime - clientRequestTime;

      return synchronizedTimeOnClient.getTime();
   } catch (error) {
      console.error("Error syncing time:", error.message);
      return null;
   }
}

setInterval(() => {
   syncUserTimeToRealTime().then((timestamp) => {
      if (timestamp !== null) {
         timeNOW = timestamp;
      } else {
         console.log("Failed to sync user time to real time.");
      }
   });
}, 1000);

setInterval(() => {
   timeNOW = new Date().getTime() + timeDiff;
}, 1);

function loadAllQuizes() {
   allQuizRef.limitToLast(items).on("child_added", (snapshot) => {
      const quizes = snapshot.val();

      if (!quizes) {
         document.getElementById("loading").style.display = "none";

         return;
      }

      const quizKey = snapshot.key;
      const quizesDiv = document.getElementById("quizContainer");

      let quizObject = quizes;

      const quizSTARTTIME = new Date(quizObject.time).getTime();
      const timeperQuestion = removeTags(quizObject.answerTime) * 1000;
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
            <h3>${removeTags(quizObject.name)}</h3>
            </div>
               <p class="quiz-desc">${removeTags(quizObject.description)}</p>
               <div class="quiz-info">
               <p>Reward: ${removeTags(quizObject.reward)}</p>
               <p id="quizTime${quizKey}">${removeTags(formattedTime)}</p>
               </div>
               <img src="${removeTags(randomImage)}" alt="Theme" width="250" height="300">
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

               quizTime.innerHTML = removeTags(formattedTime);
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

   let addedItems = 0;

   document.getElementById("loading").style.display = "flex";
   allQuizRef.limitToLast(items).once("value", (snapshot) => {
      const quizes = snapshot.val();

      const quizesDiv = document.getElementById("quizContainer");

      for (let quizKey in quizes) {
         let quizObject = quizes[quizKey];

         const quizSTARTTIME = new Date(quizObject.time).getTime();
         const timeperQuestion = removeTags(quizObject.answerTime) * 1000;
         const totalQuestions = removeTags(quizObject.questions.length);

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
            images.push("./images/image" + (i + 1) + "S.jpg");
         }

         let randomImage = images[Math.floor(Math.random() * images.length)];

         let html = `
            <div class="quiz" onclick="loadQuiz('${quizKey}')">
            <div class="quiz-title">
            <h3>${removeTags(quizObject.name)}</h3>
            </div>
               <p class="quiz-desc">${removeTags(quizObject.description)}</p>
               <div class="quiz-info">
               <p>Reward: ${removeTags(quizObject.reward)}</p>
               <p id="quizTime${quizKey}">${removeTags(formattedTime)}</p>
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

                  quizTime.innerHTML = removeTags(formattedTime);
               }
            }, 500);

            quizesDiv.innerHTML += html;
            addedItems++;
         }
      }

      // If there are no more quizes to load then hide the load more button

      if (addedItems === 0) {
         toast("No more quizes to load");
         document.getElementById("loading").style.display = "none";
         document.getElementById("loadMore").classList.add("hidden");
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
                  openModal(
                     "Already enrolled in the quiz",
                     "You are already enrolled in this quiz, make sure to click the quiz again when the time says 'Started' to join the quiz.\n\n When you join the quiz make sure you don't change tabs or you will be disqualified. The quiz will start in " +
                        Math.floor((quizStartTime - secureTIMENOW) / 1000) +
                        " seconds."
                  );

                  autoJoinQuizKey = quizKey;
                  setTimeout(() => {
                     loadQuizPage(autoJoinQuizKey);
                  }, Math.floor(quizStartTime - secureTIMENOW));
               } else {
                  // Enroll the user in the quiz
                  firebase
                     .database()
                     .ref("usersP/" + uid + "/")
                     .child("enrolled")
                     .push()
                     .set(quizKey);
                  openModal(
                     "Successfully enrolled in the quiz",
                     "You are now enrolled in this quiz, make sure to click the quiz again when the time says 'Started' to join the quiz.\n\n When you join the quiz make sure you don't change tabs or you will be disqualified. The quiz will start in " +
                        Math.floor((quizStartTime - secureTIMENOW) / 1000) +
                        " seconds."
                  );
                  autoJoinQuizKey = quizKey;
                  setTimeout(() => {
                     loadQuizPage(autoJoinQuizKey);
                  }, Math.floor(quizStartTime - secureTIMENOW));
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
                  openModal(
                     "Not enrolled in the quiz",
                     "We are sorry but you are not enrolled in this quiz, next time make sure to enroll in the quiz before it starts."
                  );
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
let qNumber = 0;

function loadQuizPage(qD) {
   document.getElementById("quizBB").classList.remove("hidden");

   let quizData = undefined;

   allQuizRef2.child(qD).on("value", (snapshot) => {
      quizData = snapshot.val();

      const KEY = snapshot.key;

      const quizTitle = document.getElementById("quizTitle");
      const quizDescription = document.getElementById("quizDescription");
      const quizReward = document.getElementById("quizReward1");

      quizTitle.innerText = quizData.name;
      quizDescription.innerText = quizData.description;
      quizReward.innerText = quizData.reward;

      quizKey = KEY;
      pointsQ = quizData.pointsPerQuestion;
      answerT = quizData.answerTime;
      quizCode = quizData.code;
      quizType = quizData.visibility;

      showLeaderboard();

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
   timer.innerText = timeRemaining + "s";

   const timerInterval = setInterval(() => {
      timeRemaining = Math.ceil(
         (nextQuestionUnlockTime - timeNOW - waitTimeBetweenQuestions) / 1000
      );
      tm1 = timeRemaining;
      timer.innerText = timeRemaining + "s";

      if (timeRemaining <= 0) {
         timer.innerText = "Verifying...";
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

   // If the quiz is over then return

   if (quizOver) {
      return;
   }

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

         // const leaderboardRef = firebase
         //    .database()
         //    .ref("quizesR/public/" + quizKey + "/leaderboard/" + uid);

         // // Put the user in the leaderboard if he is not already in it

         // leaderboardRef.once("value", (snapshot) => {
         //    const leaderboard = snapshot.val();

         //    if (!leaderboard) {
         //       setTimeout(() => {
         //          leaderboardRef.set({
         //             fullname: fullname,
         //             username: username,
         //             points: pointsPerQuestion,
         //             uid: uid,
         //             updatedAt: timeNOW,
         //          });
         //       }, tm1 + 1500);
         //    } else {
         //       setTimeout(() => {
         //          leaderboardRef.update({
         //             points: Number(leaderboard.points) + pointsPerQuestion,
         //             updatedAt: timeNOW,
         //          });
         //       }, tm1 + 1500);
         //    }
         // });

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

   leaderboardD.innerText = "";

   const leaderboardRef = firebase.database().ref("quizesR/public/" + quizKey + "/leaderboard");

   leaderboardRef.orderByChild("points").on("value", (snapshot) => {
      const leaderboard = snapshot.val();

      if (!leaderboard) {
         return;
      }

      let key = snapshot.key;

      leaderboardD.innerText = "";

      // Convert leaderboard object to an array
      const leaderboardArray = Object.entries(leaderboard);

      // Sort the leaderboard array based on points in descending order
      leaderboardArray.sort((a, b) => b[1].points - a[1].points);

      for (let i = 0; i < leaderboardArray.length; i++) {
         const leaderboardObject = leaderboardArray[i][1];

         const leaderboardDiv = document.createElement("div");
         leaderboardDiv.className = "leaderboardItem";

         const leaderboardName = document.createElement("p");
         leaderboardName.innerText = leaderboardObject.fullname;
         leaderboardName.title = leaderboardObject.username;
         leaderboardName.className = "leaderboardItem__name";

         const leaderboardPoints = document.createElement("p");
         leaderboardPoints.innerText = leaderboardObject.points;
         leaderboardPoints.className = "leaderboardItem__points";

         leaderboardDiv.appendChild(leaderboardName);
         leaderboardDiv.appendChild(leaderboardPoints);

         leaderboardD.appendChild(leaderboardDiv);
      }
   });
}

function toast(message, duration = 4500, delay = 0) {
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
   let winner = undefined;

   try {
      winner =
         document.getElementById("leaderboardList").children[0].children[0].innerText ?? "No one";
   } catch (error) {
      winner = "No one";
   }

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

// // // Security check, if the user changes tab then don't allow him answer the question
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
//       });

//    // Check if the quiz is over

//    if (
//       !quizOver &&
//       document.getElementById("timer").innerText !== "Verifying..." &&
//       tm1 > 0 &&
//       document.getElementById("timer").innerText !== "The quiz has ended!" &&
//       document.getElementById("quizBB").classList.contains("hidden") === false
//    ) {
//       warns++;
//       console.log(warns);
//       switch (warns) {
//          case 1:
//             alert("You are not allowed to change tabs, if you do you will be disqualified!");
//             break;
//          case 2:
//             alert("This is your last warning, if you change tabs you will be disqualified!");
//             break;
//          case 3:
//             // Remove 700 points from the user's account
//             alert("You have lost 700 points for changing tabs!");
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
//                               points: Math.max(0, Number(leaderboardObject.points) - 700),
//                            });
//                      }
//                   }
//                });
//             break;
//          case 4:
//             alert("You have been disqualified! ");
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

function removeTags(str) {
   if (str === null || str === "") return false;
   else str = str.toString();
   return str.replace(/(<([^>]+)>)/gi, "");
}

// Function to join a quiz with a code

let tm = false;

function joinQuizCode() {
   const code = prompt("Enter the quiz code");

   if (!code) {
      return;
   }

   // MAKE sure the code is numbers only and has no spaces

   if (code.includes(" ") || isNaN(code)) {
      toast("Invalid code");
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
         let formattedTime = "Starts in: ";

         if (timeRemaining < 0 && timeNOW > quizEndTime) {
            toast("The quiz has ended");
            return;
         } else {
            // toast the user in how much time the quiz will start

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
                        toast("The quiz will start in " + formattedTime + "seconds");
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
                     toast("The quiz has not started yet, you will need to join when it starts");
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

         quizTitle.innerText = quizData.name;
         quizDescription.innerText = quizData.description;
         quizReward.innerText = quizData.reward;

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

function openModal(title = "", text = "Default text", image = false) {
   let modalContent = "";
   if (image !== false && image !== "") {
      modalContent = `
       <h2 class="text-lg font-bold">${title}</h2>
       <p>${text}</p>
       <img src="${image}" alt="Modal image" class="mt-4 rounded-lg">
     `;
   } else {
      modalContent = `
       <h2 class="text-lg font-bold">${title}</h2>
       <p>${text}</p>
     `;
   }

   const modalOverlay = document.createElement("div");
   modalOverlay.classList.add("modal-overlay");
   modalOverlay.onclick = closeModal;

   const modalContainer = document.createElement("div");
   modalContainer.classList.add("modal-container");

   const modalHeader = document.createElement("div");
   modalHeader.classList.add("modal-header");

   const modalContentWrapper = document.createElement("div");
   modalContentWrapper.classList.add("modal-content");
   modalContentWrapper.innerHTML = modalContent;

   const modalFooter = document.createElement("div");
   modalFooter.classList.add("modal-footer");
   const closeButton = document.createElement("button");
   closeButton.innerText = "Close";
   closeButton.classList.add("modal-close");
   closeButton.onclick = closeModal;
   modalFooter.appendChild(closeButton);

   modalContainer.appendChild(modalHeader);
   modalContainer.appendChild(modalContentWrapper);
   modalContainer.appendChild(modalFooter);

   const modal = document.createElement("div");
   modal.id = "modal";
   modal.appendChild(modalOverlay);
   modal.appendChild(modalContainer);

   document.body.appendChild(modal);
}

function closeModal() {
   const modal = document.getElementById("modal");
   modal.parentNode.removeChild(modal);
}
