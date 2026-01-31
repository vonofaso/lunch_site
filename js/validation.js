document.addEventListener('DOMContentLoaded', function() {
    const orderForm = document.querySelector('.order-form');
    
    const notificationOverlay = document.createElement('div');
    notificationOverlay.className = 'notification-overlay';
    document.body.appendChild(notificationOverlay);

    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const selectedDishes = getSelectedDishes();
            const validationResult = validateOrder(selectedDishes);
            
            if (validationResult.isValid) {
                console.log('Заказ валиден, отправляем форму на httpbin');
                submitOrderToHttpbin(this);
            } else {
                console.log('Заказ невалиден, показываем уведомление:', validationResult.message);
                showNotification(validationResult.message);
            }
        });
    }

    async function submitOrderToHttpbin(form) {
        const formData = new FormData(form);
        
        console.log('Submitting to httpbin with FormData:');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }

        try {
            // Показываем индикатор загрузки
            const submitBtn = form.querySelector('.submit-order-btn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Отправка...';
            }

            // Отправляем на httpbin
            const response = await fetch('https://httpbin.org/post', {
                method: 'POST',
                body: formData
            });

            console.log('httpbin response status:', response.status);

            if (response.ok) {
                const result = await response.json();
                console.log('Order submitted successfully to httpbin:', result);
                
                // Успешная отправка - очищаем localStorage
                if (typeof OrderStorage !== 'undefined') {
                    OrderStorage.clearOrder();
                }
                
                showSuccessNotification('Заказ успешно отправлен! Данные получены сервером.');
                
                // Очищаем форму
                form.reset();
                
            } else {
                throw new Error(`HTTP error: ${response.status}`);
            }
        } catch (error) {
            console.error('Error submitting order to httpbin:', error);
            showNotification('Ошибка отправки заказа: ' + error.message);
        } finally {
            // Восстанавливаем кнопку
            const submitBtn = form.querySelector('.submit-order-btn');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Отправить заказ';
            }
        }
    }

    function getSelectedDishes() {
        const selected = {};
        const categories = ['soup', 'main', 'salad', 'drink', 'dessert'];
        
        categories.forEach(category => {
            const hiddenField = document.getElementById(`selected-${category}`);
            selected[category] = hiddenField ? hiddenField.value !== '' : false;
        });
        
        console.log('Выбранные блюда:', selected);
        return selected;
    }

    function validateOrder(selectedDishes) {
        const { soup, main, salad, drink, dessert } = selectedDishes;
        
        if (!soup && !main && !salad && !drink && !dessert) {
            return {
                isValid: false,
                message: 'Ничего не выбрано. Выберите блюда для заказа'
            };
        }
        
        if (soup && main && salad && !drink) {
            return {
                isValid: false,
                message: 'Выберите напиток'
            };
        }
        
        const validCombinations = [
            { soup: true, main: true, salad: true, drink: true },
            { soup: true, main: true, salad: false, drink: true },
            { soup: true, main: false, salad: true, drink: true },
            { soup: false, main: true, salad: true, drink: true },
            { soup: false, main: true, salad: false, drink: true }
        ];

        const currentCombo = {
            soup: soup,
            main: main,
            salad: salad,
            drink: drink
        };
        
        const isValidCombo = validCombinations.some(combo => 
            combo.soup === currentCombo.soup &&
            combo.main === currentCombo.main &&
            combo.salad === currentCombo.salad &&
            combo.drink === currentCombo.drink
        );
        
        if (isValidCombo) {
            return { isValid: true, message: '' };
        }
        
        if (soup && !main && !salad) {
            return {
                isValid: false,
                message: 'Выберите главное блюдо/салат/стартер'
            };
        }
        
        if (salad && !soup && !main) {
            return {
                isValid: false,
                message: 'Выберите суп или главное блюдо'
            };
        }
        
        if ((drink || dessert) && !soup && !main && !salad) {
            return {
                isValid: false,
                message: 'Выберите главное блюдо'
            };
        }

        if (soup && drink && !main && !salad) {
            return {
                isValid: false,
                message: 'Выберите главное блюдо/салат/стартер'
            };
        }
        
        if (salad && drink && !soup && !main) {
            return {
                isValid: false,
                message: 'Выберите суп или главное блюдо'
            };
        }
        
        return {
            isValid: false,
            message: 'Выбранная комбинация блюд не соответствует доступным вариантам ланча'
        };
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <p class="notification-text">${message}</p>
                <button class="notification-ok">Окей</button>
            </div>
        `;
        
        notificationOverlay.innerHTML = '';
        notificationOverlay.appendChild(notification);
        notificationOverlay.style.display = 'flex';
        
        document.body.style.overflow = 'hidden';
        
        const okButton = notification.querySelector('.notification-ok');
        okButton.addEventListener('click', function() {
            closeNotification();
        });
        
        okButton.addEventListener('mouseenter', function() {
            this.style.background = '#ff6347';
            this.style.color = 'white';
        });
        
        okButton.addEventListener('mouseleave', function() {
            this.style.background = '#f1eee9';
            this.style.color = '#333';
        });
        
        notificationOverlay.addEventListener('click', function(e) {
            if (e.target === notificationOverlay) {
                closeNotification();
            }
        });
        
        document.addEventListener('keydown', function escapeHandler(e) {
            if (e.key === 'Escape') {
                closeNotification();
                document.removeEventListener('keydown', escapeHandler);
            }
        });
    }

    function showSuccessNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <p class="notification-text">${message}</p>
                <button class="notification-ok">Окей</button>
            </div>
        `;
        
        notificationOverlay.innerHTML = '';
        notificationOverlay.appendChild(notification);
        notificationOverlay.style.display = 'flex';
        
        document.body.style.overflow = 'hidden';
        
        const okButton = notification.querySelector('.notification-ok');
        okButton.addEventListener('click', function() {
            closeNotification();
            // Перенаправляем на главную после закрытия уведомления
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        });
        
        okButton.addEventListener('mouseenter', function() {
            this.style.background = '#ff6347';
            this.style.color = 'white';
        });
        
        okButton.addEventListener('mouseleave', function() {
            this.style.background = '#f1eee9';
            this.style.color = '#333';
        });
    }

    function closeNotification() {
        notificationOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }
});