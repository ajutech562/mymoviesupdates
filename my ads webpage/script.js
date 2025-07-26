const toggleBtn = document.getElementById("menu-toggle");
const menuPanel = document.getElementById("menu-panel");

toggleBtn.addEventListener("click", () => {
  menuPanel.classList.toggle("active");
});
