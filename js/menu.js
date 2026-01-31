if (!window.dishes) {
    window.dishes = [];
}
let categories = {};
let activeFilters = {
    soup: null,
    main: null,
    drink: null,
    salad: null,
    dessert: null
};

document.addEventListener('DOMContentLoaded', function() {
    initializeCategories();
    createFilters();
    displayAllDishes();
    setupFilterHandlers();
});

function initializeCategories() {
    categories = {
        'soup': { 
            element: document.querySelector('#soup-section .dishes-grid'), 
            title: 'Супы',
            filters: [
                { name: 'рыбный', kind: 'fish' },
                { name: 'мясной', kind: 'meat' },
                { name: 'вегетарианский', kind: 'veg' }
            ]
        },
        'main': { 
            element: document.querySelector('#main-section .dishes-grid'), 
            title: 'Главные блюда',
            filters: [
                { name: 'рыбное', kind: 'fish' },
                { name: 'мясное', kind: 'meat' },
                { name: 'вегетарианское', kind: 'veg' }
            ]
        },
        'drink': { 
            element: document.querySelector('#drink-section .dishes-grid'), 
            title: 'Напитки',
            filters: [
                { name: 'холодный', kind: 'cold' },
                { name: 'горячий', kind: 'hot' }
            ]
        },
        'salad': { 
            element: document.querySelector('#salad-section .dishes-grid'), 
            title: 'Салаты и стартеры',
            filters: [
                { name: 'рыбный', kind: 'fish' },
                { name: 'мясной', kind: 'meat' },
                { name: 'вегетарианский', kind: 'veg' }
            ]
        },
        'dessert': { 
            element: document.querySelector('#dessert-section .dishes-grid'), 
            title: 'Десерты',
            filters: [
                { name: 'маленькая порция', kind: 'small' },
                { name: 'средняя порция', kind: 'medium' },
                { name: 'большая порция', kind: 'large' }
            ]
        }
    };
}

function createFilters() {
    Object.entries(categories).forEach(([categoryKey, category]) => {
        const section = document.getElementById(`${categoryKey}-section`);
        if (!section) {
            console.error(`Section not found: ${categoryKey}-section`);
            return;
        }
        
        const filtersContainer = section.querySelector('.filters');
        if (!filtersContainer) {
            console.error(`Filters container not found in ${categoryKey}-section`);
            return;
        }
        
        filtersContainer.innerHTML = '';
        
        category.filters.forEach(filter => {
            const filterBtn = document.createElement('button');
            filterBtn.className = 'filter-btn';
            filterBtn.setAttribute('data-kind', filter.kind);
            filterBtn.setAttribute('data-category', categoryKey);
            filterBtn.textContent = filter.name;
            filtersContainer.appendChild(filterBtn);
        });
    });
}

function setupFilterHandlers() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('filter-btn')) {
            const filterBtn = e.target;
            const filterKind = filterBtn.getAttribute('data-kind');
            const categoryKey = filterBtn.getAttribute('data-category');
            
            if (!categoryKey) return;
            
            const section = document.getElementById(`${categoryKey}-section`);
            const allFiltersInSection = section.querySelectorAll('.filter-btn');
            
            const isCurrentlyActive = filterBtn.classList.contains('active');
            
            allFiltersInSection.forEach(btn => btn.classList.remove('active'));
            
            if (isCurrentlyActive) {
                activeFilters[categoryKey] = null;
                filterDishes(categoryKey, null);
            } else {
                filterBtn.classList.add('active');
                activeFilters[categoryKey] = filterKind;
                filterDishes(categoryKey, filterKind);
            }
        }
    });
}

function displayAllDishes() {
    console.log('Displaying all dishes...', window.dishes.length);
    
    if (window.dishes.length === 0) {
        console.log('Нет блюд для отображения');
        Object.entries(categories).forEach(([categoryKey, category]) => {
            if (category.element) {
                category.element.innerHTML = '<p class="no-dishes">Загрузка меню...</p>';
            }
        });
        return;
    }
    
    const sortedDishes = [...window.dishes].sort((a, b) => a.name.localeCompare(b.name));

    Object.entries(categories).forEach(([categoryKey, category]) => {
        if (!category.element) {
            console.error(`Category element not found for: ${categoryKey}`);
            return;
        }
        
        console.log(`Processing category: ${categoryKey}, dishes:`, window.dishes.filter(d => d.category === categoryKey).length);
        
        category.element.innerHTML = '';
        
        const categoryDishes = sortedDishes.filter(dish => dish.category === categoryKey);
        
        if (categoryDishes.length === 0) {
            category.element.innerHTML = '<p class="no-dishes">Нет доступных блюд</p>';
            return;
        }
        
        categoryDishes.forEach(dish => {
            const dishCard = createDishCard(dish);
            category.element.appendChild(dishCard);
        });
    });
}

