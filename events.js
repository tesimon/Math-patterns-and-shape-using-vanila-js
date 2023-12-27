//button event handler
const toggleButton = document.querySelector(".toggle-button");
const toggleButton2 = document.querySelector(".toggle-button2");
const container = document.querySelector(".container");

//button event handler

toggleButton.addEventListener("click", () => {
  container.style.display = container.style.display = "block";
  toggleButton.style.display = "none";
  toggleButton2.style.display = "block";
});
toggleButton2.addEventListener("click", () => {
  toggleButton2.style.display = "none";
  toggleButton.style.display = "block";
  container.style.display = "none";
});
