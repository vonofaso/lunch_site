document.addEventListener('DOMContentLoaded', function() {
    let currentOrder = {};
    let allDishes = [];
    const API_URL = 'https://edu.std-900.ist.mospolytech.ru';

    initializeCheckoutPage();

    async function initializeCheckoutPage() {
        // Проверяем наличие API ключа
        const apiKey = localStorage.getItem('lunchProApiKey');
        if (!apiKey) {
            alert('API ключ не найден. Пожалуйста, сначала настройте API ключ на странице "Собрать ланч".');
            return;
        }

        await loadDishes();
        loadOrderItems();
        setupEventListeners();
        updateOrderDisplay();
        validateForm();
    }

    async function loadDishes() {
        if (window.dishes && window.dishes.length > 0) {
            allDishes = window.dishes;
        } else {
            try {
                allDishes = await window.loadDishes();
            } catch (error) {
                console.error('Error loading dishes:', error);
                allDishes = [];
            }
        }
    }

    function loadOrderItems() {
        currentOrder = OrderStorage.getOrderWithDishes(allDishes);
        displayOrderItems();
    }

    function displayOrderItems() {
        const container = document.getElementById('order-items-container');
        if (!container) return;

        const hasItems = Object.values(currentOrder).some(dish => dish !== null);

        if (!hasItems) {
            container.innerHTML = `
                <div class="empty-order-message">
                    Ничего не выбрано. Чтобы добавить блюда в заказ, перейдите на страницу 
                    <a href="lunch.html">Собрать ланч</a>.
                </div>
            `;
            return;
        }

        let itemsHTML = '';
        Object.entries(currentOrder).forEach(([category, dish]) => {
            if (dish) {
                itemsHTML += `
                    <div class="checkout-dish-card" data-category="${category}" data-dish="${dish.keyword}">
                        <div class="dish-info">
                            <span class="dish-price">${dish.price}Р</span>
                            <p class="dish-name">${dish.name}</p>
                            <p class="dish-weight">${dish.count}</p>
                        </div>
                        <button type="button" class="remove-btn" onclick="removeDishFromCheckout('${category}')">Удалить</button>
                    </div>
                `;
            }
        });

        container.innerHTML = itemsHTML;
    }

    function setupEventListeners() {
        const resetBtn = document.getElementById('reset-order');
        const checkoutForm = document.getElementById('checkout-form');

        if (resetBtn) {
            resetBtn.addEventListener('click', resetOrder);
        }

        if (checkoutForm) {
            checkoutForm.addEventListener('submit', submitOrder);
        }

        // Обработчик для показа/скрытия поля времени доставки
        const deliveryTimeRadios = document.querySelectorAll('input[name="delivery_time"]');
        const specificTimeInput = document.querySelector('.time-input');
        
        deliveryTimeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (specificTimeInput) {
                    specificTimeInput.style.display = this.value === 'specific' ? 'block' : 'none';
                    // При изменении типа доставки перепроверяем форму
                    validateForm();
                }
            });
        });

        // Валидация формы при изменении любых полей
        const formInputs = document.querySelectorAll('#name, #email, #phone, #address, #specific_time');
        formInputs.forEach(input => {
            input.addEventListener('input', validateForm);
        });

        // Также валидируем при изменении чекбоксов и радио-кнопок
        const checkboxes = document.querySelectorAll('input[type="checkbox"], input[type="radio"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', validateForm);
        });
    }

    function validateForm() {
        const submitBtn = document.querySelector('.submit-order-btn');
        if (!submitBtn) return;

        const isOrderValid = validateOrderForSubmission(currentOrder).isValid;
        const areRequiredFieldsFilled = checkRequiredFields();
        const isDeliveryTimeValid = validateDeliveryTime();
        
        console.log('Validation results:', {
            isOrderValid,
            areRequiredFieldsFilled,
            isDeliveryTimeValid
        });
        
        const isFormValid = isOrderValid && areRequiredFieldsFilled && isDeliveryTimeValid;
        
        submitBtn.disabled = !isFormValid;
        
        // Визуальная обратная связь
        if (isFormValid) {
            submitBtn.style.backgroundColor = 'tomato';
            submitBtn.style.cursor = 'pointer';
        } else {
            submitBtn.style.backgroundColor = '#ccc';
            submitBtn.style.cursor = 'not-allowed';
        }
    }

    function checkRequiredFields() {
        const requiredFields = ['name', 'email', 'phone', 'address'];
        const allFilled = requiredFields.every(fieldId => {
            const field = document.getElementById(fieldId);
            const value = field ? field.value.trim() : '';
            console.log(`Field ${fieldId}:`, value);
            return value !== '';
        });
        
        console.log('All required fields filled:', allFilled);
        return allFilled;
    }

    function validateDeliveryTime() {
        const specificTimeRadio = document.querySelector('input[name="delivery_time"][value="specific"]');
        const specificTimeInput = document.getElementById('specific_time');
        
        // Если выбран "ко времени", проверяем что время указано
        if (specificTimeRadio && specificTimeRadio.checked) {
            if (!specificTimeInput || !specificTimeInput.value.trim()) {
                console.log('Delivery time validation: specific time required but not provided');
                return false;
            }
            
            // Проверяем формат времени
            const timeValue = specificTimeInput.value.trim();
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(timeValue)) {
                console.log('Delivery time validation: invalid time format');
                return false;
            }
            
            // Проверяем доступное время доставки
            const [hours, minutes] = timeValue.split(':').map(Number);
            if (hours < 7 || hours > 23 || (hours === 23 && minutes > 0)) {
                console.log('Delivery time validation: time outside available range');
                return false;
            }
        }
        
        console.log('Delivery time validation: passed');
        return true;
    }

    function updateOrderDisplay() {
        const categoryMap = {
            soup: { 
                element: document.getElementById('soup-display'),
                label: 'Суп'
            },
            main: { 
                element: document.getElementById('main-display'),
                label: 'Главное блюдо'
            },
            salad: { 
                element: document.getElementById('salad-display'),
                label: 'Салат или стартер'
            },
            drink: { 
                element: document.getElementById('drink-display'),
                label: 'Напиток'
            },
            dessert: { 
                element: document.getElementById('dessert-display'),
                label: 'Десерт'
            }
        };

        let totalPrice = 0;

        Object.entries(categoryMap).forEach(([category, info]) => {
            const dish = currentOrder[category];
            const element = info.element;
            
            if (element) {
                if (dish) {
                    element.innerHTML = `<strong>${info.label}</strong><br>${dish.name} ${dish.price}Р`;
                    totalPrice += dish.price;
                } else {
                    element.innerHTML = `<strong>${info.label}</strong><br>${category === 'drink' ? 'Не выбран' : 'Не выбрано'}`;
                }
            }
        });

        const costElement = document.getElementById('order-cost');
        if (costElement) {
            costElement.innerHTML = `<strong>Стоимость заказа</strong><br>${totalPrice}Р`;
        }

        // Обновляем скрытые поля
        const hiddenFields = ['soup', 'main', 'salad', 'drink', 'dessert'];
        hiddenFields.forEach(field => {
            const hiddenField = document.getElementById(`selected-${field}`);
            if (hiddenField) {
                hiddenField.value = currentOrder[field] ? currentOrder[field].keyword : '';
            }
        });

        // После обновления заказа перепроверяем форму
        validateForm();
    }

    function resetOrder() {
        if (confirm('Вы уверены, что хотите сбросить заказ?')) {
            OrderStorage.clearOrder();
            currentOrder = {
                soup: null,
                main: null,
                salad: null,
                drink: null,
                dessert: null
            };
            displayOrderItems();
            updateOrderDisplay();
            validateForm();
        }
    }

    async function submitOrder(event) {
        event.preventDefault();
        
        console.log('Starting order submission to API...');
        
        // Проверяем валидность заказа
        const orderValidation = validateOrderForSubmission(currentOrder);
        if (!orderValidation.isValid) {
            alert(orderValidation.message);
            return;
        }

        // Получаем API ключ из localStorage
        const API_KEY = localStorage.getItem('lunchProApiKey');
        
        if (!API_KEY) {
            alert('API ключ не найден. Пожалуйста, настройте API ключ на странице "Собрать ланч".');
            return;
        }

        // Собираем данные формы
        const formData = new FormData(event.target);
        
        // Формируем данные для отправки в формате JSON согласно API
        const orderData = {
            full_name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            delivery_address: formData.get('address'),
            subscribe: formData.get('promotions') === 'on' ? 1 : 0,
            comment: formData.get('comments') || ''
        };

        // Обрабатываем время доставки
        const deliveryTime = formData.get('delivery_time');
        if (deliveryTime === 'specific') {
            orderData.delivery_type = 'by_time';
            const specificTime = formData.get('specific_time');
            if (specificTime) {
                // Преобразуем время в формат HHMM (без двоеточия)
                orderData.delivery_time = formatTimeForAPI(specificTime);
            }
        } else {
            orderData.delivery_type = 'now';
        }

        // Добавляем ID блюд, если они выбраны
        if (currentOrder.soup) {
            orderData.soup_id = getDishIdFromKeyword(currentOrder.soup.keyword);
        }
        if (currentOrder.main) {
            orderData.main_course_id = getDishIdFromKeyword(currentOrder.main.keyword);
        }
        if (currentOrder.salad) {
            orderData.salad_id = getDishIdFromKeyword(currentOrder.salad.keyword);
        }
        if (currentOrder.drink) {
            orderData.drink_id = getDishIdFromKeyword(currentOrder.drink.keyword);
        }
        if (currentOrder.dessert) {
            orderData.dessert_id = getDishIdFromKeyword(currentOrder.dessert.keyword);
        }

        console.log('Order data to submit:', orderData);
        console.log('API Key:', API_KEY);

        try {
            // Показываем индикатор загрузки
            showLoadingIndicator(true);

            // ИСПРАВЛЕННЫЙ URL - используем /labs/api/orders вместо /api/orders
            const url = `https://edu.std-900.ist.mospolytech.ru/labs/api/orders?api_key=${encodeURIComponent(API_KEY)}`;
            console.log('Sending POST request to:', url);

            // Отправляем заказ на сервер API
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                const result = await response.json();
                console.log('Order submitted successfully to API. Response:', result);
                
                // Успешная отправка - очищаем localStorage
                OrderStorage.clearOrder();
                
                // Показываем уведомление об успехе
                showSuccessNotification('✅ Заказ успешно оформлен! Номер вашего заказа: ' + (result.id || 'получен'));
                
                // Очищаем форму и перенаправляем через 3 секунды
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3000);
            } else {
                const errorText = await response.text();
                let errorMessage = `HTTP error ${response.status}`;
                
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || errorData.message || errorText;
                } catch (e) {
                    errorMessage = errorText || `HTTP error ${response.status}`;
                }
                
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Error submitting order:', error);
            
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                showErrorNotification('❌ Ошибка сети: Не удалось соединиться с сервером. Проверьте подключение к интернету.');
            } else if (error.message.includes('401') || error.message.includes('авторизац') || error.message.includes('API Key')) {
                showErrorNotification('❌ Ошибка авторизации: Неверный API ключ.');
            } else {
                showErrorNotification('❌ Ошибка при оформлении заказа: ' + error.message);
            }
        } finally {
            showLoadingIndicator(false);
        }
    }