function filterDishes(categoryKey, filterKind = null) {
    console.log(`Filtering ${categoryKey} by:`, filterKind);
    
    if (!categories[categoryKey] || !categories[categoryKey].element) {
        console.error(`Category not found: ${categoryKey}`);
        return;
    }
    
    const sortedDishes = [...window.dishes].sort((a, b) => a.name.localeCompare(b.name));
    const categoryElement = categories[categoryKey].element;
    
    categoryElement.innerHTML = '';
    
    let filteredDishes;
    if (filterKind) {
        filteredDishes = sortedDishes.filter(dish => 
            dish.category === categoryKey && dish.kind === filterKind
        );
    } else {
        filteredDishes = sortedDishes.filter(dish => dish.category === categoryKey);
    }
    
    console.log(`Filtered dishes for ${categoryKey}:`, filteredDishes.length);
    
    if (filteredDishes.length === 0) {
        categoryElement.innerHTML = '<p class="no-dishes">Нет доступных блюд</p>';
        return;
    }
    
    filteredDishes.forEach(dish => {
        const dishCard = createDishCard(dish);
        categoryElement.appendChild(dishCard);
    });
}

function createDishCard(dish) {
    const card = document.createElement('div');
    card.className = 'dish-card';
    card.setAttribute('data-dish', dish.keyword);
    card.setAttribute('data-category', dish.category);

    const imagePath = dish.image || 'img/placeholder.jpg';
    
    // Проверяем, выбрано ли это блюдо в текущем заказе
    const isSelected = window.orderState && window.orderState[dish.category] && 
                      window.orderState[dish.category].keyword === dish.keyword;
    
    card.innerHTML = `
        <img src="${imagePath}" alt="${dish.name}" onerror="this.style.display='none'">
        <p class="dish-name">${dish.name}</p>
        <p class="dish-weight">${dish.count}</p>
        <p class="dish-price">${dish.price} ₽</p>
        <button class="add-btn ${isSelected ? 'selected' : ''}">
            ${isSelected ? 'Убрать' : 'Добавить'}
        </button>
    `;

    return card;
}

window.displayAllDishes = displayAllDishes;
window.filterDishes = filterDishes;
window.categories = categories;


function initializeComboSelection() {
    const comboItems = document.querySelectorAll('.combo-item');
    
    comboItems.forEach(comboItem => {
        comboItem.addEventListener('click', function() {
            comboItems.forEach(item => {
                item.classList.remove('selected');
            });
            
            this.classList.add('selected');
            
            const comboType = determineComboType(this);
            fillOrderWithCombo(comboType);
        });
    });
}

function determineComboType(comboItem) {
    const dishes = comboItem.querySelectorAll('.combo-dish');
    const dishTypes = Array.from(dishes).map(dish => {
        const text = dish.querySelector('span').textContent.toLowerCase();
        if (text.includes('суп')) return 'soup';
        if (text.includes('главное') || text.includes('блюдо')) return 'main';
        if (text.includes('салат') || text.includes('стартер')) return 'salad';
        if (text.includes('напиток')) return 'drink';
        if (text.includes('десерт')) return 'dessert';
        return null;
    }).filter(Boolean);
    
    return dishTypes;
}

function fillOrderWithCombo(comboTypes) {
    console.log('Заполняем заказ комбо:', comboTypes);
    
    clearCurrentOrder();
    
    comboTypes.forEach(category => {
        const randomDish = getRandomDishFromCategory(category);
        if (randomDish) {
            console.log(`Выбрано случайное блюдо для ${category}:`, randomDish.name);
            addDishToOrder(randomDish.keyword);
        } else {
            console.warn(`Не найдены блюда для категории: ${category}`);
        }
    });
    
    updateOrderDisplay();
}

