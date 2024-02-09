const user = firebase.auth().currentUser;
const database = firebase.database();
const firestore = firebase.firestore();
let waitTimeBetweenQuestions = 5000; // 5 seconds

let uid = user ? user.uid : null;

let username;
let email;
let fullname;

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

const myQuizRef = firebase.database().ref("quizesP/" + uid + "/");
const allQuizRef = firebase.database().ref("quizes/public/").orderByChild("time");
const allQuizRef2 = firebase.database().ref("quizes/public/");
const myREF = firebase.database().ref("usersP/" + uid + "/");

let fileInput = document.getElementById("importFile");

fileInput.addEventListener("change", function () {
   if (fileInput.files.length > 0 && fileInput.files[0].name.endsWith(".json")) {
      document.getElementById("qtitle").style.display = "none";
      document.getElementById("qdescription").style.display = "none";
      document.getElementById("quizReward").style.display = "none";
      document.getElementById("quizAnswerTime").style.display = "none";
      document.getElementById("quizPoints").style.display = "none";
      document.getElementById("waitTimeBetweenQuestions").style.display = "none";
      document.getElementById("questions").style.display = "none";
      document.getElementById("addQuestion").style.display = "none";
   }
});

function createQuiz() {
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

            if (time === "") {
               time = new Date().getTime() + 1000 * 60 * 60;
            }

            let unlockTime = 0;
            let correctAnsRevealT = 0;

            let timeInTimestamp = new Date(time).getTime();
            quizTime = new Date(time).getTime();

            let waitTimeBetweenQuestions = json.waitTimeBetweenQuestions;

            if (document.getElementById("waitTimeBetweenQuestions").value !== "") {
               waitTimeBetweenQuestions =
                  document.getElementById("waitTimeBetweenQuestions").value * 1000;
            }

            if (
               waitTimeBetweenQuestions === 0 ||
               waitTimeBetweenQuestions === "" ||
               waitTimeBetweenQuestions === null ||
               waitTimeBetweenQuestions === undefined ||
               waitTimeBetweenQuestions < 3 ||
               waitTimeBetweenQuestions > 90
            ) {
               waitTimeBetweenQuestions = 5000;
            }

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

               let questionObject = undefined;
               if (question.question[0] === " ") {
                  questionObject = {
                     question: `${question.question}`,
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
               } else {
                  questionObject = {
                     question: `${question.question}`,
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
               }

               // Make sure the question is valid

               if (
                  questionObject.question === "" ||
                  questionObject.answers[0] === "" ||
                  questionObject.answers[1] === "" ||
                  questionObject.answers[2] === "" ||
                  questionObject.answers[3] === "" ||
                  questionObject.correct === ""
               ) {
                  toast("Invalid Question at index " + i + " in the JSON File");
                  console.log("Invalid Question at index " + i + " in the JSON File");
                  return false;
               }

               // Make sure only one correct answer is given and it is a valid answer

               let duplicate = false;

               for (let i = 0; i < questionObject.answers.length; i++) {
                  if (questionObject.answers[i] === questionObject.correct) {
                     if (duplicate) {
                        toast(
                           "Multiple correct answers in the same question at index " +
                              i +
                              " in the JSON File"
                        );
                        console.log(
                           "Multiple correct answers in the same question at index " +
                              i +
                              " in the JSON File"
                        );
                        return false;
                     }
                     duplicate = true;
                  }
               }

               if (!duplicate) {
                  toast("No correct answer in the question at index " + i + " in the JSON File");
                  return false;
               }

               questionsArray.push(questionObject);
            }

            let time_timezone = new Date(quizTime).getTimezoneOffset() * 60000;
            let utcTime = quizTime - time_timezone;

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
               utcTime: utcTime,
               timezone: time_timezone,
            };

            // Download the JSON file

            const a = document.createElement("a");
            const file = new Blob([JSON.stringify(quiz)], { type: "application/json" });
            a.href = URL.createObjectURL(file);
            a.download = quizName + ".json";
            a.click();

            let randomQuizCode = Math.floor(Math.random() * 1000000000);
            quiz.code = randomQuizCode;
            // Add the quiz to the database
            if (visibility === "public") {
               database.ref("quizes/public/").push().set(quiz);
               database
                  .ref("quizesP/" + uid + "/")
                  .push()
                  .set(quiz);
               openModal(
                  "Quiz Created Successfully",
                  "You can join the quiz by using the BROWSE QUIZES on the browse page"
               );
            } else {
               database.ref(`quizes/private/${randomQuizCode}`).set(quiz);
               database
                  .ref("quizesP/" + uid + "/")
                  .push()
                  .set(quiz);
               openModal(
                  "Quiz Created Successfully",
                  "You can join the quiz by using this code: " + randomQuizCode
               );
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
      const waitTimeBetweenQuestions =
         document.getElementById("waitTimeBetweenQuestions").value * 1000;

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

      if (quizName === "" || quizDescription === "" || quizTime === "") {
         toast("Please fill out all the fields");
         return false;
      }

      if (quizAnswerTime === "" || quizPoints === "") {
         toast("Please fill out all the fields");
         return false;
      }

      if (waitTimeBetweenQuestions === 0 || waitTimeBetweenQuestions === "") {
         waitTimeBetweenQuestions = 5000;
      }

      if (
         quizPoints === 0 ||
         quizPoints === "" ||
         quizPoints === null ||
         quizPoints === undefined ||
         quizPoints < 10 ||
         quizPoints > 10000
      ) {
         quizPoints = 100;
      }

      if (
         quizAnswerTime === 0 ||
         quizAnswerTime === "" ||
         quizAnswerTime === null ||
         quizAnswerTime === undefined ||
         quizAnswerTime < 5 ||
         quizAnswerTime > 600
      ) {
         quizAnswerTime = 15;
      }

      if (
         quizTime === 0 ||
         quizTime === "" ||
         quizTime === null ||
         quizTime === undefined ||
         quizTime < Date.now() + 1000 * 60 * 60 ||
         quizTime > Date.now() + 1000 * 60 * 60 * 24 * 31
      ) {
         quizTime = Date.now() + 1000 * 60 * 60;
      }

      let questionsArray = [];

      let time = new Date(quizTime);

      const questions = document.getElementById("questions").children;

      if (questions.length === 0) {
         toast("Please add at least one question");
         return false;
      }

      let unlockTime = 0;
      let correctAnsRevealT = 0;

      let timeInTimestamp = time.getTime();

      for (let i = 0; i < questions.length; i++) {
         let question = questions[i].children;

         let questionUnlock = timeInTimestamp + waitTimeBetweenQuestions + unlockTime;
         let correctAnsRevealTime = timeInTimestamp + correctAnsRevealT;
         correctAnsRevealT += quizAnswerTime * 1000;

         if (i === 0) {
            questionUnlock = timeInTimestamp;
            unlockTime += quizAnswerTime * 1000;
         } else {
            unlockTime += quizAnswerTime * 1000 + waitTimeBetweenQuestions;
         }

         let questionObject = undefined;

         if (question[0].value[0] === " ") {
            questionObject = {
               question: `${i + 1}. ${question[0].value}`,
               answers: [
                  question[1].value,
                  question[2].value,
                  question[3].value,
                  question[4].value,
               ],
               correct: question[5].value,
               unlockTime: questionUnlock,
               correctAnsRevealTime: correctAnsRevealTime,
            };
         } else {
            questionObject = {
               question: `${question[0].value}`,
               answers: [
                  question[1].value,
                  question[2].value,
                  question[3].value,
                  question[4].value,
               ],
               correct: question[5].value,
               unlockTime: questionUnlock,
               correctAnsRevealTime: correctAnsRevealTime,
            };
         }

         // Make sure the question is valid

         if (
            questionObject.question === "" ||
            questionObject.answers[0] === "" ||
            questionObject.answers[1] === "" ||
            questionObject.answers[2] === "" ||
            questionObject.answers[3] === "" ||
            questionObject.correct === ""
         ) {
            toast("Invalid Question at index " + i);
            return false;
         }

         // Make sure only one correct answer is given and it is a valid answer

         let duplicate = false;

         for (let i = 0; i < questionObject.answers.length; i++) {
            if (questionObject.answers[i] === questionObject.correct) {
               if (duplicate) {
                  toast("Multiple correct answers in the same question at index " + i);
                  return false;
               }
               duplicate = true;
            }
         }

         if (!duplicate) {
            toast("No correct answer in the question at index " + i);
            return false;
         }

         questionsArray.push(questionObject);
      }

      let time_timezone = new Date(quizTime).getTimezoneOffset() * 60000;
      let utcTime = timeInTimestamp - time_timezone;

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
         utcTime: utcTime,
         timezone: time_timezone,
      };

      // Download the JSON file

      const a = document.createElement("a");
      const file = new Blob([JSON.stringify(quiz)], { type: "application/json" });
      a.href = URL.createObjectURL(file);
      a.download = quizName + ".json";
      a.click();

      let randomQuizCode = Math.floor(Math.random() * 1000000000);

      quiz.code = randomQuizCode;

      // Add the quiz to the database

      if (visibility === "public") {
         database.ref("quizes/public/").push().set(quiz);
         database
            .ref("quizesP/" + uid + "/")
            .push()
            .set(quiz);
         openModal(
            "Quiz Created Successfully",
            "You can join the quiz by using the BROWSE QUIZES on the browse page"
         );
      } else {
         database.ref(`quizes/private/${randomQuizCode}`).push().set(quiz);
         database
            .ref("quizesP/" + uid + "/")
            .push()
            .set(quiz);
         openModal(
            "Quiz Created Successfully",
            "You can join the quiz by using this code: " + randomQuizCode
         );
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
      let confirmDelete = confirm("Are you sure you want to delete this question?");
      if (!confirmDelete) {
         return;
      }
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

if (localStorage.getItem("firstTime") === null) {
   openModal(
      "Welcome to the Quiz Creator",
      "You can create a quiz by uploading a JSON file or by filling out the form below."
   );

   localStorage.setItem("firstTime", "true");
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
