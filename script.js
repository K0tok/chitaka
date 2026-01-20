// Глобальные переменные
let books = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Загрузка книг из JSON файла
async function loadBooks() {
  try {
    const response = await fetch('./data/books.json');
    books = await response.json();
    return books;
  } catch (error) {
    console.error('Ошибка загрузки книг:', error);
    // Возвращаем тестовые данные, если файл не найден
    return [
      {
        id: 1,
        title: "Война и мир",
        author: "Лев Толстой",
        description: "Эпический роман-хроника, описывающий русское общество в эпоху войн Napолеона. Основные события разворачиваются в период с 1805 по 1820 год.",
        shortDescription: "Эпический роман о русском обществе в эпоху Наполеона",
        genre: "Классика",
        rating: 4.8,
        cover: "./images/books/book1.jpg"
      }
    ];
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
  await loadBooks();
  updateAuthButton();
  setupEventListeners();
  updateFavoriteButtons();
  
  // Загрузка содержимого для конкретных страниц
  const currentPage = window.location.pathname.split('/').pop();
  
  if (currentPage === 'index.html' || currentPage === 'index-auth.html' || currentPage === '') {
    displayHomePage();
  } else if (currentPage.includes('search')) {
    setupSearchPage();
  } else if (currentPage.includes('book.html')) {
    displayBookDetail();
  } else if (currentPage.includes('favorites')) {
    displayFavoritesPage();
  } else if (currentPage.includes('profile')) {
    displayProfilePage();
  } else if (currentPage.includes('login')) {
    setupLoginPage();
  } else if (currentPage.includes('register')) {
    setupRegisterPage();
  }
});

// Обновление кнопки авторизации
function updateAuthButton() {
  const authBtn = document.querySelector('.auth-btn');
  if (!authBtn) return;
  
  if (isLoggedIn) {
    authBtn.textContent = 'Выйти';
    authBtn.onclick = logout;
  } else {
    authBtn.textContent = 'Войти';
    authBtn.onclick = () => window.location.href = '/pages/login.html';
  }
}

// Установка обработчиков событий
function setupEventListeners() {
  // Бургер-меню
  const burger = document.querySelector('.burger-menu');
  const navMenu = document.querySelector('.nav-menu');
  
  if (burger && navMenu) {
    burger.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }
  
  // Закрытие меню при клике на ссылку
  const navLinks = document.querySelectorAll('.nav-menu a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu) navMenu.classList.remove('active');
    });
  });
}

// Функция входа
function login(email, password) {
  // Имитация авторизации - в реальном приложении здесь была бы проверка с сервером
  isLoggedIn = true;
  currentUser = {
    email: email,
    name: email.split('@')[0] // Просто имя из email
  };
  
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
  updateAuthButton();
  return true;
}

// Функция регистрации
function register(name, email, password) {
  // Имитация регистрации - в реальном приложении здесь была бы отправка на сервер
  isLoggedIn = true;
  currentUser = {
    email: email,
    name: name
  };
  
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
  updateAuthButton();
  return true;
}

// Функция выхода
function logout() {
  isLoggedIn = false;
  currentUser = null;
  
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('currentUser');
  
  updateAuthButton();
  window.location.href = '/pages/index.html';
}

// Добавление/удаление из избранного
function toggleFavorite(bookId) {
  const index = favorites.indexOf(bookId);
  if (index === -1) {
    favorites.push(bookId);
  } else {
    favorites.splice(index, 1);
  }
  
  localStorage.setItem('favorites', JSON.stringify(favorites));
  updateFavoriteButtons();
}

// Обновление состояния кнопок избранного на странице
function updateFavoriteButtons() {
  const favoriteButtons = document.querySelectorAll('.favorite-btn');
  favoriteButtons.forEach(btn => {
    const bookId = parseInt(btn.dataset.bookId);
    if (favorites.includes(bookId)) {
      btn.classList.add('favorited');
      btn.innerHTML = '♥';
    } else {
      btn.classList.remove('favorited');
      btn.innerHTML = '♡';
    }
  });
}