async function loadDishIdsFromAPI() {
    try {
        const API_KEY = localStorage.getItem('lunchProApiKey');
        if (!API_KEY) return null;
        
        const response = await fetch(`https://edu.std-900.ist.mospolytech.ru/labs/api/dishes?api_key=${API_KEY}`);
        if (response.ok) {
            const dishes = await response.json();
            
            // Создаем маппинг keyword -> id из реальных данных API
            const keywordToIdMap = {};
            dishes.forEach(dish => {
                if (dish.keyword && dish.id) {
                    keywordToIdMap[dish.keyword] = dish.id;
                }
            });
            
            console.log('Loaded dish IDs from API:', keywordToIdMap);
            return keywordToIdMap;
        }
    } catch (error) {
        console.error('Error loading dish IDs:', error);
    }
    return null;
}

// Обновите getDishIdFromKeyword чтобы использовать реальные ID из API
let dishIdMap = {};

async function initializeDishIds() {
    dishIdMap = await loadDishIdsFromAPI() || {};
}

// Вызовите эту функцию при загрузке страницы
initializeDishIds();

function getDishIdFromKeyword(keyword) {
    if (!keyword) return null;
    
    // Сначала пробуем получить ID из API данных
    if (dishIdMap[keyword]) {
        return dishIdMap[keyword];
    }
    
    // Если нет, используем fallback маппинг
    const fallbackMap = {
        // ... тот же маппинг что выше
    };
    
    return fallbackMap[keyword] || null;
}

    function formatTimeForAPI(timeString) {
        // Преобразуем время в формат HHMM (без двоеточия) для API
        if (timeString.includes(':')) {
            const [hours, minutes] = timeString.split(':');
            return `${hours.padStart(2, '0')}${minutes.padStart(2, '0')}`;
        }
        return timeString.replace(':', '');
    }

