const dishes = [
    {
        keyword: 'spinach_cream_soup',
        name: 'Крем-суп шпинатный',
        price: 320,
        category: 'soup',
        count: '300 г',
        image: 'img/dishes/spinach_cream_soup.jpg',
        kind: 'veg'
    },
    {
        keyword: 'pumpkin_puree_soup',
        name: 'Тыквенный суп-пюре',
        price: 280,
        category: 'soup',
        count: '320 г',
        image: 'img/dishes/pumpkin_puree_soup.webp',
        kind: 'veg'
    },
    {
        keyword: 'beef_borscht',
        name: 'Борщ с говядиной',
        price: 350,
        category: 'soup',
        count: '350 г',
        image: 'img/dishes/beef_borscht.webp',
        kind: 'meat'
    },
    {
        keyword: 'chicken_noodle_soup',
        name: 'Куриный суп с лапшой',
        price: 290,
        category: 'soup',
        count: '330 г',
        image: 'img/dishes/chicken_noodle_soup.webp',
        kind: 'meat'
    },
    {
        keyword: 'salmon_cream_soup',
        name: 'Суп с лососем и сливками',
        price: 420,
        category: 'soup',
        count: '300 г',
        image: 'img/dishes/salmon_cream_soup.webp',
        kind: 'fish'
    },
    {
        keyword: 'finnish_fish_soup',
        name: 'Уха по-фински',
        price: 380,
        category: 'soup',
        count: '350 г',
        image: 'img/dishes/finnish_fish_soup.png',
        kind: 'fish'
    },

    {
        keyword: 'vegetable_risotto',
        name: 'Ризотто с овощами гриль',
        price: 450,
        category: 'main',
        count: '280 г',
        image: 'img/dishes/vegetable_risotto.jxl',
        kind: 'veg'
    },
    {
        keyword: 'ratatouille_quinoa',
        name: 'Рататуй с киноа',
        price: 390,
        category: 'main',
        count: '320 г',
        image: 'img/dishes/ratatouille_quinoa.jpg',
        kind: 'veg'
    },
    {
        keyword: 'veal_medallions',
        name: 'Медальоны из телятины',
        price: 680,
        category: 'main',
        count: '250 г',
        image: 'img/dishes/veal_medallions.jpg',
        kind: 'meat'
    },
    {
        keyword: 'duck_leg',
        name: 'Утиная ножка с яблочным пюре',
        price: 720,
        category: 'main',
        count: '300 г',
        image: 'img/dishes/duck_leg.webp',
        kind: 'meat'
    },
    {
        keyword: 'dorado_fillet',
        name: 'Филе дорадо с цукини',
        price: 580,
        category: 'main',
        count: '270 г',
        image: 'img/dishes/dorado_fillet.webp',
        kind: 'fish'
    },
    {
        keyword: 'sea_bass_pesto',
        name: 'Сибас в соусе песто',
        price: 620,
        category: 'main',
        count: '260 г',
        image: 'img/dishes/sea_bass_pesto.jpg',
        kind: 'fish'
    },

    {
        keyword: 'berry_fruit_drink',
        name: 'Морс ягодный',
        price: 180,
        category: 'drink',
        count: '330 мл',
        image: 'img/dishes/berry_fruit_drink.jpg',
        kind: 'cold'
    },
    {
        keyword: 'mint_lemonade',
        name: 'Лимонад мятный',
        price: 220,
        category: 'drink',
        count: '400 мл',
        image: 'img/dishes/mint_lemonade.jpg',
        kind: 'cold'
    },
    {
        keyword: 'ice_latte',
        name: 'Айс-латте',
        price: 280,
        category: 'drink',
        count: '350 мл',
        image: 'img/dishes/ice_latte.jpg',
        kind: 'cold'
    },
    {
        keyword: 'espresso',
        name: 'Кофе эспрессо',
        price: 150,
        category: 'drink',
        count: '50 мл',
        image: 'img/dishes/espresso.jpg',
        kind: 'hot'
    },
    {
        keyword: 'sea_buckthorn_tea',
        name: 'Чай облепиховый',
        price: 190,
        category: 'drink',
        count: '300 мл',
        image: 'img/dishes/sea_buckthorn_tea.jpg',
        kind: 'hot'
    },
    {
        keyword: 'cocoa',
        name: 'Какао',
        price: 210,
        category: 'drink',
        count: '250 мл',
        image: 'img/dishes/cocoa.webp',
        kind: 'hot'
    },

    {
        keyword: 'avocado_arugula_salad',
        name: 'Салат с авокадо и рукколой',
        price: 340,
        category: 'salad',
        count: '220 г',
        image: 'img/dishes/avocado_arugula_salad.jpg',
        kind: 'veg'
    },
    {
        keyword: 'caprese',
        name: 'Капрезе',
        price: 380,
        category: 'salad',
        count: '200 г',
        image: 'img/dishes/caprese.jpg',
        kind: 'veg'
    },
    {
        keyword: 'warm_veal_salad',
        name: 'Теплый салат с телятиной',
        price: 460,
        category: 'salad',
        count: '250 г',
        image: 'img/dishes/warm_veal_salad.jpg',
        kind: 'meat'
    },
    {
        keyword: 'beef_tartare',
        name: 'Тартар из говядины',
        price: 520,
        category: 'salad',
        count: '180 г',
        image: 'img/dishes/beef_tartare.jpg',
        kind: 'meat'
    },
    {
        keyword: 'tuna_tartare',
        name: 'Тартар из тунца',
        price: 480,
        category: 'salad',
        count: '190 г',
        image: 'img/dishes/tuna_tartare.webp',
        kind: 'fish'
    },
    {
        keyword: 'salmon_ceviche',
        name: 'Севвиче из лосося',
        price: 440,
        category: 'salad',
        count: '200 г',
        image: 'img/dishes/salmon_ceviche.jpg',
        kind: 'fish'
    },

    {
        keyword: 'macaron',
        name: 'Макарон',
        price: 120,
        category: 'dessert',
        count: '50 г',
        image: 'img/dishes/macaron.webp',
        kind: 'small'
    },
    {
        keyword: 'chocolate_truffle',
        name: 'Трюфель шоколадный',
        price: 90,
        category: 'dessert',
        count: '30 г',
        image: 'img/dishes/chocolate_truffle.jpg',
        kind: 'small'
    },
    {
        keyword: 'passionfruit_cheesecake',
        name: 'Чизкейк маракуя',
        price: 320,
        category: 'dessert',
        count: '150 г',
        image: 'img/dishes/passionfruit_cheesecake.jpg',
        kind: 'medium'
    },
    {
        keyword: 'lemon_tart',
        name: 'Тарт лимонный',
        price: 280,
        category: 'dessert',
        count: '140 г',
        image: 'img/dishes/lemon_tart.jpg',
        kind: 'medium'
    },
    {
        keyword: 'panna_cotta_berries',
        name: 'Панна-кота с ягодами',
        price: 380,
        category: 'dessert',
        count: '200 г',
        image: 'img/dishes/panna_cotta_berries.webp',
        kind: 'large'
    },
    {
        keyword: 'berry_parfait',
        name: 'Парфе ягодное',
        price: 350,
        category: 'dessert',
        count: '220 г',
        image: 'img/dishes/berry_parfait.jpg',
        kind: 'large'
    }
];