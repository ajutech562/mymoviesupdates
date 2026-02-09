// ========================================
// JU MOVIES - CLASSIC CINEMA EXPERIENCE
// Malayalam & Tamil Movies with Download
// ========================================

// TMDB API Configuration
const TMDB_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your TMDB API key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// For demo purposes, we'll use sample data if API key is not set
const USE_DEMO_DATA = TMDB_API_KEY === 'YOUR_API_KEY_HERE';

// ========================================
// STATE MANAGEMENT
// ========================================

let malayalamMovies = [];
let tamilMovies = [];
let featuredMovies = [];
let currentMalayalamFilter = 'all';
let currentTamilFilter = 'all';
let updateInterval = null;
let carouselPosition = 0;

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Setup event listeners
    setupNavigationListeners();
    setupFilterListeners();
    setupCarouselControls();
    setupVideoModal();

    // Load initial movie data
    await loadMalayalamMovies();
    await loadTamilMovies();
    await loadFeaturedMovies();

    // Start auto-update (every 5 minutes)
    startAutoUpdate();

    // Add scroll animations
    setupScrollAnimations();
}

// ========================================
// MOVIE DATA LOADING
// ========================================

async function loadMalayalamMovies() {
    const movieGrid = document.getElementById('malayalamMovieGrid');
    const updateIndicator = document.getElementById('malayalamUpdateIndicator');

    try {
        updateIndicator.innerHTML = '<i class="fas fa-sync-alt"></i><span>Updating...</span>';

        let movies;
        if (USE_DEMO_DATA) {
            movies = getDemoMalayalamMovies();
        } else {
            // Fetch Malayalam movies from TMDB
            const response = await fetch(
                `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=ml&region=IN&with_original_language=ml&sort_by=release_date.desc&page=1`
            );
            const data = await response.json();
            movies = data.results;
        }

        malayalamMovies = movies;
        renderMovies(movies, 'malayalamMovieGrid', 'malayalam');

        const now = new Date();
        updateIndicator.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Updated ${now.toLocaleTimeString()}</span>
        `;

    } catch (error) {
        console.error('Error loading Malayalam movies:', error);
        updateIndicator.innerHTML = '<i class="fas fa-exclamation-circle"></i><span>Update failed</span>';

        if (!USE_DEMO_DATA) {
            malayalamMovies = getDemoMalayalamMovies();
            renderMovies(malayalamMovies, 'malayalamMovieGrid', 'malayalam');
        }
    }
}

async function loadTamilMovies() {
    const movieGrid = document.getElementById('tamilMovieGrid');
    const updateIndicator = document.getElementById('tamilUpdateIndicator');

    try {
        updateIndicator.innerHTML = '<i class="fas fa-sync-alt"></i><span>Updating...</span>';

        let movies;
        if (USE_DEMO_DATA) {
            movies = getDemoTamilMovies();
        } else {
            // Fetch Tamil movies from TMDB
            const response = await fetch(
                `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=ta&region=IN&with_original_language=ta&sort_by=release_date.desc&page=1`
            );
            const data = await response.json();
            movies = data.results;
        }

        tamilMovies = movies;
        renderMovies(movies, 'tamilMovieGrid', 'tamil');

        const now = new Date();
        updateIndicator.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Updated ${now.toLocaleTimeString()}</span>
        `;

    } catch (error) {
        console.error('Error loading Tamil movies:', error);
        updateIndicator.innerHTML = '<i class="fas fa-exclamation-circle"></i><span>Update failed</span>';

        if (!USE_DEMO_DATA) {
            tamilMovies = getDemoTamilMovies();
            renderMovies(tamilMovies, 'tamilMovieGrid', 'tamil');
        }
    }
}

