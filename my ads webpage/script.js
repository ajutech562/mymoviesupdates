// Optional: Add future interactivity like click analytics or modal previews
console.log("OTT website loaded");
const toggleBtn = document.getElementById('menu-toggle');
const menuPanel = document.getElementById('menu-panel');

toggleBtn.addEventListener('click', () => {
  menuPanel.classList.toggle('active');
});


document.getElementById('closeMenu').addEventListener('click', () => {
  menuPanel.classList.remove('active');
  toggleBtn.classList.remove('hide');
});
