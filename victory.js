function victory(n) {
   let css = `
  
   *,
    *:before,
    *:after{
        box-sizing: border-box;
        padding: 0;
        margin: 0;
    }
    
    html {
      overflow: hidden;
      max-width: 100vw !important;
      max-height: 100vh !important;
    }
    
    body {
      margin: 0 !important;
      padding: 0 !important;
      height: 100vh !important;
      width: 100vw !important;
      position: relative !important;
      background-color: #000000 !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      overflow: hidden !important;
    }
    
    .victory {
      font-family: 'Press Start 2P', cursive;
      font-size: 4rem;
      font-weight: 400;
      color: #018bfb;
      position: fixed;
      top: 125px;
        left: 50%;
        transform: translateX(-50%);
      z-index: 99999999999999999;
    }
    
    .victory:after {
      content: "Victory";
    }
    
    .imposter {
      margin-top: 100px;
      display: flex;
      position: fixed;
        top: 150px;
        left: 50%;
        transform: translateX(-50%);
    }
    
    .spacesuit {
      position: relative;
    }
    
    .chest-and-head {
      width: 140px;
      height: 200px;
      background: #852631;
      position: relative;
      border: 10px solid #000000;
      border-radius: 60px 80px 0 0;
      border-bottom: none;
    }
    
    .chest-and-head:after {
      content: "";
      width: 92%;
      height: 85%;
      background: #eb432f;
      position: absolute;
      left: 4%;
      /* top: -1px; {*/
      z-index: 2;
      border-radius: 58% 70% 28% 42% / 28% 56% 88% 89%;;
    }
    
    .legs {
      height: 50px;
      width: 60px;
      position: relative;
      z-index: 2;
      background: #852631;
      border: 10px solid #000000;
      border-top: none;
      border-radius: 0 0 22px 22px;
    }
    
    .legs::after {
      content: "";
      height: 45px;
      width: 60px;
      position: absolute;
      left: 70px;
      background: #852631;
      border: 10px solid #000000;
      border-top: none;
      border-radius: 0 0 22px 22px;
    }
    
    .legs::before {
      content: "";
      height: 10px;
      width: 55px;
      background: #852631;
      background-color: #000000;
      position: absolute;
      top: -10px;
      left: 40px;
      border-radius: 0 0 10px 0;
    }
    
    .arm {
      height: 120px;
      width: 35px;
      background: #eb432f;
      position: absolute;
      top: 75px;
      left: -35px;
      border: 10px solid #000000;
      border-right: none;
      border-radius: 20px 0 0 22px;
    }
    
    .arm:after {
      content: "";
      width: 25px; 
      height: 80px;
      background: #852631;
      position: absolute;
      top: 20px;
      border-radius: 12px 0 0 10px;
    }
    
    .helmet-glass {
      width: 110px;
      height: 75px;
      background: #225381;
      position: absolute;
      z-index: 3;
      top: 40px;
      left: 50px;
      border: 10px solid #000000;
      border-radius: 25px 50px 30px 30px;
    }
    
    .helmet-glass:after {
      content: "";
      width: 85%;
      height: 65%;
      background: #71d4ec;
      left: 13px;
      position: absolute;
      z-index: 4;
      border-radius: 0 28px 3px 30px;
    }
    
    .helmet-glass:before {
      content: "";
      width: 45%;
      height: 22%;
      background: #ffffff;
      position: absolute;
      left: 40px;
      top: 5px;
      z-index: 5;
      border-radius: 10px;
      transform: rotate(6deg);
    }
    
    .background {
      width: 70vw;
      height: 1vh;
      margin-top: 30px;
      background: #59a4a3;
      position: fixed;
        top: 350px;
        left: 50%;
        transform: translateX(-50%);
      z-index: -1;
      border-radius: 50%;
      box-sizing: border-box;
      box-shadow: 6px 6px 80px 110px #59a4a3;
    }
    
    .name {
      font-family: 'Press Start 2P', cursive;
      font-size: 3.5rem;
      font-weight: 600;
      color: white;
      position: fixed;
      margin-top: 200px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    
    .name:after {
      content: "${n}"
    }
    
    body:before{
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 200%;
      height: 100%;
      background: linear-gradient(to right, transparent, #000, #000);
      z-index: 9999999999;
      animation: animate 2s linear forwards;
    }
    @keyframes animate{
      0%{
        right: 0;
      }
      100%{
        right: -200%;
      }
    }
    
    @media only screen and (max-width: 900px) {
      .imposter, .victory, .name {
        zoom: 60%;
      }
      .background {
        zoom: .7;
        margin-top: 10px;
      }
    }`;

   let style = document.createElement("style");
   style.innerHTML = css;

   let sound = document.createElement("audio");
   sound.src = "../sounds/victory.mp3";
   sound.setAttribute("autoplay", "true");

   // Make sure the sound is loaded first otherwise nothing will play
   sound.addEventListener(
      "canplaythrough",
      function () {
         sound.play();
      },
      false
   );

   document.getElementById("victoryAA").appendChild(sound);

   document.getElementById("victoryAA").appendChild(style);
   document.getElementById("quizContainer").classList.add("hidden");
   document.getElementById("quizBB").classList.add("hidden");
   document.getElementById("footer").classList.add("hidden");
   document.getElementById("nav2").classList.add("hidden");
   document.getElementById("addQuizBtn").classList.add("hidden");
   document.getElementById("loadMore").classList.add("hidden");
   document.getElementById("ping").classList.add("hidden");
   document.getElementById("h3").classList.add("hidden");
   document.getElementById("top5").classList.add("hidden");
   //    document.body.appendChild(style);

   setTimeout(() => {
      document.getElementById("victoryAA").innerHTML = "";
      document.getElementById("quizContainer").classList.remove("hidden");
      document.getElementById("quizBB").classList.remove("hidden");
      document.getElementById("footer").classList.remove("hidden");
      document.getElementById("nav2").classList.remove("hidden");
      document.getElementById("addQuizBtn").classList.remove("hidden");
      document.getElementById("loadMore").classList.remove("hidden");
      document.getElementById("ping").classList.remove("hidden");
      document.getElementById("h3").classList.remove("hidden");
      document.getElementById("top5").classList.remove("hidden");
   }, 10000);
}