async function loadFeaturedMovies() {
    const featuredTrack = document.getElementById('featuredTrack');

    try {
        let movies;
        if (USE_DEMO_DATA) {
            movies = [...getDemoMalayalamMovies().slice(0, 3), ...getDemoTamilMovies().slice(0, 2)];
        } else {
            const response = await fetch(
                `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
            );
            const data = await response.json();
            movies = data.results.slice(0, 5);
        }

        featuredMovies = movies;
        renderFeaturedMovies(movies);

    } catch (error) {
        console.error('Error loading featured movies:', error);
        featuredMovies = [...getDemoMalayalamMovies().slice(0, 3), ...getDemoTamilMovies().slice(0, 2)];
        renderFeaturedMovies(featuredMovies);
    }
}

// ========================================
// RENDERING FUNCTIONS
// ========================================

function renderMovies(movies, gridId, language) {
    const movieGrid = document.getElementById(gridId);
    movieGrid.innerHTML = '';

    movies.forEach((movie, index) => {
        const movieCard = createMovieCard(movie, index, language);
        movieGrid.appendChild(movieCard);
    });
}

function createMovieCard(movie, index, language) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.style.animationDelay = `${index * 0.05}s`;

    const posterPath = USE_DEMO_DATA
        ? movie.poster
        : movie.poster_path
            ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}`
            : 'https://via.placeholder.com/500x750/1a1a1a/d4af37?text=No+Poster';

    const rating = USE_DEMO_DATA ? movie.rating : movie.vote_average;
    const year = USE_DEMO_DATA ? movie.year : movie.release_date?.split('-')[0] || 'N/A';
    const overview = USE_DEMO_DATA ? movie.overview : movie.overview || 'No overview available.';

    card.innerHTML = `
        <img src="${posterPath}" alt="${movie.title}" class="movie-poster" data-poster-url="${posterPath}">
        ${rating >= 8 ? '<div class="quality-badge">TOP RATED</div>' : ''}
        <div class="movie-info">
            <h3 class="movie-title">${movie.title}</h3>
            <div class="movie-meta">
                <div class="movie-rating">
                    <i class="fas fa-star"></i>
                    <span>${rating.toFixed(1)}</span>
                </div>
                <span class="movie-year">${year}</span>
            </div>
            <p class="movie-overview">${overview}</p>
            <div class="movie-actions">
                <button class="action-btn" onclick="playTrailer(${movie.id || index}, '${language}')">
                    <i class="fas fa-play"></i>
                    <span>Trailer</span>
                </button>
                <button class="action-btn" onclick="showDetails(${movie.id || index}, '${language}')">
                    <i class="fas fa-info-circle"></i>
                    <span>Details</span>
                </button>
            </div>
            <button class="download-btn" onclick="downloadPoster('${posterPath}', '${movie.title.replace(/'/g, "\\'")}')">
                <i class="fas fa-download"></i>
                <span>Download Poster</span>
            </button>
        </div>
    `;

    return card;
}

function renderFeaturedMovies(movies) {
    const featuredTrack = document.getElementById('featuredTrack');
    featuredTrack.innerHTML = '';

    movies.forEach((movie) => {
        const card = createFeaturedCard(movie);
        featuredTrack.appendChild(card);
    });
}

function createFeaturedCard(movie) {
    const card = document.createElement('div');
    card.className = 'featured-card';

    const backdropPath = USE_DEMO_DATA
        ? movie.poster
        : movie.backdrop_path
            ? `${TMDB_IMAGE_BASE}/w780${movie.backdrop_path}`
            : 'https://via.placeholder.com/780x439/1a1a1a/d4af37?text=Featured';

    const overview = USE_DEMO_DATA ? movie.overview : movie.overview || 'Featured movie';

    card.innerHTML = `
        <img src="${backdropPath}" alt="${movie.title}">
        <div class="featured-info">
            <h3>${movie.title}</h3>
            <p>${overview.substring(0, 100)}...</p>
        </div>
    `;

    return card;
}

// ========================================
// DOWNLOAD FUNCTIONALITY
// ========================================

function downloadPoster(posterUrl, movieTitle) {
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = posterUrl;
    link.download = `${movieTitle.replace(/[^a-z0-9]/gi, '_')}_poster.jpg`;
    link.target = '_blank';

    // For cross-origin images, we need to fetch and convert to blob
    fetch(posterUrl)
        .then(response => response.blob())
        .then(blob => {
            const blobUrl = window.URL.createObjectURL(blob);
            link.href = blobUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the blob URL
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);

            // Show success message
            showNotification(`Downloading poster for "${movieTitle}"`, 'success');
        })
        .catch(error => {
            console.error('Download error:', error);
            // Fallback: open in new tab
            window.open(posterUrl, '_blank');
            showNotification(`Opening poster for "${movieTitle}"`, 'info');
        });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    // Add to body
    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Make download function globally available
window.downloadPoster = downloadPoster;

// ========================================
// FILTER FUNCTIONALITY
// ========================================

function setupFilterListeners() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const language = btn.dataset.language;
            const filter = btn.dataset.filter;

            // Update active state for this language group
            const languageButtons = document.querySelectorAll(`.filter-btn[data-language="${language}"]`);
            languageButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Apply filter
            if (language === 'malayalam') {
                currentMalayalamFilter = filter;
                filterMovies(malayalamMovies, filter, 'malayalamMovieGrid', 'malayalam');
            } else if (language === 'tamil') {
                currentTamilFilter = filter;
                filterMovies(tamilMovies, filter, 'tamilMovieGrid', 'tamil');
            }
        });
    });
}

function filterMovies(movies, filter, gridId, language) {
    let filteredMovies = movies;

    if (filter !== 'all') {
        filteredMovies = movies.filter(movie => {
            const genres = USE_DEMO_DATA ? movie.genres : [];
            return genres.includes(filter);
        });
    }

    renderMovies(filteredMovies, gridId, language);
}