// Отображение главной страницы
async function displayHomePage() {
  await loadBooks();
  
  // Популярные книги (с наивысшим рейтингом)
  const popularBooks = [...books].sort((a, b) => b.rating - a.rating).slice(0, 6);
  displayBooksSection(popularBooks, 'Популярные книги', 'popular-books');
  
  // Книги по жанрам
  const genres = [...new Set(books.map(book => book.genre))];
  genres.slice(0, 3).forEach(genre => {
    const genreBooks = books.filter(book => book.genre === genre).slice(0, 4);
    displayBooksSection(genreBooks, `Подборка: ${genre}`, `genre-${genre}`);
  });
  
  // Книга дня
  displayBookOfDay();
  
  // Рекомендованные книги (если авторизован)
  if (isLoggedIn) {
    displayRecommendedBooks();
  }
}

// Отображение секции книг
function displayBooksSection(books, title, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = `
    <h2 class="section-title">${title}</h2>
    <div class="books-grid">
      ${books.map(book => createBookCard(book)).join('')}
    </div>
  `;
  
  updateFavoriteButtons();
}

// Создание карточки книги
function createBookCard(book) {
  return `
    <div class="book-card">
      <img src="${book.cover}" alt="${book.title}" class="book-cover" onerror="this.src='./images/books/default.svg'">
      <div class="book-info">
        <h3 class="book-title">${book.title}</h3>
        <p class="book-author">${book.author}</p>
        <span class="book-genre">${book.genre}</span>
        <div class="book-rating">${renderStars(book.rating)}</div>
        <p class="book-short-description">${book.shortDescription}</p>
        <button class="favorite-btn" data-book-id="${book.id}">${favorites.includes(book.id) ? '♥' : '♡'}</button>
      </div>
    </div>
  `;
}

// Отображение книги дня
function displayBookOfDay() {
  const bookOfDayContainer = document.getElementById('book-of-day');
  if (!bookOfDayContainer) return;
  
  if (books.length > 0) {
    const randomBook = books[Math.floor(Math.random() * books.length)];
    bookOfDayContainer.innerHTML = `
      <h2 class="section-title">Книга дня</h2>
      <div class="book-card">
        <img src="${randomBook.cover}" alt="${randomBook.title}" class="book-cover" onerror="this.src='./images/books/default.svg'">
        <div class="book-info">
          <h3 class="book-title">${randomBook.title}</h3>
          <p class="book-author">${randomBook.author}</p>
          <span class="book-genre">${randomBook.genre}</span>
          <div class="book-rating">${renderStars(randomBook.rating)}</div>
          <p class="book-description">${randomBook.description}</p>
          <button class="favorite-btn" data-book-id="${randomBook.id}">${favorites.includes(randomBook.id) ? '♥' : '♡'}</button>
        </div>
      </div>
    `;
    
    updateFavoriteButtons();
  }
}

// Отображение рекомендованных книг
function displayRecommendedBooks() {
  const recommendedContainer = document.getElementById('recommended-books');
  if (!recommendedContainer) return;
  
  // Простая рекомендация - книги с высоким рейтингом в жанрах, которые нравятся пользователю
  // В реальном приложении это было бы основано на предыдущих оценках пользователя
  const recommendedBooks = [...books].sort((a, b) => b.rating - a.rating).slice(0, 4);
  
  recommendedContainer.innerHTML = `
    <h2 class="section-title">Рекомендовано вам</h2>
    <div class="books-grid">
      ${recommendedBooks.map(book => createBookCard(book)).join('')}
    </div>
  `;
  
  updateFavoriteButtons();
}

// Рендер звезд рейтинга
function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let stars = '';
  
  for (let i = 0; i < fullStars; i++) {
    stars += '★';
  }
  
  if (hasHalfStar) {
    stars += '☆';
  }
  
  for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
    stars += '☆';
  }
  
  return `<span class="rating">${stars} (${rating})</span>`;
}

