document.addEventListener('DOMContentLoaded', function() {
    if (!window.orderState) {
        window.orderState = {
            soup: null,
            main: null,
            salad: null,
            drink: null,
            dessert: null
        };
    }

    // Инициализируем sticky панель
    initializeStickyPanel();
    
    // Загружаем заказ из localStorage после загрузки блюд
    if (window.dishes && window.dishes.length > 0) {
        loadOrderFromStorage();
    } else {
        // Если блюда еще не загружены, ждем их загрузки
        const checkDishesLoaded = setInterval(() => {
            if (window.dishes && window.dishes.length > 0) {
                clearInterval(checkDishesLoaded);
                loadOrderFromStorage();
            }
        }, 100);
    }

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-btn')) {
            const dishCard = e.target.closest('.dish-card');
            const dishKeyword = dishCard.getAttribute('data-dish');
            toggleDishInOrder(dishKeyword);
        }
    });

    function loadOrderFromStorage() {
        console.log('Loading order from storage...');
        const savedOrder = OrderStorage.getOrderWithDishes(window.dishes);
        
        Object.keys(savedOrder).forEach(category => {
            if (savedOrder[category]) {
                console.log(`Loading ${category}:`, savedOrder[category].name);
                addDishToOrder(savedOrder[category].keyword, false);
            }
        });
        
        updateOrderSummary();
        updateStickyPanel();
    }

    function toggleDishInOrder(dishKeyword) {
        const dish = window.dishes.find(d => d.keyword === dishKeyword);
        if (!dish) {
            console.error('Dish not found:', dishKeyword);
            return;
        }

        const currentCategory = dish.category;
        const currentlySelected = window.orderState[currentCategory];
        
        const isCurrentlySelected = currentlySelected && currentlySelected.keyword === dishKeyword;

        if (isCurrentlySelected) {
            removeDishFromOrder(dishKeyword);
        } else {
            addDishToOrder(dishKeyword);
        }
    }

    function addDishToOrder(dishKeyword, saveToStorage = true) {
        const dish = window.dishes.find(d => d.keyword === dishKeyword);
        if (!dish) return;

        console.log(`Adding dish to order: ${dish.name}`);

        // Снимаем выделение с других блюд этой категории
        const categoryCards = document.querySelectorAll(`.dish-card[data-category="${dish.category}"]`);
        categoryCards.forEach(card => {
            card.classList.remove('selected');
            const addBtn = card.querySelector('.add-btn');
            if (addBtn) {
                addBtn.textContent = 'Добавить';
                addBtn.classList.remove('selected');
            }
        });

        // Выделяем выбранное блюдо
        const selectedCard = document.querySelector(`.dish-card[data-dish="${dishKeyword}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            const addBtn = selectedCard.querySelector('.add-btn');
            if (addBtn) {
                addBtn.textContent = 'Убрать';
                addBtn.classList.add('selected');
            }
        }

        // Обновляем состояние заказа
        window.orderState[dish.category] = dish;
        
        // Сохраняем в localStorage
        if (saveToStorage) {
            OrderStorage.saveOrder(window.orderState);
        }
        
        // Обновляем интерфейс
        updateOrderSummary();
        updateStickyPanel();
    }

    function removeDishFromOrder(dishKeyword) {
        const dish = window.dishes.find(d => d.keyword === dishKeyword);
        if (!dish) return;

        console.log(`Removing dish from order: ${dish.name}`);

        // Снимаем выделение
        const selectedCard = document.querySelector(`.dish-card[data-dish="${dishKeyword}"]`);
        if (selectedCard) {
            selectedCard.classList.remove('selected');
            const addBtn = selectedCard.querySelector('.add-btn');
            if (addBtn) {
                addBtn.textContent = 'Добавить';
                addBtn.classList.remove('selected');
            }
        }

        // Обновляем состояние заказа
        window.orderState[dish.category] = null;
        
        // Сохраняем в localStorage
        OrderStorage.saveOrder(window.orderState);
        
        // Обновляем интерфейс
        updateOrderSummary();
        updateStickyPanel();
    }

    function updateOrderSummary() {
        const orderContainer = document.querySelector('.order-summary');
        if (!orderContainer) return;

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
            const dish = window.orderState[category];
            if (dish && info.element) {
                info.element.innerHTML = `<strong>${info.label}</strong><br>${dish.name} ${dish.price}Р`;
                info.element.style.display = 'block';
                if (info.hiddenField) {
                    info.hiddenField.value = dish.keyword;
                }
                totalPrice += dish.price;
                hasSelectedItems = true;
            } else if (info.element) {
                info.element.innerHTML = `<strong>${info.label}</strong><br>${info.label === 'Напиток' ? 'Напиток не выбран' : 'Блюдо не выбрано'}`;
                info.element.style.display = 'block';
                if (info.hiddenField) {
                    info.hiddenField.value = '';
                }
            }
        });

        const costElement = document.getElementById('order-cost');
        if (costElement) {
            if (hasSelectedItems) {
                costElement.innerHTML = `<strong>Стоимость заказа</strong><br>${totalPrice}Р`;
                costElement.style.display = 'block';
            } else {
                costElement.style.display = 'none';
            }
        }
    }

    function initializeStickyPanel() {
        // Проверяем, есть ли уже sticky панель
        let stickyPanel = document.getElementById('sticky-order-panel');
        if (!stickyPanel) {
            stickyPanel = document.createElement('div');
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
    }

    function updateStickyPanel() {
        const stickyPanel = document.getElementById('sticky-order-panel');
        if (!stickyPanel) {
            console.error('Sticky panel not found');
            return;
        }

        const totalPrice = calculateTotalPrice();
        const priceElement = stickyPanel.querySelector('.order-total-price');
        const checkoutLink = stickyPanel.querySelector('.checkout-link');

        console.log('Updating sticky panel, total price:', totalPrice);
        console.log('Current order state:', window.orderState);

        if (priceElement) {
            priceElement.textContent = `${totalPrice}Р`;
        }

        if (checkoutLink) {
            const isValidCombo = validateCurrentOrder();
            console.log('Is valid combo for checkout:', isValidCombo);
            
            if (isValidCombo) {
                checkoutLink.style.pointerEvents = 'auto';
                checkoutLink.style.opacity = '1';
                checkoutLink.style.cursor = 'pointer';
                checkoutLink.removeAttribute('disabled');
            } else {
                checkoutLink.style.pointerEvents = 'none';
                checkoutLink.style.opacity = '0.5';
                checkoutLink.style.cursor = 'not-allowed';
                checkoutLink.setAttribute('disabled', 'disabled');
            }
        }

        // Показываем панель только если есть выбранные блюда
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
            drink: !!window.orderState.drink
        };

        console.log('Validating order:', selectedDishes);

        const validCombinations = [
            { soup: true, main: true, salad: true, drink: true },      // Полный комплект
            { soup: true, main: true, salad: false, drink: true },     // Суп + главное + напиток
            { soup: true, main: false, salad: true, drink: true },     // Суп + салат + напиток
            { soup: false, main: true, salad: true, drink: true },     // Главное + салат + напиток
            { soup: false, main: true, salad: false, drink: true }     // Главное + напиток
        ];

        const isValid = validCombinations.some(combo => 
            combo.soup === selectedDishes.soup &&
            combo.main === selectedDishes.main &&
            combo.salad === selectedDishes.salad &&
            combo.drink === selectedDishes.drink
        );

        console.log('Validation result:', isValid);
        return isValid;
    }

    // Делаем функции доступными глобально
    window.updateStickyPanel = updateStickyPanel;
    window.validateCurrentOrder = validateCurrentOrder;
});

// Функция для обновления заказа из других скриптов
window.updateOrderFromStorage = function() {
    if (window.dishes && window.dishes.length > 0) {
        const savedOrder = OrderStorage.getOrderWithDishes(window.dishes);
        Object.keys(savedOrder).forEach(category => {
            if (savedOrder[category]) {
                const dishCard = document.querySelector(`.dish-card[data-dish="${savedOrder[category].keyword}"]`);

                window.orderState[category] = savedOrder[category];
            }
        });
        
        if (typeof updateOrderSummary === 'function') {
            updateOrderSummary();
        }
        if (typeof updateStickyPanel === 'function') {
            updateStickyPanel();
        }
    }
};