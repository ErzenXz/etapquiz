// Get the user's profile data from the database

const db = firebase.firestore();
let UID = null;
firebase.auth().useDeviceLanguage();

firebase.auth().onAuthStateChanged((user) => {
   if (user) {
      async function getProfileData() {
         return db.collection("users").doc(user.uid).get();
      }

      // Put the user's profile data in the form

      function putProfileDataInForm() {
         getProfileData().then(function (doc) {
            const data = doc.data();

            document.getElementById("username").innerText = data.username;
            document.getElementById("email").innerText = data.email;
            document.getElementById("fullname").innerText = data.fullName;
            const lastLoginTimestamp = data.lastSignInTime;
            const lastLoginDate = undefined;
            try {
               if (lastLoginTimestamp instanceof Date) {
                  lastLoginDate = lastLoginTimestamp;
               } else {
                  lastLoginDate = new Date(lastLoginTimestamp);
               }
               const dd = Intl.DateTimeFormat().format(lastLoginDate);

               document.getElementById("lastLogin").innerText = dd;
            } catch (error) {
               document.getElementById("lastLogin").innerText = "Unknown";
            }

            // Format the date to be more readable and in the user's local time

            const uid = data.uid;

            const userImage = data.photoURL;

            if (userImage) {
               document.getElementById("profileImage").src = userImage;
            } else {
               document.getElementById("profileImage").src = "../images/image1S.jpg";
            }

            document.getElementById("uid").innerText = uid;
            document.getElementById("loading").style.display = "none";
         });

         // Get the user's profile data and put it in the form
      }
      putProfileDataInForm();
   } else {
      console.log("User is not logged in!");
      location.href = "/account/index.html";
   }
});

async function changeUsername() {
   const user = firebase.auth().currentUser;
   const username = document.getElementById("username").innerText;
   let newUsername = prompt("Enter your new username", username);
   if (newUsername) {
      // Check if the username is already taken

      // Make sure the username is not taken
      let usernameTaken = false;
      await firebase
         .firestore()
         .collection("users")
         .where("username", "==", newUsername)
         .get()
         .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
               usernameTaken = true;
            });
         });

      if (usernameTaken) {
         toast("Username already taken!");
         return;
      }

      // Make sure the username is formatted correctly
      if (newUsername.length < 3) {
         toast("Username must be at least 3 characters long!");
         return;
      }

      if (newUsername.length > 20) {
         toast("Username must be less than 20 characters long!");
         return;
      }

      if (newUsername.includes(" ")) {
         toast("Username cannot contain spaces!");
         return;
      }

      if (newUsername.includes(".")) {
         toast("Username cannot contain periods!");
         return;
      }

      if (
         newUsername.includes("#") ||
         newUsername.includes("$") ||
         newUsername.includes("[") ||
         newUsername.includes("]")
      ) {
         toast("Username cannot contain the characters #, $, [, or ]!");
         return;
      }

      if (newUsername.includes("@")) {
         toast("Username cannot contain the @ symbol!");
         return;
      }

      // Remove all special characters from the username

      newUsername = newUsername.replace(/[^a-zA-Z0-9]/g, "");

      db.collection("users")
         .doc(user.uid)
         .update({
            username: newUsername,
         })
         .then(function () {
            toast("Username changed successfully!");
            putProfileDataInForm();
         });
   } else {
      toast("Username not changed");
   }
}

function changeFullName() {
   const user = firebase.auth().currentUser;
   const fullName = document.getElementById("fullname").innerText;
   const newFullName = prompt("Enter your new full name", fullName);
   if (newFullName) {
      db.collection("users")
         .doc(user.uid)
         .update({
            fullName: newFullName,
         })
         .then(function () {
            toast("Full name changed successfully!");
            putProfileDataInForm();
         });
   } else {
      toast("Full name not changed");
   }
}

function changePassword() {
   const user = firebase.auth().currentUser;
   const newPassword = prompt("Enter your new password");
   if (newPassword) {
      user
         .updatePassword(newPassword)
         .then(function () {
            toast("Password changed successfully!");
         })
         .catch(function (error) {
            toast(error.message);
         });
   } else {
      toast("Password not changed");
   }
}

function changeImage() {
   const user = firebase.auth().currentUser;
   const newImage = prompt("Enter the URL of your new profile image");
   if (newImage) {
      db.collection("users")
         .doc(user.uid)
         .update({
            photoURL: newImage,
         })
         .then(function () {
            toast("Profile image changed successfully!");
            putProfileDataInForm();
         });
   } else {
      toast("Image not changed");
   }
}

function deleteAccount() {
   const user = firebase.auth().currentUser;
   if (confirm("Are you sure you want to delete your account? :(")) {
      if (
         confirm("Are you sure you want to delete your account? This action cannot be undone. :(")
      ) {
         user
            .delete()
            .then(function () {
               toast("Account deleted successfully! :(", 10000);
               window.location.href = "index.html";
            })
            .catch(function (error) {
               alert(error.message);
            });
      } else {
         toast("Account not deleted :)");
      }
   } else {
      toast("Account not deleted :)");
   }
}

async function getProfileData() {
   return db.collection("users").doc(UID).get();
}

// Put the user's profile data in the form

function putProfileDataInForm() {
   getProfileData().then(function (doc) {
      const data = doc.data();

      document.getElementById("username").innerText = data.username;
      document.getElementById("email").innerText = data.email;
      document.getElementById("fullname").innerText = data.fullName;
      const lastLoginTimestamp = data.lastSignInTime;
      const lastLoginDate = undefined;
      try {
         if (lastLoginTimestamp instanceof Date) {
            lastLoginDate = lastLoginTimestamp;
         } else {
            lastLoginDate = new Date(lastLoginTimestamp);
         }
         const dd = Intl.DateTimeFormat().format(lastLoginDate);

         document.getElementById("lastLogin").innerText = dd;
      } catch (error) {
         document.getElementById("lastLogin").innerText = "Unknown";
      }

      // Format the date to be more readable and in the user's local time

      const uid = data.uid;

      const userImage = data.photoURL;

      if (userImage) {
         document.getElementById("profileImage").src = userImage;
      } else {
         document.getElementById("profileImage").src = "../images/image1S.jpg";
      }

      document.getElementById("uid").innerText = uid;
   });

   // Get the user's profile data and put it in the form
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
