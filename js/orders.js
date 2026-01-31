let orders = [];
let currentOrderId = null;
let dishesMap = {};
let dishPrices = {};

// Инициализация страницы заказов
async function initializeOrders() {
    try {
        console.log('Initializing orders page...');
        
        // Проверяем наличие API ключа
        const apiKey = localStorage.getItem('lunchProApiKey');
        if (!apiKey) {
            showError('API ключ не найден. Пожалуйста, настройте API ключ.');
            return;
        }

        // Загружаем блюда для маппинга ID -> название и цены
        await loadDishesMap();
        
        // Загружаем заказы
        await loadOrders();
        
        // Настраиваем обработчики модальных окон
        setupModalHandlers();
        
    } catch (error) {
        console.error('Ошибка инициализации страницы заказов:', error);
        showError(`Ошибка загрузки заказов: ${error.message}`);
    }
}

// Загрузка блюд для маппинга ID -> название и цены
// Загрузка блюд для маппинга ID -> название и цены
// Загрузка блюд для маппинга ID -> название и цены
async function loadDishesMap() {
    try {
        const dishes = await window.loadDishes();
        dishesMap = {};
        dishPrices = {};
        
        console.log('Creating numeric ID mapping...');
        
        // Создаем маппинг числовых ID на названия и цены
        // Используем порядковые номера как числовые ID (1, 2, 3, ...)
        dishes.forEach((dish, index) => {
            const numericId = index + 1; // Числовые ID начинаются с 1
            dishesMap[numericId] = dish.name;
            dishPrices[numericId] = dish.price;
            
            console.log(`Mapped numeric ID ${numericId} -> ${dish.name} (${dish.price} ₽)`);
        });
        
        // Также сохраняем маппинг по keyword для обратной совместимости
        const keywordMap = {};
        dishes.forEach(dish => {
            if (dish.keyword) {
                keywordMap[dish.keyword] = dish.name;
            }
        });
        
        console.log('Numeric dishes map:', dishesMap);
        console.log('Numeric dish prices:', dishPrices);
        
        // Проверяем ID из заказа
        const testOrderIds = [2, 16, 23];
        testOrderIds.forEach(id => {
            console.log(`Order ID ${id}: ${dishesMap[id] || 'NOT FOUND'} - ${dishPrices[id] || 0} ₽`);
        });
        
    } catch (error) {
        console.error('Ошибка загрузки блюд:', error);
    }
}

