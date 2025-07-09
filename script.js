// Recommendation System Class
class RecommendationSystem {
    constructor() {
        this.currentUser = {
            id: 1,
            name: 'John Doe',
            preferences: {
                movies: ['action', 'drama', 'sci-fi'],
                books: ['fiction', 'thriller', 'biography'],
                products: ['electronics', 'fashion', 'books']
            },
            ratings: new Map(),
            likedItems: new Set(),
            dislikedItems: new Set()
        };
        
        this.data = {
            movies: this.generateMovieData(),
            books: this.generateBookData(),
            products: this.generateProductData()
        };
        
        this.currentSection = 'dashboard';
        this.currentFilter = 'all';
        this.searchQuery = '';
        
        this.initializeApp();
    }

    initializeApp() {
        this.setupEventListeners();
        this.loadUserData();
        this.loadRecommendations();
        this.addAnimations();
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.switchSection(e.currentTarget.dataset.section);
            });
        });

        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.setFilter(e.currentTarget.dataset.filter);
            });
        });

        // Genre filters
        document.querySelectorAll('.genre-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setGenreFilter(e.currentTarget.dataset.genre);
            });
        });

        // Category filters
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setCategoryFilter(e.currentTarget.dataset.category);
            });
        });

        // Product filters
        document.querySelectorAll('.product-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setProductFilter(e.currentTarget.dataset.category);
            });
        });

        // Search
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.filterRecommendations();
        });

        // Modal events
        document.getElementById('modal-close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('modal-like').addEventListener('click', () => {
            this.likeItem(this.currentModalItem);
        });

        document.getElementById('modal-dislike').addEventListener('click', () => {
            this.dislikeItem(this.currentModalItem);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    toggleTheme() {
        const body = document.body;
        if (body.classList.contains('dark-mode')) {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        }
        
        // Add theme transition effect
        this.addThemeTransition();
    }

    addThemeTransition() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--accent);
            z-index: 9999;
            opacity: 0.1;
            pointer-events: none;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(overlay);
            }, 300);
        }, 100);
    }

    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update content sections
        document.querySelectorAll('.content-section').forEach(sectionEl => {
            sectionEl.classList.remove('active');
        });
        document.getElementById(section).classList.add('active');

        this.currentSection = section;
        this.loadSectionContent(section);
    }

    loadSectionContent(section) {
        switch (section) {
            case 'dashboard':
                this.loadDashboardRecommendations();
                break;
            case 'movies':
                this.loadMovies();
                break;
            case 'books':
                this.loadBooks();
                break;
            case 'products':
                this.loadProducts();
                break;
            case 'profile':
                this.loadProfile();
                break;
        }
    }

    setFilter(filter) {
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.currentFilter = filter;
        this.filterRecommendations();
    }

    setGenreFilter(genre) {
        document.querySelectorAll('.genre-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-genre="${genre}"]`).classList.add('active');
        
        this.filterMoviesByGenre(genre);
    }

    setCategoryFilter(category) {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        this.filterBooksByCategory(category);
    }

    setProductFilter(category) {
        document.querySelectorAll('.product-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        this.filterProductsByCategory(category);
    }

    loadRecommendations() {
        this.loadDashboardRecommendations();
    }

    loadDashboardRecommendations() {
        const container = document.getElementById('recommendations-container');
        const recommendations = this.getRecommendations();
        
        container.innerHTML = '';
        
        recommendations.forEach(item => {
            const card = this.createRecommendationCard(item);
            container.appendChild(card);
        });
        document.getElementById('loading-overlay').style.display = 'none';
    }

    getRecommendations() {
        let allItems = [];
        
        // Get recommendations from all categories
        const movieRecs = this.getMovieRecommendations().slice(0, 4);
        const bookRecs = this.getBookRecommendations().slice(0, 4);
        const productRecs = this.getProductRecommendations().slice(0, 4);
        
        allItems = [...movieRecs, ...bookRecs, ...productRecs];
        
        // Shuffle and limit
        return this.shuffleArray(allItems).slice(0, 8);
    }

    getMovieRecommendations() {
        return this.collaborativeFiltering(this.data.movies, 'movies');
    }

    getBookRecommendations() {
        return this.collaborativeFiltering(this.data.books, 'books');
    }

    getProductRecommendations() {
        return this.collaborativeFiltering(this.data.products, 'products');
    }

    collaborativeFiltering(items, category) {
        // Simple collaborative filtering based on user preferences
        const userPrefs = this.currentUser.preferences[category] || [];
        
        return items
            .map(item => {
                let score = 0;
                
                // Content-based scoring
                if (item.genre && userPrefs.includes(item.genre.toLowerCase())) {
                    score += 3;
                }
                if (item.category && userPrefs.includes(item.category.toLowerCase())) {
                    score += 3;
                }
                
                // Rating-based scoring
                if (item.rating >= 4.5) score += 2;
                else if (item.rating >= 4.0) score += 1;
                
                // Popularity scoring
                score += Math.min(item.popularity / 100, 2);
                
                // Random factor for diversity
                score += Math.random();
                
                return { ...item, score };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 12);
    }

    createRecommendationCard(item) {
        const card = document.createElement('div');
        card.className = 'recommendation-card';
        card.dataset.id = item.id;
        card.dataset.type = item.type;
        
        const icon = this.getIconForType(item.type);
        const rating = this.generateStars(item.rating);
        
        card.innerHTML = `
            <div class="card-image">
                <i class="${icon}"></i>
            </div>
            <div class="card-content">
                <h3 class="card-title">${item.title}</h3>
                <p class="card-subtitle">${item.subtitle || item.author || item.brand}</p>
                <div class="card-rating">
                    <div class="stars">${rating}</div>
                    <span class="rating-text">${item.rating}/5</span>
                </div>
                <div class="card-actions">
                    <button class="btn btn-primary" onclick="app.likeItem('${item.id}')">
                        <i class="fas fa-heart"></i>
                        Like
                    </button>
                    <button class="btn btn-secondary" onclick="app.showItemDetails('${item.id}')">
                        <i class="fas fa-info-circle"></i>
                        Details
                    </button>
                </div>
            </div>
        `;
        
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.btn')) {
                this.showItemDetails(item.id);
            }
        });
        
        return card;
    }

    getIconForType(type) {
        const icons = {
            movie: 'fas fa-film',
            book: 'fas fa-book',
            product: 'fas fa-shopping-bag'
        };
        return icons[type] || 'fas fa-star';
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }

    showItemDetails(itemId) {
        const item = this.findItemById(itemId);
        if (!item) return;
        
        this.currentModalItem = itemId;
        
        const modal = document.getElementById('recommendation-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        modalTitle.textContent = item.title;
        
        const icon = this.getIconForType(item.type);
        const rating = this.generateStars(item.rating);
        
        modalBody.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="width: 80px; height: 80px; background: var(--gradient-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                    <i class="${icon}" style="font-size: 32px; color: white;"></i>
                </div>
                <h3 style="margin-bottom: 10px; color: var(--text-primary);">${item.title}</h3>
                <p style="color: var(--text-secondary); margin-bottom: 15px;">${item.subtitle || item.author || item.brand}</p>
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 20px;">
                    <div class="stars">${rating}</div>
                    <span style="color: var(--text-muted);">${item.rating}/5</span>
                </div>
            </div>
            <div style="background: var(--bg-secondary); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <h4 style="margin-bottom: 10px; color: var(--text-primary);">Description</h4>
                <p style="color: var(--text-secondary); line-height: 1.6;">${item.description}</p>
            </div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                ${item.genre ? `<span class="tag">${item.genre}</span>` : ''}
                ${item.category ? `<span class="tag">${item.category}</span>` : ''}
                ${item.tags ? item.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
            </div>
        `;
        
        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('recommendation-modal').style.display = 'none';
        this.currentModalItem = null;
    }

    likeItem(itemId) {
        this.currentUser.likedItems.add(itemId);
        this.currentUser.dislikedItems.delete(itemId);
        this.saveUserData();
        this.closeModal();
        this.showNotification('Item added to your favorites!', 'success');
        this.updateRecommendations();
    }

    dislikeItem(itemId) {
        this.currentUser.dislikedItems.add(itemId);
        this.currentUser.likedItems.delete(itemId);
        this.saveUserData();
        this.closeModal();
        this.showNotification('We\'ll show you different recommendations', 'info');
        this.updateRecommendations();
    }

    findItemById(itemId) {
        for (const category of Object.values(this.data)) {
            const item = category.find(item => item.id === itemId);
            if (item) return item;
        }
        return null;
    }

    filterRecommendations() {
        if (this.currentSection !== 'dashboard') return;
        
        const container = document.getElementById('recommendations-container');
        const recommendations = this.getRecommendations();
        
        let filteredItems = recommendations;
        
        // Apply category filter
        if (this.currentFilter !== 'all') {
            filteredItems = recommendations.filter(item => item.type === this.currentFilter.slice(0, -1));
        }
        
        // Apply search filter
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filteredItems = filteredItems.filter(item => 
                item.title.toLowerCase().includes(query) ||
                (item.subtitle && item.subtitle.toLowerCase().includes(query)) ||
                (item.author && item.author.toLowerCase().includes(query)) ||
                (item.brand && item.brand.toLowerCase().includes(query))
            );
        }
        
        container.innerHTML = '';
        filteredItems.forEach(item => {
            const card = this.createRecommendationCard(item);
            container.appendChild(card);
        });
    }

    loadMovies() {
        const container = document.getElementById('movies-grid');
        const movies = this.getMovieRecommendations();
        
        container.innerHTML = '';
        movies.forEach(movie => {
            const card = this.createRecommendationCard(movie);
            container.appendChild(card);
        });
    }

    loadBooks() {
        const container = document.getElementById('books-grid');
        const books = this.getBookRecommendations();
        
        container.innerHTML = '';
        books.forEach(book => {
            const card = this.createRecommendationCard(book);
            container.appendChild(card);
        });
    }

    loadProducts() {
        const container = document.getElementById('products-grid');
        const products = this.getProductRecommendations();
        
        container.innerHTML = '';
        products.forEach(product => {
            const card = this.createRecommendationCard(product);
            container.appendChild(card);
        });
    }

    loadProfile() {
        // Profile is static for now, but could be dynamic
        this.updateProfileStats();
    }

    updateProfileStats() {
        const likedCount = this.currentUser.likedItems.size;
        const ratedCount = this.currentUser.ratings.size;
        const viewedCount = Math.floor(Math.random() * 1000) + 500; // Simulated
        
        // Update stats in the profile section
        const statsElements = document.querySelectorAll('.profile-stats span');
        if (statsElements.length >= 3) {
            statsElements[0].innerHTML = `<i class="fas fa-heart"></i> ${likedCount} Liked`;
            statsElements[1].innerHTML = `<i class="fas fa-star"></i> ${ratedCount} Rated`;
            statsElements[2].innerHTML = `<i class="fas fa-eye"></i> ${viewedCount} Viewed`;
        }
    }

    updateRecommendations() {
        this.loadSectionContent(this.currentSection);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-secondary);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 15px 20px;
            color: var(--text-primary);
            z-index: 1001;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            box-shadow: var(--shadow-lg);
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    saveUserData() {
        try {
            localStorage.setItem('userData', JSON.stringify({
                preferences: this.currentUser.preferences,
                likedItems: Array.from(this.currentUser.likedItems),
                dislikedItems: Array.from(this.currentUser.dislikedItems),
                ratings: Array.from(this.currentUser.ratings.entries())
            }));
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    }

    loadUserData() {
        try {
            const saved = localStorage.getItem('userData');
            if (saved) {
                const data = JSON.parse(saved);
                this.currentUser.preferences = data.preferences || this.currentUser.preferences;
                this.currentUser.likedItems = new Set(data.likedItems || []);
                this.currentUser.dislikedItems = new Set(data.dislikedItems || []);
                this.currentUser.ratings = new Map(data.ratings || []);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    addAnimations() {
        // Add entrance animations to cards
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        });

        document.querySelectorAll('.recommendation-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.6s ease';
            observer.observe(card);
        });
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Data generation methods
    generateMovieData() {
        return [
            {
                id: 'm1',
                type: 'movie',
                title: 'Inception',
                subtitle: 'A mind-bending thriller',
                genre: 'Sci-Fi',
                rating: 4.8,
                popularity: 95,
                description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
                tags: ['Thriller', 'Action', 'Mind-bending']
            },
            {
                id: 'm2',
                type: 'movie',
                title: 'The Dark Knight',
                subtitle: 'Epic superhero drama',
                genre: 'Action',
                rating: 4.9,
                popularity: 98,
                description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
                tags: ['Superhero', 'Drama', 'Crime']
            },
            {
                id: 'm3',
                type: 'movie',
                title: 'Interstellar',
                subtitle: 'Space exploration epic',
                genre: 'Sci-Fi',
                rating: 4.7,
                popularity: 92,
                description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
                tags: ['Space', 'Adventure', 'Drama']
            },
            {
                id: 'm4',
                type: 'movie',
                title: 'Pulp Fiction',
                subtitle: 'Cult classic crime film',
                genre: 'Drama',
                rating: 4.6,
                popularity: 88,
                description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
                tags: ['Crime', 'Comedy', 'Thriller']
            },
            {
                id: 'm5',
                type: 'movie',
                title: 'The Matrix',
                subtitle: 'Revolutionary sci-fi action',
                genre: 'Sci-Fi',
                rating: 4.5,
                popularity: 90,
                description: 'A computer programmer discovers that reality as he knows it is a simulation created by machines, and joins a rebellion to break free.',
                tags: ['Action', 'Philosophy', 'Cyberpunk']
            },
            {
                id: 'm6',
                type: 'movie',
                title: 'Fight Club',
                subtitle: 'Psychological thriller',
                genre: 'Drama',
                rating: 4.4,
                popularity: 85,
                description: 'An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.',
                tags: ['Thriller', 'Psychological', 'Satire']
            }
        ];
    }

    generateBookData() {
        return [
            {
                id: 'b1',
                type: 'book',
                title: 'The Great Gatsby',
                author: 'F. Scott Fitzgerald',
                category: 'Fiction',
                rating: 4.5,
                popularity: 88,
                description: 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
                tags: ['Classic', 'Romance', 'American Literature']
            },
            {
                id: 'b2',
                type: 'book',
                title: '1984',
                author: 'George Orwell',
                category: 'Fiction',
                rating: 4.7,
                popularity: 92,
                description: 'A dystopian novel about totalitarianism and surveillance society.',
                tags: ['Dystopian', 'Political', 'Classic']
            },
            {
                id: 'b3',
                type: 'book',
                title: 'The Hobbit',
                author: 'J.R.R. Tolkien',
                category: 'Fiction',
                rating: 4.6,
                popularity: 90,
                description: 'A fantasy novel about a hobbit\'s journey with thirteen dwarves to reclaim their homeland.',
                tags: ['Fantasy', 'Adventure', 'Classic']
            },
            {
                id: 'b4',
                type: 'book',
                title: 'Sapiens',
                author: 'Yuval Noah Harari',
                category: 'Non-Fiction',
                rating: 4.4,
                popularity: 85,
                description: 'A brief history of humankind, from ancient humans to the present day.',
                tags: ['History', 'Science', 'Philosophy']
            },
            {
                id: 'b5',
                type: 'book',
                title: 'The Alchemist',
                author: 'Paulo Coelho',
                category: 'Fiction',
                rating: 4.3,
                popularity: 82,
                description: 'A novel about a young Andalusian shepherd who dreams of finding a worldly treasure.',
                tags: ['Philosophy', 'Adventure', 'Inspirational']
            },
            {
                id: 'b6',
                type: 'book',
                title: 'Atomic Habits',
                author: 'James Clear',
                category: 'Non-Fiction',
                rating: 4.6,
                popularity: 87,
                description: 'A guide to building good habits and breaking bad ones.',
                tags: ['Self-Help', 'Psychology', 'Productivity']
            }
        ];
    }

    generateProductData() {
        return [
            {
                id: 'p1',
                type: 'product',
                title: 'Wireless Headphones',
                brand: 'TechPro',
                category: 'Electronics',
                rating: 4.5,
                popularity: 90,
                description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
                tags: ['Wireless', 'Noise Cancelling', 'Bluetooth']
            },
            {
                id: 'p2',
                type: 'product',
                title: 'Smart Watch',
                brand: 'FitTech',
                category: 'Electronics',
                rating: 4.3,
                popularity: 85,
                description: 'Advanced smartwatch with health monitoring and GPS tracking.',
                tags: ['Fitness', 'GPS', 'Health Monitor']
            },
            {
                id: 'p3',
                type: 'product',
                title: 'Designer Jeans',
                brand: 'FashionCo',
                category: 'Fashion',
                rating: 4.2,
                popularity: 78,
                description: 'Premium designer jeans with perfect fit and modern styling.',
                tags: ['Designer', 'Premium', 'Comfortable']
            },
            {
                id: 'p4',
                type: 'product',
                title: 'Coffee Maker',
                brand: 'HomeBrew',
                category: 'Home',
                rating: 4.4,
                popularity: 82,
                description: 'Automatic coffee maker with programmable settings and thermal carafe.',
                tags: ['Automatic', 'Programmable', 'Thermal']
            },
            {
                id: 'p5',
                type: 'product',
                title: 'Yoga Mat',
                brand: 'FitLife',
                category: 'Sports',
                rating: 4.1,
                popularity: 75,
                description: 'Non-slip yoga mat made from eco-friendly materials.',
                tags: ['Non-slip', 'Eco-friendly', 'Comfortable']
            },
            {
                id: 'p6',
                type: 'product',
                title: 'Laptop Stand',
                brand: 'ErgoTech',
                category: 'Electronics',
                rating: 4.0,
                popularity: 72,
                description: 'Adjustable laptop stand for better ergonomics and posture.',
                tags: ['Ergonomic', 'Adjustable', 'Portable']
            }
        ];
    }
}

// Initialize the app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new RecommendationSystem();
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.className = savedTheme + '-mode';
    
    // Add some cool entrance animations
    setTimeout(() => {
        document.querySelectorAll('.stat-card').forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 500);
});

// Add floating particles effect
document.addEventListener('mousemove', (e) => {
    if (Math.random() < 0.1) {
        createParticle(e.clientX, e.clientY);
    }
});

function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 4px;
        height: 4px;
        background: var(--accent);
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        opacity: 0.6;
    `;
    
    document.body.appendChild(particle);
    
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 2 + 1;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;
    
    let opacity = 0.6;
    const animate = () => {
        opacity -= 0.02;
        particle.style.opacity = opacity;
        particle.style.left = (parseFloat(particle.style.left) + vx) + 'px';
        particle.style.top = (parseFloat(particle.style.top) + vy) + 'px';
        
        if (opacity > 0) {
            requestAnimationFrame(animate);
        } else {
            particle.remove();
        }
    };
    
    requestAnimationFrame(animate);
} 