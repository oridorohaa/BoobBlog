//Elements
const registerButton = document.getElementById("register");
const resigstrationElmts = document.querySelectorAll(".register-form");
const photoButton = document.getElementById("options-photo");
const photoBar = document.querySelector(".photo_entry__bar");
const signInButton = document.querySelector(".sign-in__button");
const signInForm = document.querySelector(".sign-in__form");
const entryButton = document.getElementById("options-entry");
const entryBar = document.querySelector(".entry__bar");
const entrySubmitButton = document.querySelector(".entry__submit");
const entryInput = document.querySelector(".entry__input");
// const entryContainer = document.querySelector("entry__container");
const postsButton = document.getElementById("button__posts");
const eachPostEntry = document.querySelector(".entry__each");

const boobItButton = document.getElementById("topnap_entry");

//Moving boob
const boobContainer = document.querySelector(".boob_container");
const boob = document.querySelector(".boob_1");
//const boobTwo = document.querySelector(".boob_2");

//Heart button
const heartOutline = document.querySelector(".heart_img");
const heartFilled = document.querySelector(".heart_filled_img");

var cursor_x = -1;
var cursor_y = -1;
document.onmousemove = function (event) {
  cursor_x = event.pageX;
  cursor_y = event.pageY;
};

const boobsArr = [];
const numBoobs = 250;
if (boob) {
  for (let i = 0; i < numBoobs; i++) {
    const boobClone = boob.cloneNode(true);
    boobClone.style.left = Math.random() * (window.innerWidth - 100) + "px";
    boobClone.style.top = Math.random() * (window.innerHeight - 100) + "px";
    // document.querySelector(`boob_${i}`).appendChild(boobClone);
    boobContainer.appendChild(boobClone);

    boobsArr.push(boobClone);
  }
}
if (boob) {
  boob.style.display = "none";
}
console.log(boobsArr);
console.log(boobsArr[0]);

registerButton?.addEventListener("click", () => {
  registerButton.classList.add("hidden");
  resigstrationElmts.forEach((r) => r.classList.remove("hidden"));
  signInButton.classList.add("hidden");
});

console.log("Working");

photoButton?.addEventListener("click", (e) => {
  photoBar.classList.toggle("hidden");
  console.log("Photo button working");
  // photoBar.classList.remove("hidden");
});
document.addEventListener("keydown", (e) => {});

signInButton?.addEventListener("click", () => {
  signInForm.classList.remove("hidden");
  registerButton.classList.add("hidden");
  signInButton.classList.add("hidden");
});

entryButton?.addEventListener("click", () => {
  entryBar.classList.toggle("hidden");
});

entrySubmitButton?.addEventListener("click", () => {
  const entry = entryInput.value;
  console.log(entry);
});

postsButton?.addEventListener("click", () => {
  console.log("Posts are clicked");
});

eachPostEntry?.addEventListener("click", () => {
  "A post was clicked";
});

/* Open when someone clicks on the span element */
const openNav = () => {
  document.getElementById("myNav").classList.remove("hidden");
  console.log("Inside openNav");
  document.getElementById("myNav").style.width = "100%";
};

/* Close when someone clicks on the "x" symbol inside the overlay */
const closeNav = () => {
  document.getElementById("myNav").classList.add("hidden");
  document.getElementById("myNav").style.width = "0%";
};

//Moving the boob
const props = [];
for (let i = 0; i <= numBoobs; i++) {
  props.push({
    // right: Math.random() > 0.5,
    // down: Math.random() > 0.5,
    xvelocity: (Math.random() * 1 + 1) * (Math.random() > 0.5 ? 1 : -1),
    yvelocity: -1,
  });
}

console.log(props);
const moveTheBoob = () => {
  let width = window.innerWidth - 45;
  let height = window.innerHeight - 45;
  for (let i = 0; i < boobsArr.length; i++) {
    let P = props[i];

    //gravity
    //P.yvelocity += 0.1;
    //friction
    P.xvelocity *= 0.99;
    P.yvelocity *= 0.99;
    let boo = boobsArr[i];

    let currentLeft = parseFloat(boo.style.left);
    let currentTop = parseFloat(boo.style.top);

    let deltaX = currentLeft - cursor_x;
    let deltaY = currentTop - cursor_y;

    let distance = Math.max(
      100,
      Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2))
    );
    let force = 1000 / Math.pow(distance, 1.5);
    let oneForceUnit = force / (Math.abs(deltaX) + Math.abs(deltaY));
    let forceX = deltaX * oneForceUnit;
    let forceY = deltaY * oneForceUnit;

    P.xvelocity += forceX;
    P.yvelocity += forceY;

    if (currentLeft > width || currentLeft < 0) {
      P.xvelocity *= -1;
    }

    if (currentTop > height || currentTop < 0) {
      P.yvelocity *= -1;
      if (currentTop > height) {
        P.yvelocity *= 0.8;
      }
    }
    boo.style.left = currentLeft + P.xvelocity;
    boo.style.top = currentTop + P.yvelocity;
  }
};
if (boob) setInterval(moveTheBoob, 20);

heartOutline.addEventListener("click", (e) => {
  e.preventDefault();
});