// Загрузка заказов пользователя
async function loadOrders() {
    try {
        const API_KEY = localStorage.getItem('lunchProApiKey');
        const response = await fetch(`https://edu.std-900.ist.mospolytech.ru/labs/api/orders?api_key=${API_KEY}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const ordersData = await response.json();
        
        // Сортируем заказы по дате (сначала новые)
        orders = ordersData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        // Отладочная информация
        console.log('=== ORDER ANALYSIS ===');
        if (orders.length > 0) {
            const order = orders[0];
            console.log('Sample order analysis:', {
                soup_id: order.soup_id,
                salad_id: order.salad_id,
                drink_id: order.drink_id,
                soup_name: dishesMap[order.soup_id],
                salad_name: dishesMap[order.salad_id], 
                drink_name: dishesMap[order.drink_id]
            });
        }
        
        renderOrders();
        
    } catch (error) {
        console.error('Ошибка загрузки заказов:', error);
        throw error;
    }
}

// Получение стоимости заказа
function getOrderTotalPrice(order) {
    // Сначала пробуем найти поле с общей стоимостью
    if (order.total_price !== undefined && order.total_price !== null) {
        return order.total_price;
    }
    
    // Если общей стоимости нет, вычисляем сумму блюд
    let total = 0;
    
    if (order.soup_id && dishPrices[order.soup_id]) {
        total += dishPrices[order.soup_id];
    }
    if (order.main_course_id && dishPrices[order.main_course_id]) {
        total += dishPrices[order.main_course_id];
    }
    if (order.salad_id && dishPrices[order.salad_id]) {
        total += dishPrices[order.salad_id];
    }
    if (order.drink_id && dishPrices[order.drink_id]) {
        total += dishPrices[order.drink_id];
    }
    if (order.dessert_id && dishPrices[order.dessert_id]) {
        total += dishPrices[order.dessert_id];
    }
    
    return total;
}

// Отображение списка заказов
function renderOrders() {
    const loadingMessage = document.getElementById('loading-message');
    const emptyMessage = document.getElementById('empty-message');
    const ordersTable = document.getElementById('orders-table');
    const ordersTbody = document.getElementById('orders-tbody');
    
    loadingMessage.style.display = 'none';
    
    if (orders.length === 0) {
        emptyMessage.style.display = 'flex';
        ordersTable.style.display = 'none';
        return;
    }
    
    emptyMessage.style.display = 'none';
    ordersTable.style.display = 'table';
    ordersTbody.innerHTML = '';
    
    orders.forEach((order, index) => {
        const row = createOrderRow(order, index + 1);
        ordersTbody.appendChild(row);
    });
}

// Создание строки таблицы для заказа
function createOrderRow(order, index) {
    const row = document.createElement('tr');
    
    const orderDate = new Date(order.created_at);
    const formattedDate = `${orderDate.toLocaleDateString('ru-RU')} ${orderDate.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}`;
    
    const orderComposition = getOrderComposition(order);
    const deliveryTime = getDeliveryTime(order);
    const totalPrice = getOrderTotalPrice(order);
    
    row.innerHTML = `
        <td>${index}</td>
        <td>${formattedDate}</td>
        <td>
            <div class="order-composition">
                ${orderComposition}
            </div>
        </td>
        <td>${totalPrice} ₽</td>
        <td>${deliveryTime}</td>
        <td>
            <div class="actions-container">
                <button class="action-btn view" data-order-id="${order.id}" title="Подробнее">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn edit" data-order-id="${order.id}" title="Редактировать">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" data-order-id="${order.id}" title="Удалить">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;
    
    const viewBtn = row.querySelector('.view');
    const editBtn = row.querySelector('.edit');
    const deleteBtn = row.querySelector('.delete');
    
    viewBtn.addEventListener('click', () => openViewModal(order.id));
    editBtn.addEventListener('click', () => openEditModal(order.id));
    deleteBtn.addEventListener('click', () => openDeleteModal(order.id));
    
    return row;
}

// Получение состава заказа в виде строки
function getOrderComposition(order) {
    const items = [];
    
    if (order.soup_id && dishesMap[order.soup_id]) {
        items.push(dishesMap[order.soup_id]);
    }
    if (order.main_course_id && dishesMap[order.main_course_id]) {
        items.push(dishesMap[order.main_course_id]);
    }
    if (order.salad_id && dishesMap[order.salad_id]) {
        items.push(dishesMap[order.salad_id]);
    }
    if (order.drink_id && dishesMap[order.drink_id]) {
        items.push(dishesMap[order.drink_id]);
    }
    if (order.dessert_id && dishesMap[order.dessert_id]) {
        items.push(dishesMap[order.dessert_id]);
    }
    
    return items.length > 0 ? items.join(', ') : '---';
}

// Получение времени доставки в нужном формате
function getDeliveryTime(order) {
    if (order.delivery_type === 'by_time' && order.delivery_time) {
        const timeStr = order.delivery_time.toString().padStart(4, '0');
        return `${timeStr.substring(0, 2)}:${timeStr.substring(2)}`;
    } else {
        return 'Как можно скорее (с 7:00 до 23:00)';
    }
}

// Настройка обработчиков модальных окон
function setupModalHandlers() {
    // Обработчики для закрытия модальных окон
    document.querySelectorAll('.close, .btn-ok, .btn-cancel').forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            if (modalId) {
                closeModal(modalId);
            }
        });
    });
    
    // Обработчик для подтверждения удаления
    document.getElementById('confirm-delete').addEventListener('click', confirmDelete);
    
    // Обработчик для формы редактирования
    document.getElementById('edit-order-form').addEventListener('submit', saveOrderChanges);
    
    // Закрытие модальных окон при клике вне контента
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    });
    
    // Закрытие модальных окон при нажатии Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                if (modal.style.display === 'flex') {
                    modal.style.display = 'none';
                    document.body.style.overflow = '';
                }
            });
        }
    });
}

