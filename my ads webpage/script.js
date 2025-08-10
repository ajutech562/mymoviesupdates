const toggleBtn = document.getElementById("menu-toggle");
const menuPanel = document.getElementById("menu-panel");

toggleBtn.addEventListener("click", () => {
  menuPanel.classList.toggle("active");
});
// Rating stars functionality
const stars = document.querySelectorAll('.stars .star');
const ratingResult = document.querySelector('.rating-result');
let selectedRating = 0;

stars.forEach((star) => {
  star.addEventListener('click', () => {
    selectedRating = parseInt(star.getAttribute('data-value'));
    updateStars(selectedRating);
    ratingResult.textContent = `You rated this page ${selectedRating} star${selectedRating > 1 ? 's' : ''}.`;
  });

  star.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      star.click();
    }
  });
});

function updateStars(rating) {
  stars.forEach((star) => {
    const starValue = parseInt(star.getAttribute('data-value'));
    if (starValue <= rating) {
      star.classList.add('selected');
      star.setAttribute('aria-checked', 'true');
    } else {
      star.classList.remove('selected');
      star.setAttribute('aria-checked', 'false');
    }
  });
}

// Comment submission
const commentForm = document.getElementById('comment-form');
const commentsList = document.getElementById('comments');

commentForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const username = commentForm.username.value.trim();
  const commentText = commentForm.comment.value.trim();

  if (!username || !commentText) {
    alert('Please fill in both name and comment.');
    return;
  }

  // Create new comment element
  const li = document.createElement('li');
  const strong = document.createElement('strong');
  strong.textContent = username;
  li.appendChild(strong);

  const p = document.createElement('p');
  p.textContent = commentText;
  li.appendChild(p);

  commentsList.appendChild(li);

  // Clear form
  commentForm.reset();

  // Scroll to new comment
  li.scrollIntoView({ behavior: 'smooth' });
});
document.getElementById("dark-mode-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

const firebaseConfig = {
  apiKey: "AIzaSyDDS5Wj6o843817kUpNTK4gLKKUFcMn5-Q",
  authDomain: "mymoviescomments.firebaseapp.com",
  projectId: "mymoviescomments",
  storageBucket: "mymoviescomments.firebasestorage.app",
  messagingSenderId: "460470112788",
  appId: "1:460470112788:web:a8ceece7ad5b13c79f0d01"
};
