// Мобильное меню
document.addEventListener('DOMContentLoaded', function() {
    const burgerMenu = document.querySelector('.burger-menu');
    const navMenu = document.querySelector('.nav-menu');
    
    if (burgerMenu && navMenu) {
        burgerMenu.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Загрузка книг
    let books = [];
    
    fetch('/data/books.json')
        .then(response => response.json())
        .then(data => {
            books = data;
            
            if (window.location.pathname.includes('index-auth.html')) {
                showRecommendedBooks(books);
                showPopularBooks(books);
                showBookOfTheDay(books);
                showGenreCollection(books);
            } else if (window.location.pathname.includes('search.html')) {
                handleSearch(books);
            } else if (window.location.pathname.includes('favorites.html')) {
                showFavoriteBooks();
            } else if (window.location.pathname.includes('profile.html')) {
                showProfileRecommendations(books);
            } else if (window.location.pathname.includes('book.html')) {
                showBookDetails(books);
            } else {
                showPopularBooks(books);
                showBookOfTheDay(books);
                showGenreCollection(books);
            }
        })
        .catch(error => {
            console.error('Ошибка загрузки книг:', error);
            books = getTestBooks();
            
            if (window.location.pathname.includes('index-auth.html')) {
                showRecommendedBooks(books);
                showPopularBooks(books);
                showBookOfTheDay(books);
                showGenreCollection(books);
            } else {
                showPopularBooks(books);
                showBookOfTheDay(books);
                showGenreCollection(books);
            }
        });
    
    // Поиск книг
    function handleSearch(books) {
        const searchInput = document.querySelector('.search-input');
        const searchButton = document.querySelector('.search-button');
        
        if (searchInput && searchButton) {
            searchButton.addEventListener('click', performSearch);
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }
        
        function performSearch() {
            const query = searchInput.value.toLowerCase();
            if (!query) return;
            
            const results = books.filter(book => 
                book.title.toLowerCase().includes(query) || 
                book.author.toLowerCase().includes(query)
            );
            
            displayBooks(results, '.search-results');
        }
    }
    
    // Показ рекомендованных книг
    function showRecommendedBooks(books) {
        displayBooks(books, '.recommended-books');
    }
    
    // Показ популярных книг
    function showPopularBooks(books) {
        const popularBooks = [...books].sort((a, b) => b.rating - a.rating);
        displayBooks(popularBooks, '.popular-books');
    }
    
    // Книга дня
    function showBookOfTheDay(books) {
        const bookOfDay = books[0];
        const container = document.querySelector('.book-of-day-container');
        
        if (container && bookOfDay) {
            container.innerHTML = `
                <div class="book-of-day">
                    <div class="book-cover">
                        <img src="${bookOfDay.cover}" alt="${bookOfDay.title}">
                        <div class="rating">${bookOfDay.rating}★</div>
                    </div>
                    <div class="book-details">
                        <h2>${bookOfDay.title}</h2>
                        <p class="book-description">${bookOfDay.description}</p>
                    </div>
                </div>
            `;
        }
    }
    
    // Подборка по жанрам
    function showGenreCollection(books) {
        const genres = [...new Set(books.map(book => book.genre))];
        const genreBooks = genres.map(genre => {
            const booksInGenre = books.filter(book => book.genre === genre);
            return {
                genre: genre,
                book: booksInGenre[0]
            };
        });
        
        const container = document.querySelector('.genre-collection');
        if (container) {
            container.innerHTML = '';
            
            genreBooks.forEach(item => {
                const genreCard = document.createElement('div');
                genreCard.className = 'genre-card';
                genreCard.innerHTML = `
                    <div class="genre-cover">
                        <img src="${item.book.cover}" alt="${item.genre}">
                    </div>
                    <div class="genre-title">${item.genre}</div>
                `;
                container.appendChild(genreCard);
            });
        }
    }
    
    // Рекомендации для профиля
    function showProfileRecommendations(books) {
        displayBooks(books, '.recommendations');
    }
    
    // Отображение книг
    function displayBooks(books, selector) {
        const container = document.querySelector(selector);
        if (!container) return;
        
        container.innerHTML = '';
        
        books.forEach(book => {
            const isFavorite = isBookFavorite(book.id);
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            bookCard.innerHTML = `
                <div class="book-cover">
                    <img src="${book.cover}" alt="${book.title}">
                    <div class="rating">${book.rating}★</div>
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${book.id}">
                        ${isFavorite ? '❤️' : '♡'}
                    </button>
                </div>
                <div class="book-info">
                    <div class="book-title">${book.title}</div>
                    <div class="book-author">${book.author}</div>
                    <div class="book-description">${book.shortDescription}</div>
                </div>
            `;
            
            container.appendChild(bookCard);
            
            const favoriteBtn = bookCard.querySelector('.favorite-btn');
            favoriteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleFavorite(book.id, this);
            });
            
            bookCard.addEventListener('click', function() {
                window.location.href = `/pages/book.html?id=${book.id}`;
            });
        });
    }
    
    // Работа с избранным
    function isBookFavorite(bookId) {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        return favorites.includes(bookId);
    }
    
    function toggleFavorite(bookId, button) {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const index = favorites.indexOf(bookId);
        
        if (index === -1) {
            favorites.push(bookId);
            button.classList.add('active');
            button.textContent = '❤️';
        } else {
            favorites.splice(index, 1);
            button.classList.remove('active');
            button.textContent = '♡';
        }
        
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
    
    // Показ избранных книг
    function showFavoriteBooks() {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        if (favorites.length === 0) {
            const container = document.querySelector('.favorites-container');
            if (container) {
                container.innerHTML = '<p>У вас нет избранных книг</p>';
            }
            return;
        }
        
        fetch('/data/books.json')
            .then(response => response.json())
            .then(books => {
                const favoriteBooks = books.filter(book => favorites.includes(book.id));
                displayBooks(favoriteBooks, '.favorites-container');
            })
            .catch(error => {
                console.error('Ошибка загрузки книг:', error);
            });
    }
    
    // Показ деталей книги
    function showBookDetails(books) {
        const urlParams = new URLSearchParams(window.location.search);
        const bookId = parseInt(urlParams.get('id')) || 1;
        
        const book = books.find(b => b.id === bookId);
        if (!book) return;
        
        const container = document.querySelector('.book-details-container');
        if (container) {
            const isFavorite = isBookFavorite(book.id);
            container.innerHTML = `
                <div class="book-detail">
                    <div class="book-cover-large">
                        <img src="${book.cover}" alt="${book.title}">
                    </div>
                    <div class="book-info-detail">
                        <h2>${book.title}</h2>
                        <p class="book-author">${book.author}</p>
                        <p class="book-full-description">${book.description}</p>
                        <div class="rating-display">${book.rating}★</div>
                        <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${book.id}">
                            ${isFavorite ? '❤️' : '♡'}
                        </button>
                    </div>
                </div>
            `;
            
            const favoriteBtn = document.querySelector('.favorite-btn');
            if (favoriteBtn) {
                favoriteBtn.addEventListener('click', function() {
                    toggleFavorite(book.id, this);
                });
            }
        }
    }
    
    // Тестовые данные
    function getTestBooks() {
        return [
            {
                id: 1,
                title: "Тестовая книга 1",
                author: "Тестовый автор 1",
                description: "Это тестовое описание книги. Оно используется для проверки отображения.",
                shortDescription: "Краткое тестовое описание.",
                genre: "Тест",
                rating: 4.5,
                cover: "/images/books/test1.jpg"
            },
            {
                id: 2,
                title: "Тестовая книга 2",
                author: "Тестовый автор 2",
                description: "Это другое тестовое описание книги. Оно используется для проверки отображения.",
                shortDescription: "Еще одно краткое описание.",
                genre: "Тест",
                rating: 4.2,
                cover: "/images/books/test2.jpg"
            }
        ];
    }
});