function getRandomDishFromCategory(category) {
    const categoryDishes = window.dishes.filter(dish => dish.category === category);
    if (categoryDishes.length === 0) {
        console.warn(`Нет блюд в категории: ${category}`);
        return null;
    }
    
    const randomIndex = Math.floor(Math.random() * categoryDishes.length);
    return categoryDishes[randomIndex];
}

function clearCurrentOrder() {
    console.log('Очищаем текущий заказ');
    
    const selectedCards = document.querySelectorAll('.dish-card.selected');
    selectedCards.forEach(card => {
        card.classList.remove('selected');
        const addBtn = card.querySelector('.add-btn');
        if (addBtn) {
            addBtn.textContent = 'Добавить';
        }
    });
    
    if (window.orderState) {
        Object.keys(window.orderState).forEach(key => {
            window.orderState[key] = null;
        });
    }
}

function addDishToOrder(dishKeyword) {
    const dish = dishes.find(d => d.keyword === dishKeyword);
    if (!dish) {
        console.error(`Блюдо не найдено: ${dishKeyword}`);
        return;
    }

    console.log(`Добавляем блюдо в заказ: ${dish.name}`);

    const categoryCards = document.querySelectorAll(`.dish-card[data-category="${dish.category}"]`);
    categoryCards.forEach(card => {
        card.classList.remove('selected');
        const addBtn = card.querySelector('.add-btn');
        if (addBtn) {
            addBtn.textContent = 'Добавить';
        }
    });

    if (window.orderState) {
        window.orderState[dish.category] = dish;
    }
}

function updateOrderDisplay() {
    console.log('Обновляем отображение заказа');
    
    if (typeof updateOrderSummary === 'function') {
        updateOrderSummary();
    } else {
        console.error('Функция updateOrderSummary не найдена!');
        updateOrderManually();
    }
}

function updateOrderManually() {
    const orderContainer = document.querySelector('.order-summary');
    let hasSelectedItems = false;
    let totalPrice = 0;

    const categoryMap = {
        soup: { 
            element: document.getElementById('soup-display'), 
            label: 'Суп',
            hiddenField: document.getElementById('selected-soup')
        },
        main: { 
            element: document.getElementById('main-display'), 
            label: 'Главное блюдо',
            hiddenField: document.getElementById('selected-main')
        },
        salad: { 
            element: document.getElementById('salad-display'), 
            label: 'Салат или стартер',
            hiddenField: document.getElementById('selected-salad')
        },
        drink: { 
            element: document.getElementById('drink-display'), 
            label: 'Напиток',
            hiddenField: document.getElementById('selected-drink')
        },
        dessert: { 
            element: document.getElementById('dessert-display'), 
            label: 'Десерт',
            hiddenField: document.getElementById('selected-dessert')
        }
    };

    Object.entries(categoryMap).forEach(([category, info]) => {
        const dish = window.orderState ? window.orderState[category] : null;
        if (dish) {
            info.element.innerHTML = `<strong>${info.label}</strong><br>${dish.name} ${dish.price}Р`;
            info.element.style.display = 'block';
            info.hiddenField.value = dish.keyword;
            totalPrice += dish.price;
            hasSelectedItems = true;
        } else {
            info.element.innerHTML = `<strong>${info.label}</strong><br>${info.label === 'Напиток' ? 'Напиток не выбран' : 'Блюдо не выбрано'}`;
            info.element.style.display = 'block';
            info.hiddenField.value = '';
        }
    });

    const costElement = document.getElementById('order-cost');
    if (hasSelectedItems) {
        costElement.innerHTML = `<strong>Стоимость заказа</strong><br>${totalPrice}Р`;
        costElement.style.display = 'block';
    } else {
        costElement.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initializeCategories();
    createFilters();
    displayAllDishes();
    setupFilterHandlers();
    initializeComboSelection();
    
    if (!window.orderState) {
        window.orderState = {
            soup: null,
            main: null,
            salad: null,
            drink: null,
            dessert: null
        };
    }
});

function initializeStickyPanel() {
    const existingPanel = document.getElementById('sticky-order-panel');
    if (!existingPanel) {
        const stickyPanel = document.createElement('div');
        stickyPanel.id = 'sticky-order-panel';
        stickyPanel.className = 'sticky-order-panel';
        stickyPanel.innerHTML = `
            <div class="sticky-panel-content">
                <div class="order-total">
                    <span class="order-total-price">0Р</span>
                </div>
                <a href="checkout.html" class="checkout-link">Перейти к оформлению</a>
            </div>
        `;
        document.body.appendChild(stickyPanel);
    }
    
    updateStickyPanel();
}

