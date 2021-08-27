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