// Получение заказа по ID
async function getOrder(orderId) {
    try {
        const API_KEY = localStorage.getItem('lunchProApiKey');
        const response = await fetch(`https://edu.std-900.ist.mospolytech.ru/labs/api/orders/${orderId}?api_key=${API_KEY}`);
        
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
        const API_KEY = localStorage.getItem('lunchProApiKey');
        const response = await fetch(`https://edu.std-900.ist.mospolytech.ru/labs/api/orders/${orderId}?api_key=${API_KEY}`, {
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
        const API_KEY = localStorage.getItem('lunchProApiKey');
        const response = await fetch(`https://edu.std-900.ist.mospolytech.ru/labs/api/orders/${orderId}?api_key=${API_KEY}`, {
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

// Открытие модального окна просмотра заказа
async function openViewModal(orderId) {
    try {
        const order = await getOrder(orderId);
        const modal = document.getElementById('view-order-modal');
        const content = document.getElementById('view-order-content');
        
        // Заполняем содержимое модального окна
        content.innerHTML = createViewContent(order);
        
        // Показываем модальное окно
        openModal('view-order-modal');
        
    } catch (error) {
        console.error('Ошибка загрузки данных заказа:', error);
        showError('Не удалось загрузить данные заказа');
    }
}

// Создание содержимого для модального окна просмотра
function createViewContent(order) {
    const orderDate = new Date(order.created_at);
    const formattedDate = `${orderDate.toLocaleDateString('ru-RU')} ${orderDate.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}`;
    
    const deliveryTime = getDeliveryTime(order);
    const totalPrice = getOrderTotalPrice(order);
    
    return `
        <div class="order-details">
            <div class="order-section">
                <h3>Дата оформления</h3>
                <div class="detail-group">
                    <p>${formattedDate}</p>
                </div>
                
                <h3>Доставка</h3>
                <div class="detail-group">
                    <label>Имя получателя</label>
                    <p>${order.full_name || 'Не указано'}</p>
                </div>
                <div class="detail-group">
                    <label>Адрес доставки</label>
                    <p>${order.delivery_address || 'Не указан'}</p>
                </div>
                <div class="detail-group">
                    <label>Время доставки</label>
                    <p>${deliveryTime}</p>
                </div>
                <div class="detail-group">
                    <label>Телефон</label>
                    <p>${order.phone || 'Не указан'}</p>
                </div>
                <div class="detail-group">
                    <label>Email</label>
                    <p>${order.email || 'Не указан'}</p>
                </div>
                ${order.comment ? `
                <div class="detail-group">
                    <label>Комментарий</label>
                    <p>${order.comment}</p>
                </div>
                ` : ''}
                ${order.subscribe ? `
                <div class="detail-group">
                    <p><strong>Получать информацию о скидках и акциях</strong></p>
                </div>
                ` : ''}
            </div>
            
            <div class="order-section">
                <h3>Состав заказа</h3>
                <div class="order-items-list">
                    ${getOrderItemsHTML(order)}
                </div>
                <div class="order-total">
                    Стоимость: ${totalPrice} ₽
                </div>
            </div>
        </div>
    `;
}

// Создание HTML для списка блюд в заказе
function getOrderItemsHTML(order) {
    let html = '';
    
    // Получаем названия блюд по их ID
    if (order.soup_id && dishesMap[order.soup_id]) {
        html += `
            <div class="order-item">
                <span>Суп</span>
                <span>${dishesMap[order.soup_id]}</span>
            </div>
        `;
    } else if (order.soup_name) {
        html += `
            <div class="order-item">
                <span>Суп</span>
                <span>${order.soup_name}</span>
            </div>
        `;
    }
    
    if (order.main_course_id && dishesMap[order.main_course_id]) {
        html += `
            <div class="order-item">
                <span>Основное блюдо</span>
                <span>${dishesMap[order.main_course_id]}</span>
            </div>
        `;
    } else if (order.main_course_name) {
        html += `
            <div class="order-item">
                <span>Основное блюдо</span>
                <span>${order.main_course_name}</span>
            </div>
        `;
    }
    
    if (order.salad_id && dishesMap[order.salad_id]) {
        html += `
            <div class="order-item">
                <span>Салат</span>
                <span>${dishesMap[order.salad_id]}</span>
            </div>
        `;
    } else if (order.salad_name) {
        html += `
            <div class="order-item">
                <span>Салат</span>
                <span>${order.salad_name}</span>
            </div>
        `;
    }
    
    if (order.drink_id && dishesMap[order.drink_id]) {
        html += `
            <div class="order-item">
                <span>Напиток</span>
                <span>${dishesMap[order.drink_id]}</span>
            </div>
        `;
    } else if (order.drink_name) {
        html += `
            <div class="order-item">
                <span>Напиток</span>
                <span>${order.drink_name}</span>
            </div>
        `;
    }
    
    if (order.dessert_id && dishesMap[order.dessert_id]) {
        html += `
            <div class="order-item">
                <span>Десерт</span>
                <span>${dishesMap[order.dessert_id]}</span>
            </div>
        `;
    } else if (order.dessert_name) {
        html += `
            <div class="order-item">
                <span>Десерт</span>
                <span>${order.dessert_name}</span>
            </div>
        `;
    }
    
    return html || '<p>Состав заказа не указан</p>';
}

// Открытие модального окна редактирования заказа
async function openEditModal(orderId) {
    try {
        const order = await getOrder(orderId);
        currentOrderId = orderId;
        
        const modal = document.getElementById('edit-order-modal');
        const content = document.getElementById('edit-order-content');
        
        // Заполняем содержимое модального окна
        content.innerHTML = createEditForm(order);
        
        // Настраиваем обработчик изменения типа доставки
        const deliveryTypeRadios = document.querySelectorAll('input[name="delivery_type"]');
        const timeInput = document.getElementById('edit-delivery-time');
        
        deliveryTypeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                timeInput.disabled = this.value !== 'by_time';
                timeInput.required = this.value === 'by_time';
            });
        });
        
        // Показываем модальное окно
        openModal('edit-order-modal');
        
    } catch (error) {
        console.error('Ошибка загрузки данных заказа:', error);
        showError('Не удалось загрузить данные заказа');
    }
}

// Создание формы редактирования заказа
function createEditForm(order) {
    const deliveryTime = order.delivery_time ? 
        `${order.delivery_time.toString().padStart(4, '0').substring(0, 2)}:${order.delivery_time.toString().padStart(4, '0').substring(2)}` : 
        '';
    
    const totalPrice = getOrderTotalPrice(order);
    
    return `
        <div class="edit-form">
            <div class="form-section">
                <h3>Доставка</h3>
                <div class="form-group">
                    <label for="edit-full-name">Имя получателя *</label>
                    <input type="text" id="edit-full-name" name="full_name" value="${order.full_name || ''}" required>
                </div>
                <div class="form-group">
                    <label for="edit-address">Адрес доставки *</label>
                    <input type="text" id="edit-address" name="delivery_address" value="${order.delivery_address || ''}" required>
                </div>
                
                <div class="form-group">
                    <label>Тип доставки *</label>
                    <div class="delivery-options">
                        <div class="delivery-option">
                            <input type="radio" id="edit-asap" name="delivery_type" value="now" ${order.delivery_type === 'now' ? 'checked' : ''}>
                            <label for="edit-asap">
                                <i class="fas fa-bolt"></i>
                                <span>Как можно скорее</span>
                            </label>
                        </div>
                        <div class="delivery-option">
                            <input type="radio" id="edit-scheduled" name="delivery_type" value="by_time" ${order.delivery_type === 'by_time' ? 'checked' : ''}>
                            <label for="edit-scheduled">
                                <i class="fas fa-clock"></i>
                                <span>Ко времени</span>
                            </label>
                        </div>
                    </div>
                    <input type="time" id="edit-delivery-time" name="delivery_time" value="${deliveryTime}" 
                           ${order.delivery_type !== 'by_time' ? 'disabled' : ''}
                           ${order.delivery_type === 'by_time' ? 'required' : ''}
                           min="07:00" max="23:00">
                </div>
            </div>
            
            <div class="form-section">
                <h3>Контактные данные</h3>
                <div class="form-group">
                    <label for="edit-phone">Телефон *</label>
                    <input type="tel" id="edit-phone" name="phone" value="${order.phone || ''}" required>
                </div>
                <div class="form-group">
                    <label for="edit-email">Email *</label>
                    <input type="email" id="edit-email" name="email" value="${order.email || ''}" required>
                </div>
                <div class="form-group">
                    <label for="edit-comment">Комментарий</label>
                    <textarea id="edit-comment" name="comment">${order.comment || ''}</textarea>
                </div>
            </div>
            
            <div class="form-section" style="grid-column: 1 / -1;">
                <h3>Состав заказа</h3>
                <div class="order-items-list">
                    ${getOrderItemsHTML(order)}
                </div>
                <div class="order-total">
                    Стоимость: ${totalPrice} ₽
                </div>
            </div>
        </div>
    `;
}

// Сохранение изменений заказа
async function saveOrderChanges(e) {
    e.preventDefault();
    
    try {
        const formData = new FormData(e.target);
        const orderData = {
            full_name: formData.get('full_name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            delivery_address: formData.get('delivery_address'),
            delivery_type: formData.get('delivery_type'),
            comment: formData.get('comment')
        };
        
        // Обработка времени доставки
        if (orderData.delivery_type === 'by_time') {
            const time = formData.get('delivery_time');
            if (time) {
                orderData.delivery_time = time.replace(':', '');
            } else {
                showError('Пожалуйста, укажите время доставки');
                return;
            }
        }
        
        // Обновляем заказ
        await updateOrder(currentOrderId, orderData);
        
        // Закрываем модальное окно
        closeModal('edit-order-modal');
        
        // Показываем уведомление об успехе
        showNotification('Заказ успешно изменён', true);
        
        // Обновляем список заказов
        await loadOrders();
        
    } catch (error) {
        console.error('Ошибка сохранения заказа:', error);
        showError('Ошибка при сохранении изменений: ' + error.message);
    }
}

// Открытие модального окна подтверждения удаления
function openDeleteModal(orderId) {
    currentOrderId = orderId;
    openModal('delete-order-modal');
}

// Подтверждение удаления заказа
async function confirmDelete() {
    try {
        await deleteOrder(currentOrderId);
        
        // Закрываем модальное окно
        closeModal('delete-order-modal');
        
        // Показываем уведомление об успехе
        showNotification('Заказ успешно удалён', true);
        
        // Обновляем список заказов
        await loadOrders();
        
    } catch (error) {
        console.error('Ошибка удаления заказа:', error);
        showError('Ошибка при удалении заказа: ' + error.message);
    }
}

// Вспомогательные функции для работы с модальными окнами
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
    document.body.style.overflow = '';
    currentOrderId = null;
}

// Функции для показа уведомлений
function showNotification(message, isSuccess) {
    const notification = document.createElement('div');
    notification.className = `notification ${isSuccess ? 'success' : 'error'}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showError(message) {
    showNotification(message, false);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initializeOrders);