// Настройка страницы поиска
function setupSearchPage() {
  const searchInput = document.querySelector('.search-input');
  if (!searchInput) return;
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    performSearch(query);
  });
  
  // Выполнить поиск при загрузке, если есть параметр
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('q');
  if (searchQuery) {
    searchInput.value = searchQuery;
    performSearch(searchQuery.toLowerCase());
  }
}

// Выполнение поиска
async function performSearch(query) {
  if (!query.trim()) {
    document.querySelector('.search-results').innerHTML = '';
    return;
  }
  
  await loadBooks();
  const results = books.filter(book => 
    book.title.toLowerCase().includes(query) || 
    book.author.toLowerCase().includes(query) ||
    book.genre.toLowerCase().includes(query)
  );
  
  displaySearchResults(results);
}

// Отображение результатов поиска
function displaySearchResults(results) {
  const resultsContainer = document.querySelector('.search-results');
  if (!resultsContainer) return;
  
  if (results.length === 0) {
    resultsContainer.innerHTML = '<p>Книги не найдены</p>';
    return;
  }
  
  resultsContainer.innerHTML = `
    <h2 class="section-title">Результаты поиска</h2>
    <div class="books-list">
      ${results.map(book => createSearchResultCard(book)).join('')}
    </div>
  `;
  
  updateFavoriteButtons();
}

// Создание карточки результата поиска
function createSearchResultCard(book) {
  return `
    <div class="book-card">
      <div style="display: flex;">
        <img src="${book.cover}" alt="${book.title}" class="book-cover" style="width: 100px; height: 150px; object-fit: cover;" onerror="this.src='./images/books/default.svg'">
        <div class="book-info" style="flex: 1; padding: 1rem;">
          <h3 class="book-title">${book.title}</h3>
          <p class="book-author">${book.author}</p>
          <span class="book-genre">${book.genre}</span>
          <div class="book-rating">${renderStars(book.rating)}</div>
          <p class="book-short-description">${book.shortDescription}</p>
          <button class="favorite-btn" data-book-id="${book.id}">${favorites.includes(book.id) ? '♥' : '♡'}</button>
        </div>
      </div>
    </div>
  `;
}

// Отображение страницы книги
function displayBookDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = parseInt(urlParams.get('id'));
  
  if (!bookId) {
    document.querySelector('main').innerHTML = '<p>Книга не найдена</p>';
    return;
  }
  
  const book = books.find(b => b.id === bookId);
  if (!book) {
    document.querySelector('main').innerHTML = '<p>Книга не найдена</p>';
    return;
  }
  
  document.querySelector('main').innerHTML = `
    <div class="book-detail">
      <img src="${book.cover}" alt="${book.title}" class="book-detail-cover" onerror="this.src='./images/books/default.svg'">
      <div class="book-detail-info">
        <h1 class="book-detail-title">${book.title}</h1>
        <p class="book-detail-author">${book.author}</p>
        <div class="book-detail-rating">${renderStars(book.rating)}</div>
        <p class="book-detail-description">${book.description}</p>
        <button class="favorite-btn" data-book-id="${book.id}" style="font-size: 2rem;">${favorites.includes(book.id) ? '♥' : '♡'}</button>
      </div>
    </div>
  `;
  
  updateFavoriteButtons();
}

// Отображение страницы избранного
async function displayFavoritesPage() {
  await loadBooks();
  const favoriteBooks = books.filter(book => favorites.includes(book.id));
  
  const mainContent = document.querySelector('main');
  if (!mainContent) return;
  
  if (favoriteBooks.length === 0) {
    mainContent.innerHTML = `
      <h1>Мои книги</h1>
      <p>У вас пока нет избранных книг</p>
    `;
    return;
  }
  
  mainContent.innerHTML = `
    <h1>Мои книги</h1>
    <div class="books-grid">
      ${favoriteBooks.map(book => createBookCard(book)).join('')}
    </div>
  `;
  
  updateFavoriteButtons();
}