function updateStickyPanel() {
    const stickyPanel = document.getElementById('sticky-order-panel');
    if (!stickyPanel) return;

    const totalPrice = calculateTotalPrice();
    const priceElement = stickyPanel.querySelector('.order-total-price');
    const checkoutLink = stickyPanel.querySelector('.checkout-link');

    if (priceElement) {
        priceElement.textContent = `${totalPrice}Р`;
    }

    if (checkoutLink) {
        const isValidCombo = validateCurrentOrder();
        checkoutLink.style.pointerEvents = isValidCombo ? 'auto' : 'none';
        checkoutLink.style.opacity = isValidCombo ? '1' : '0.5';
    }

    stickyPanel.style.display = totalPrice > 0 ? 'block' : 'none';
}

function calculateTotalPrice() {
    if (!window.orderState) return 0;
    return Object.values(window.orderState).reduce((total, dish) => {
        return total + (dish ? dish.price : 0);
    }, 0);
}

function validateCurrentOrder() {
    if (!window.orderState) return false;
    
    const selectedDishes = {
        soup: !!window.orderState.soup,
        main: !!window.orderState.main,
        salad: !!window.orderState.salad,
        drink: !!window.orderState.drink,
        dessert: !!window.orderState.dessert
    };

    const validCombinations = [
        { soup: true, main: true, salad: true, drink: true },
        { soup: true, main: true, salad: false, drink: true },
        { soup: true, main: false, salad: true, drink: true },
        { soup: false, main: true, salad: true, drink: true },
        { soup: false, main: true, salad: false, drink: true }
    ];

    return validCombinations.some(combo => 
        combo.soup === selectedDishes.soup &&
        combo.main === selectedDishes.main &&
        combo.salad === selectedDishes.salad &&
        combo.drink === selectedDishes.drink
    );
}

// Обновляем инициализацию в DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    initializeCategories();
    createFilters();
    displayAllDishes();
    setupFilterHandlers();
    initializeComboSelection();
    initializeStickyPanel();
    
    if (!window.orderState) {
        window.orderState = {
            soup: null,
            main: null,
            salad: null,
            drink: null,
            dessert: null
        };
    }
});

// Функция для инициализации заказа при загрузке страницы
function initializeOrderOnLoad() {
    console.log('Initializing order on page load...');
    
    if (!window.orderState) {
        window.orderState = {
            soup: null,
            main: null,
            salad: null,
            drink: null,
            dessert: null
        };
    }

    // Ждем загрузки блюд и затем восстанавливаем заказ
    const checkDishesLoaded = setInterval(() => {
        if (window.dishes && window.dishes.length > 0) {
            clearInterval(checkDishesLoaded);
            console.log('Dishes loaded, restoring order...');
            
            const savedOrder = OrderStorage.getOrderWithDishes(window.dishes);
            
            // Восстанавливаем визуальное состояние
            Object.entries(savedOrder).forEach(([category, dish]) => {
                if (dish) {
                    const dishCard = document.querySelector(`.dish-card[data-dish="${dish.keyword}"]`);
                    if (dishCard) {
                        dishCard.classList.add('selected');
                        const addBtn = dishCard.querySelector('.add-btn');
                        if (addBtn) {
                            addBtn.textContent = 'Убрать';
                        }
                    }
                    window.orderState[category] = dish;
                }
            });
            
            // Обновляем интерфейс
            if (typeof updateOrderSummary === 'function') {
                updateOrderSummary();
            }
            if (typeof updateStickyPanel === 'function') {
                updateStickyPanel();
            }
            
            console.log('Order restored:', window.orderState);
        }
    }, 100);
}

// Обновляем обработчик DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing menu...');
    
    initializeCategories();
    createFilters();
    
    // Сначала инициализируем заказ
    initializeOrderOnLoad();
    
    // Затем отображаем блюда
    if (window.dishes && window.dishes.length > 0) {
        displayAllDishes();
    } else {
        // Если блюда еще не загружены, ждем их
        const checkDishes = setInterval(() => {
            if (window.dishes && window.dishes.length > 0) {
                clearInterval(checkDishes);
                displayAllDishes();
            }
        }, 100);
    }
    
    setupFilterHandlers();
    initializeComboSelection();
});