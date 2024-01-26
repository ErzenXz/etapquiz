firebase.auth().useDeviceLanguage();

firebase.auth().onAuthStateChanged((user) => {
   if (user) {
      console.log("User is logged in!");

      // document.getElementById("auth").innerHTML = user.email;
      // ...
   } else {
      console.log("User is not logged in!");
      location.href = "/account/index.html";
   }
});
