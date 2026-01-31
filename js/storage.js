const STORAGE_KEY = 'business_lunch_order';

class OrderStorage {
    static saveOrder(orderData) {
        try {
            const orderToSave = {
                soup: orderData.soup ? orderData.soup.keyword : null,
                main: orderData.main ? orderData.main.keyword : null,
                salad: orderData.salad ? orderData.salad.keyword : null,
                drink: orderData.drink ? orderData.drink.keyword : null,
                dessert: orderData.dessert ? orderData.dessert.keyword : null,
                timestamp: Date.now()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(orderToSave));
            console.log('Order saved to localStorage:', orderToSave);
        } catch (error) {
            console.error('Error saving order to localStorage:', error);
        }
    }

    static loadOrder() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const orderData = JSON.parse(saved);
                console.log('Order loaded from localStorage:', orderData);
                return orderData;
            }
        } catch (error) {
            console.error('Error loading order from localStorage:', error);
        }
        return {
            soup: null,
            main: null,
            salad: null,
            drink: null,
            dessert: null
        };
    }

    static getOrderWithDishes(dishesArray) {
        const savedOrder = this.loadOrder();
        const orderWithDishes = {};
        
        ['soup', 'main', 'salad', 'drink', 'dessert'].forEach(category => {
            if (savedOrder[category]) {
                const dish = dishesArray.find(d => d.keyword === savedOrder[category]);
                orderWithDishes[category] = dish || null;
            } else {
                orderWithDishes[category] = null;
            }
        });
        
        return orderWithDishes;
    }

    static removeDishFromOrder(category) {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const orderData = JSON.parse(saved);
                orderData[category] = null;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(orderData));
                console.log(`Removed ${category} from order`);
                return true;
            }
        } catch (error) {
            console.error('Error removing dish from order:', error);
        }
        return false;
    }

    static clearOrder() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            console.log('Order cleared from localStorage');
            return true;
        } catch (error) {
            console.error('Error clearing order from localStorage:', error);
        }
        return false;
    }

    static hasOrder() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return false;
        
        try {
            const orderData = JSON.parse(saved);
            return Object.values(orderData).some(value => value !== null);
        } catch (error) {
            return false;
        }
    }
}

window.OrderStorage = OrderStorage;