function validateOrderForSubmission(order) {
    const { soup, main, salad, drink, dessert } = order;
    
    console.log('Validating order:', { soup, main, salad, drink, dessert });
    
    if (!soup && !main && !salad && !drink && !dessert) {
        return {
            isValid: false,
            message: 'Ничего не выбрано. Выберите блюда для заказа'
        };
    }

    // Проверяем обязательное поле drink_id
    if (!drink) {
        return {
            isValid: false,
            message: 'Напиток является обязательным для заказа'
        };
    }

    // Проверяем что все выбранные блюда имеют валидные ID
    const selectedDishes = [soup, main, salad, drink, dessert].filter(dish => dish !== null);
    const dishesWithoutId = selectedDishes.filter(dish => !getDishIdFromKeyword(dish.keyword));
    
    if (dishesWithoutId.length > 0) {
        console.log('Dishes without valid ID:', dishesWithoutId);
        return {
            isValid: false,
            message: 'Некоторые блюда не имеют валидного идентификатора. Пожалуйста, обновите страницу и попробуйте снова.'
        };
    }

    // Валидные комбинации согласно API
    const validCombinations = [
        // Полный ланч
        { soup: true, main: true, salad: true, drink: true },
        // Суп + главное + напиток
        { soup: true, main: true, salad: false, drink: true },
        // Суп + салат + напиток  
        { soup: true, main: false, salad: true, drink: true },
        // Главное + салат + напиток
        { soup: false, main: true, salad: true, drink: true },
        // Главное + напиток (минимальное комбо)
        { soup: false, main: true, salad: false, drink: true }
    ];

    const currentCombo = {
        soup: !!soup,
        main: !!main,
        salad: !!salad,
        drink: !!drink
    };
    
    console.log('Current combo:', currentCombo);
    
    const isValidCombo = validCombinations.some(combo => 
        combo.soup === currentCombo.soup &&
        combo.main === currentCombo.main &&
        combo.salad === currentCombo.salad &&
        combo.drink === currentCombo.drink
    );

    if (!isValidCombo) {
        console.log('Invalid combo detected');
        return {
            isValid: false,
            message: 'Состав заказа должен соответствовать одному из доступных комбо:\n\n' +
                    '• Суп + Главное блюдо + Салат + Напиток\n' +
                    '• Суп + Главное блюдо + Напиток\n' + 
                    '• Суп + Салат + Напиток\n' +
                    '• Главное блюдо + Салат + Напиток\n' +
                    '• Главное блюдо + Напиток\n\n' +
                    'Десерт можно добавить к любому комбо.'
        };
    }

    return { isValid: true, message: '' };
}

    // Вспомогательные функции для уведомлений
    function showLoadingIndicator(show) {
        const submitBtn = document.querySelector('.submit-order-btn');
        if (submitBtn) {
            if (show) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Отправка...';
                submitBtn.style.backgroundColor = '#ccc';
            } else {
                submitBtn.textContent = 'Отправить заказ';
                validateForm(); // Перепроверяем состояние формы
            }
        }
    }

    function showSuccessNotification(message) {
        alert(message);
    }

    function showErrorNotification(message) {
        alert(message);
    }

    window.removeDishFromCheckout = function(category) {
        if (currentOrder[category]) {
            OrderStorage.removeDishFromOrder(category);
            currentOrder[category] = null;
            
            displayOrderItems();
            updateOrderDisplay();
            validateForm();
        }
    };
});