const API_URL = 'https://edu.std-900.ist.mospolytech.ru/';

// Функция для получения API ключа из localStorage
function getApiKey() {
    return localStorage.getItem('lunchProApiKey');
}

async function loadDishes() {
    try {
        console.log('Загрузка данных с сервера...');
        
        const apiKey = getApiKey();
        if (!apiKey) {
            throw new Error('API ключ не найден. Пожалуйста, настройте API ключ.');
        }
        
        // ИСПРАВЛЕННЫЙ URL - используем /labs/api/dishes
        const response = await fetch(`${API_URL}/labs/api/dishes?api_key=${apiKey}`);
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Неверный API ключ. Пожалуйста, проверьте ваш ключ.');
            }
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Данные успешно загружены:', data);
        
        const formattedDishes = formatDishesData(data);
        
        window.dishes = formattedDishes;
        
        if (typeof displayAllDishes === 'function') {
            displayAllDishes();
        }
        
        return formattedDishes;
        
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        showErrorMessage('Не удалось загрузить меню. ' + error.message);
        return [];
    }
}

function formatDishesData(apiData) {
    return apiData.map(dish => {
        let category;
        switch(dish.category) {
            case 'soup':
                category = 'soup';
                break;
            case 'main-course':
                category = 'main';
                break;
            case 'salad':
                category = 'salad';
                break;
            case 'drink':
                category = 'drink';
                break;
            case 'dessert':
                category = 'dessert';
                break;
            default:
                category = dish.category;
        }
        
        let kind = dish.kind;
        
        return {
            category: category,
            count: dish.count,
            image: dish.image,
            keyword: dish.keyword,
            kind: kind,
            name: dish.name,
            price: dish.price
        };
    });
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        background: #ffebee;
        color: #c62828;
        padding: 15px;
        margin: 10px 0;
        border: 1px solid #ffcdd2;
        border-radius: 4px;
        text-align: center;
    `;
    errorDiv.textContent = message;
    
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.insertBefore(errorDiv, mainContent.firstChild);
    }
}

function initializeMenu() {
    console.log('Инициализация меню...');
    
    if (!window.dishes) {
        window.dishes = [];
    }
    
    loadDishes().then(dishes => {
        console.log('Меню успешно инициализировано:', dishes.length, 'блюд загружено');
        
        if (typeof initializeCategories === 'function' && 
            typeof createFilters === 'function' && 
            typeof displayAllDishes === 'function' &&
            typeof setupFilterHandlers === 'function') {
            
            initializeCategories();
            createFilters();
            displayAllDishes();
            setupFilterHandlers();
            
            if (typeof initializeComboSelection === 'function') {
                initializeComboSelection();
            }
        }
    }).catch(error => {
        console.error('Ошибка при инициализации меню:', error);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, начинаем инициализацию меню...');
    initializeMenu();
});

window.loadDishes = loadDishes;
window.initializeMenu = initializeMenu;

// Функции для работы с заказами (добавить в конец файла api.js)

// Получение всех заказов пользователя
async function getOrders() {
    try {
        const apiKey = getApiKey();
        if (!apiKey) {
            throw new Error('API ключ не найден');
        }
        
        const response = await fetch(`${API_URL}/labs/api/orders?api_key=${apiKey}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Ошибка загрузки заказов:', error);
        throw error;
    }
}

// Получение конкретного заказа
async function getOrder(orderId) {
    try {
        const apiKey = getApiKey();
        if (!apiKey) {
            throw new Error('API ключ не найден');
        }
        
        const response = await fetch(`${API_URL}/labs/api/orders/${orderId}?api_key=${apiKey}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Ошибка загрузки заказа:', error);
        throw error;
    }
}

// Обновление заказа
async function updateOrder(orderId, orderData) {
    try {
        const apiKey = getApiKey();
        if (!apiKey) {
            throw new Error('API ключ не найден');
        }
        
        const response = await fetch(`${API_URL}/labs/api/orders/${orderId}?api_key=${apiKey}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Ошибка обновления заказа:', error);
        throw error;
    }
}

// Удаление заказа
async function deleteOrder(orderId) {
    try {
        const apiKey = getApiKey();
        if (!apiKey) {
            throw new Error('API ключ не найден');
        }
        
        const response = await fetch(`${API_URL}/labs/api/orders/${orderId}?api_key=${apiKey}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Ошибка удаления заказа:', error);
        throw error;
    }
}