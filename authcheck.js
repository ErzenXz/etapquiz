firebase.auth().useDeviceLanguage();

firebase.auth().onAuthStateChanged((user) => {
   if (user) {
      console.log("User is logged in!");
   } else {
      console.log("User is not logged in!");
      location.href = "../account/index.html";
   }
});

document.querySelector(".nav__logo").addEventListener("click", () => {
   location.href = "/";
});