// Отображение страницы профиля
function displayProfilePage() {
  if (!isLoggedIn) {
    window.location.href = '/pages/login.html';
    return;
  }
  
  const favoriteCount = favorites.length;
  const mainContent = document.querySelector('main');
  
  if (!mainContent) return;
  
  mainContent.innerHTML = `
    <h1>Профиль</h1>
    <div class="profile-info">
      <p><strong>Имя:</strong> ${currentUser.name}</p>
      <p><strong>Email:</strong> ${currentUser.email}</p>
      <p><strong>Количество сохранённых книг:</strong> ${favoriteCount}</p>
    </div>
    <h2 class="section-title" style="margin-top: 2rem;">Рекомендации для вас</h2>
    <div id="profile-recommended"></div>
  `;
  
  // Отображение рекомендованных книг
  displayRecommendedBooksForProfile();
}

// Отображение рекомендованных книг на странице профиля
function displayRecommendedBooksForProfile() {
  // Простая рекомендация - книги с высоким рейтингом
  const recommendedBooks = [...books].sort((a, b) => b.rating - a.rating).slice(0, 4);
  
  const container = document.getElementById('profile-recommended');
  if (!container) return;
  
  container.innerHTML = `
    <div class="books-grid">
      ${recommendedBooks.map(book => createBookCard(book)).join('')}
    </div>
  `;
  
  updateFavoriteButtons();
}

// Настройка страницы входа
function setupLoginPage() {
  const loginForm = document.querySelector('#login-form');
  if (!loginForm) return;
  
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    const messageEl = document.querySelector('.message');
    
    if (!email || !password) {
      showMessage(messageEl, 'Заполните все поля', 'error');
      return;
    }
    
    // Простая проверка (в реальном приложении была бы проверка с сервером)
    if (login(email, password)) {
      showMessage(messageEl, 'Успешный вход', 'success');
      setTimeout(() => {
        window.location.href = '/pages/index-auth.html';
      }, 1000);
    } else {
      showMessage(messageEl, 'Неверный email или пароль', 'error');
    }
  });
}

// Настройка страницы регистрации
function setupRegisterPage() {
  const registerForm = document.querySelector('#register-form');
  if (!registerForm) return;
  
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.querySelector('#name').value;
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    const confirmPassword = document.querySelector('#confirm-password').value;
    const messageEl = document.querySelector('.message');
    
    if (!name || !email || !password || !confirmPassword) {
      showMessage(messageEl, 'Заполните все поля', 'error');
      return;
    }
    
    if (password !== confirmPassword) {
      showMessage(messageEl, 'Пароли не совпадают', 'error');
      return;
    }
    
    if (password.length < 6) {
      showMessage(messageEl, 'Пароль должен быть не менее 6 символов', 'error');
      return;
    }
    
    // Простая регистрация (в реальном приложении была бы отправка на сервер)
    if (register(name, email, password)) {
      showMessage(messageEl, 'Регистрация успешна', 'success');
      setTimeout(() => {
        window.location.href = '/pages/index-auth.html';
      }, 1000);
    }
  });
}

// Показ сообщений
function showMessage(element, message, type) {
  if (!element) return;
  
  element.textContent = message;
  element.className = type === 'error' ? 'error-message' : 'success-message';
  
  // Автоматически скрыть сообщение через 3 секунды
  setTimeout(() => {
    if (element) element.textContent = '';
  }, 3000);
}

// Добавление обработчиков для кнопок избранного
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('favorite-btn')) {
    const bookId = parseInt(e.target.dataset.bookId);
    if (bookId) {
      toggleFavorite(bookId);
      
      // Обновить отображение кнопки
      if (e.target.classList.contains('favorited')) {
        e.target.innerHTML = '♡';
        e.target.classList.remove('favorited');
      } else {
        e.target.innerHTML = '♥';
        e.target.classList.add('favorited');
      }
    }
  }
});