// ========================================
// CAROUSEL CONTROLS
// ========================================

function setupCarouselControls() {
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    const track = document.getElementById('featuredTrack');

    if (prevBtn && nextBtn && track) {
        prevBtn.addEventListener('click', () => {
            carouselPosition = Math.max(0, carouselPosition - 1);
            updateCarousel();
        });

        nextBtn.addEventListener('click', () => {
            const maxPosition = featuredMovies.length - 3;
            carouselPosition = Math.min(maxPosition, carouselPosition + 1);
            updateCarousel();
        });
    }
}

function updateCarousel() {
    const track = document.getElementById('featuredTrack');
    const offset = carouselPosition * -370;
    track.style.transform = `translateX(${offset}px)`;
}

// ========================================
// VIDEO MODAL
// ========================================

function setupVideoModal() {
    const modal = document.getElementById('videoModal');
    const closeBtn = document.getElementById('modalClose');
    const overlay = modal.querySelector('.modal-overlay');

    closeBtn.addEventListener('click', closeVideoModal);
    overlay.addEventListener('click', closeVideoModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeVideoModal();
        }
    });
}

function playTrailer(movieId, language) {
    const modal = document.getElementById('videoModal');
    const videoContainer = document.getElementById('videoContainer');

    // For demo purposes, use a sample trailer
    const trailerUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1';

    videoContainer.innerHTML = `
        <iframe 
            src="${trailerUrl}" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const videoContainer = document.getElementById('videoContainer');

    modal.classList.remove('active');
    videoContainer.innerHTML = '';
    document.body.style.overflow = '';
}

function showDetails(movieId, language) {
    console.log('Show details for movie:', movieId, 'Language:', language);
    alert(`Movie details page - Coming soon!\nLanguage: ${language.toUpperCase()}`);
}

window.playTrailer = playTrailer;
window.showDetails = showDetails;

// ========================================
// AUTO-UPDATE FUNCTIONALITY
// ========================================

function startAutoUpdate() {
    updateInterval = setInterval(() => {
        loadMalayalamMovies();
        loadTamilMovies();
    }, 300000); // 5 minutes
}

function stopAutoUpdate() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
}

// ========================================
// NAVIGATION ENHANCEMENTS
// ========================================

function setupNavigationListeners() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    const langSelect = document.getElementById('languages');
    langSelect.addEventListener('change', (e) => {
        console.log('Language changed to:', e.target.value);
    });

    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            alert('Search functionality - Coming soon!');
        });
    }
}

// ========================================
// SCROLL ANIMATIONS
// ========================================

function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.featured-section, .language-movies-section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

// ========================================
// DEMO DATA
// ========================================

function getDemoMalayalamMovies() {
    return [
        {
            id: 1,
            title: "Manjummel Boys",
            poster: "https://via.placeholder.com/500x750/6b1515/d4af37?text=Manjummel+Boys",
            rating: 8.4,
            year: "2024",
            overview: "A group of friends get into a dangerous situation during a trip to Kodaikanal.",
            genres: ["thriller", "drama"]
        },
        {
            id: 2,
            title: "Premalu",
            poster: "https://via.placeholder.com/500x750/4a0e0e/f4d03f?text=Premalu",
            rating: 8.2,
            year: "2024",
            overview: "A romantic comedy about love and relationships in modern Kerala.",
            genres: ["romance", "comedy"]
        },
        {
            id: 3,
            title: "Aavesham",
            poster: "https://via.placeholder.com/500x750/8b2020/d4af37?text=Aavesham",
            rating: 8.0,
            year: "2024",
            overview: "An action-packed thriller with unexpected twists and turns.",
            genres: ["action", "thriller"]
        },
        {
            id: 4,
            title: "Bramayugam",
            poster: "https://via.placeholder.com/500x750/2a2a2a/d4af37?text=Bramayugam",
            rating: 7.8,
            year: "2024",
            overview: "A period horror film set in ancient Kerala with mystical elements.",
            genres: ["horror", "drama"]
        },
        {
            id: 5,
            title: "Varshangalkku Shesham",
            poster: "https://via.placeholder.com/500x750/1a1a1a/f4d03f?text=Varshangalkku+Shesham",
            rating: 7.6,
            year: "2024",
            overview: "A heartwarming story about friendship spanning decades.",
            genres: ["drama"]
        },
        {
            id: 6,
            title: "Aadujeevitham",
            poster: "https://via.placeholder.com/500x750/6b1515/d4af37?text=Aadujeevitham",
            rating: 8.5,
            year: "2024",
            overview: "The survival story of an Indian worker in the Middle East.",
            genres: ["drama", "survival"]
        },
        {
            id: 7,
            title: "Malaikottai Vaaliban",
            poster: "https://via.placeholder.com/500x750/4a0e0e/f4d03f?text=Malaikottai+Vaaliban",
            rating: 7.3,
            year: "2024",
            overview: "An epic adventure of a legendary warrior.",
            genres: ["action", "adventure"]
        },
        {
            id: 8,
            title: "Neru",
            poster: "https://via.placeholder.com/500x750/8b2020/d4af37?text=Neru",
            rating: 7.7,
            year: "2024",
            overview: "A courtroom drama fighting for justice.",
            genres: ["drama", "thriller"]
        },
        {
            id: 9,
            title: "Thankam",
            poster: "https://via.placeholder.com/500x750/2a2a2a/d4af37?text=Thankam",
            rating: 8.1,
            year: "2024",
            overview: "A gripping crime thriller based on true events.",
            genres: ["crime", "thriller"]
        },
        {
            id: 10,
            title: "Kaathal - The Core",
            poster: "https://via.placeholder.com/500x750/1a1a1a/f4d03f?text=Kaathal",
            rating: 8.3,
            year: "2024",
            overview: "A powerful drama exploring complex relationships.",
            genres: ["drama"]
        }
    ];
}

function getDemoTamilMovies() {
    return [
        {
            id: 11,
            title: "Leo",
            poster: "https://via.placeholder.com/500x750/6b1515/d4af37?text=Leo",
            rating: 8.2,
            year: "2024",
            overview: "A man with a mysterious past faces his demons.",
            genres: ["action", "thriller"]
        },
        {
            id: 12,
            title: "Jailer",
            poster: "https://via.placeholder.com/500x750/4a0e0e/f4d03f?text=Jailer",
            rating: 8.0,
            year: "2024",
            overview: "A retired jailer takes on a powerful criminal organization.",
            genres: ["action", "drama"]
        },
        {
            id: 13,
            title: "Vikram",
            poster: "https://via.placeholder.com/500x750/8b2020/d4af37?text=Vikram",
            rating: 8.4,
            year: "2024",
            overview: "Elite agents hunt down a dangerous criminal mastermind.",
            genres: ["action", "thriller"]
        },
        {
            id: 14,
            title: "Varisu",
            poster: "https://via.placeholder.com/500x750/2a2a2a/d4af37?text=Varisu",
            rating: 7.5,
            year: "2024",
            overview: "A family drama about inheritance and relationships.",
            genres: ["drama", "family"]
        },
        {
            id: 15,
            title: "Ponniyin Selvan II",
            poster: "https://via.placeholder.com/500x750/1a1a1a/f4d03f?text=PS+2",
            rating: 8.3,
            year: "2024",
            overview: "The epic conclusion to the Chola dynasty saga.",
            genres: ["historical", "drama"]
        },
        {
            id: 16,
            title: "Mark Antony",
            poster: "https://via.placeholder.com/500x750/6b1515/d4af37?text=Mark+Antony",
            rating: 7.8,
            year: "2024",
            overview: "A sci-fi action thriller involving time travel.",
            genres: ["scifi", "action"]
        },
        {
            id: 17,
            title: "Ayalaan",
            poster: "https://via.placeholder.com/500x750/4a0e0e/f4d03f?text=Ayalaan",
            rating: 7.4,
            year: "2024",
            overview: "An alien befriends humans in this sci-fi adventure.",
            genres: ["scifi", "comedy"]
        },
        {
            id: 18,
            title: "Captain Miller",
            poster: "https://via.placeholder.com/500x750/8b2020/d4af37?text=Captain+Miller",
            rating: 7.9,
            year: "2024",
            overview: "A period action film set during the British era.",
            genres: ["action", "historical"]
        },
        {
            id: 19,
            title: "Lover",
            poster: "https://via.placeholder.com/500x750/2a2a2a/d4af37?text=Lover",
            rating: 7.2,
            year: "2024",
            overview: "A romantic thriller with unexpected twists.",
            genres: ["romance", "thriller"]
        },
        {
            id: 20,
            title: "Merry Christmas",
            poster: "https://via.placeholder.com/500x750/1a1a1a/f4d03f?text=Merry+Christmas",
            rating: 7.6,
            year: "2024",
            overview: "A mysterious encounter on Christmas Eve.",
            genres: ["thriller", "mystery"]
        }
    ];
}

// Cleanup
window.addEventListener('beforeunload', () => {
    stopAutoUpdate();
});

console.log('%c🎬 Ju Movies - Malayalam & Tamil Cinema', 'font-size: 20px; color: #d4af37; font-weight: bold;');
console.log('%cWelcome! Download posters with one click!', 'font-size: 14px; color: #f5f5dc;');
