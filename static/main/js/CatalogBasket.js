new Vue({
    delimiters: ['{*', '*}'],
    el: '#app',
    data: {
        arr: [], // впомогаьельный массив для рендера наличия товаров
        name: null, // впомогаьельный элемент для рендера наличия товаров
        catTotal: 0,
        currentScreen: 'screenCatalog', // банеры - каталог
        currentScreenMain: 'screenCatalogMain', // каталог - корзина
        catalog: [],
        basket: [],
        categories: {},
        total: { 'total': 0, 'stock': 0, 'remote': 0, 'way': 0 },

        // фильтр
        weight: [],
        availability: [],
        status: [],

        openedMainProduct: [],
    },
    methods: {
        // get request
        getData: async function (url) {
            token = document.getElementsByName('csrfmiddlewaretoken')[0].value

            const response = await fetch(url, {
                headers: {
                    "Content-type": "application/json",
                    "X-CSRFTOKEN": token,
                },
                method: "GET",
            });

            return response.json();
        },
        // получить список продуктов по id основного товара
        getProductsByMainProduct: async function (id) {
            products = await this.getData(`/api/v1/ProductsByMainProduct/?main_product=${id}`)
            for (var i in products) {
                if (this.openedMainProduct.includes(id)) {
                    // pass
                } else {
                    this.catalog.push(products[i])
                    this.openedMainProduct.push(id)
                }
            }
        },

        // удалить данные из каталога 
        delProductsFromCatalog: function (id) {
            index = this.openedMainProduct.indexOf(id)
            this.openedMainProduct.splice(index, 1) // удаляем элемент из открытых

            for (var i in this.catalog) {
                if (this.catalog[i].id == id) {
                    this.catalog.splice(i, 1)
                }
            };

            // расчет тоталов
            this.totalCalculate()
        },

        // добавление нового списка продуктов в каталог из меню
        addProductInCatalog: function (id, catId) {

            // кнопки в менб (menu.js)
            btns = document.querySelectorAll('[type="mainProduct"]');

            // кнопки в каталоге (catalog.html)
            btnsCatalog = document.querySelectorAll('[type="mainProductCatalog"]');

            // кнопка категории
            catBtn = document.querySelectorAll(`[category="${catId}"]`)[0];

            for (var i in btns) {
                btn = btns[i]
                btnCat = btnsCatalog[i]
                if (btn.id == id) {

                    if (!this.openedMainProduct.includes(id)) {
                        color = btn.getAttribute('color');

                        btn.className = `btn-reset sidebar__btn sidebar__btn--sub sidebar__btn--active sidebar__btn--active-${color}`;
                        btnCat.className = `btn-reset menu__link menu__link--active menu__link--active-${color}`

                        // подсветка категории
                        catBtn.className = "btn-reset sidebar__btn sidebar__accordion accordion-header accordion-header--blue ui-accordion-header ui-corner-top ui-state-default ui-accordion-icons ui-sortable-handle ui-accordion-header-active ui-state-active"

                    } else {
                        btnCat.className = `btn-reset menu__link`
                        btn.className = `btn-reset sidebar__btn sidebar__btn--sub`;
                    }
                }
            }

            if (!this.openedMainProduct.includes(id)) {
                // получить товары
                this.getProductsByMainProduct(id);
            } else {
                this.delProductsFromCatalog(id);
            }
        },

        // переход с каталога на банеры
        switchScreen: function (screen) {

            // если пользвоатель ждем на одну и ту же ссылку - перенаправление на каталог
            if (screen == this.currentScreen) {
                screen = 'screenCatalog';
            };

            goScreen = document.getElementById(screen).style.display = ''
            closeScreen = document.getElementById(this.currentScreen).style.display = 'none'
            this.currentScreen = screen;

        },

        // переход с каталога на корзину
        switchScreenMain: async function (screen) {

            if (screen == "screenBasketMain") {
                await this.goBasket();
            }
            
            if (screen != this.currentScreenMain) {
                goScreen = document.getElementById(screen).style.display = ''
                closeScreen = document.getElementById(this.currentScreenMain).style.display = 'none'
                this.currentScreenMain = screen;
            }



        },

        // открыть/закрыть таб каталога (список продуктов)
        openTab: function (id) {
            tab = document.querySelectorAll(`[tab="${id}"]`);
            tabBtn = document.querySelectorAll(`[tabBtn="${id}"]`);
            triagleTab = document.querySelectorAll(`[triagleTab="${id}"]`);


            if (tab[0].style.display == 'none') {
                tabBtn[0].classList.add('ui-accordion-header-active');
                tab[0].style.display = ''
                triagleTab[0].className = 'ui-accordion-header-icon ui-icon ui-icon-triangle-1-s'
            } else {
                tabBtn[0].classList.remove('ui-accordion-header-active');
                tab[0].style.display = 'none'
                triagleTab[0].className = 'ui-accordion-header-icon ui-icon ui-icon-triangle-1-e'
            }

        },

        // открыть/закрыть панель каталога (список товаров)
        openPanel: function (id) {
            panel = document.querySelectorAll(`[panel="${id}"]`);
            panelBtn = document.querySelectorAll(`[panelBtn="${id}"]`);
            triaglePanel = document.querySelectorAll(`[triaglePanel="${id}"]`);


            console.log(panel[0].style.display)
            if (panel[0].style.display == 'none') {
                panelBtn[0].classList.add('ui-accordion-header-active');
                panel[0].style.display = 'block'
                triaglePanel[0].className = 'ui-accordion-header-icon ui-icon ui-icon-triangle-1-s'
            } else {
                panelBtn[0].classList.remove('ui-accordion-header-active');
                panel[0].style.display = 'none'
                triaglePanel[0].className = 'ui-accordion-header-icon ui-icon ui-icon-triangle-1-e'
            }
        },
        // открыть/закрыть выпадающий список наличия
        openProductsList: function (id) {
            availabilityList = document.querySelectorAll(`[availabilityList="${id}"]`);
            availabilityBtn = document.querySelectorAll(`[availabilityBtn="${id}"]`);
            // triaglePanel = document.querySelectorAll(`[triaglePanel="${id}"]`);


            if (availabilityList[0].className.includes('open')) {
                availabilityList[0].className = 'product-accordion-content product-accordion-content'
            } else {
                availabilityList[0].className = 'product-accordion-content product-accordion-content--open'
            }
        },

        // открыть калькулятор
        openCalc: function (id, availability) {
            openCalcBtn = document.querySelectorAll(`[openCalcBtn="${id}"][availability="${availability}"]`)
            calc = document.querySelectorAll(`[calc="${id}"][availability="${availability}"]`)

            if (calc[0].style.display == "none") {
                openCalcBtn[0].style.display = "none"
                calc[0].style.display = ""
            } else {
                openCalcBtn[0].style.display = ""
                calc[0].style.display = "none"
            }
        },

        // калькулятор +
        calcPlus: function (id, availability) {
            for (var i in this.catalog) {
                list = this.catalog[i].id_product_list
                for (var j in list) {
                    product = list[j].id_product
                    for (var k in product) {
                        if (product[k].id == id) {
                            if (availability in product[k]) {

                                // count
                                this.catalog[i].id_product_list[j].id_product[k][availability].count += 1
                                count = this.catalog[i].id_product_list[j].id_product[k][availability].count

                                // total
                                this.catalog[i].id_product_list[j].id_product[k][availability].total = product[k].price * count

                                total = this.catalog[i].id_product_list[j].id_product[k][availability].total

                                // block

                                this.catalog[i].id_product_list[j].id_product[k][availability].block = count / list[j].carton | 0
                                block = this.catalog[i].id_product_list[j].id_product[k][availability].block

                                // remainder

                                this.catalog[i].id_product_list[j].id_product[k][availability].remainder = count - (block * list[j].carton)
                            }
                        }
                    }

                }
            }
            // расчет тоталов
            this.totalCalculate()
        },

        // калькулятор -
        calcMinus: function (id, availability) {

            for (var i in this.catalog) {
                list = this.catalog[i].id_product_list
                for (var j in list) {
                    product = list[j].id_product
                    for (var k in product) {
                        if (product[k].id == id) {
                            if (availability in product[k]) {

                                // count
                                count = this.catalog[i].id_product_list[j].id_product[k][availability].count
                                count = count -= 1

                                if (count >= 0) {
                                    this.catalog[i].id_product_list[j].id_product[k][availability].count = count
                                    // total
                                    this.catalog[i].id_product_list[j].id_product[k][availability].total = product[k].price * count

                                    // block
                                    this.catalog[i].id_product_list[j].id_product[k][availability].block = count / list[j].carton | 0
                                    block = this.catalog[i].id_product_list[j].id_product[k][availability].block

                                    // remainder

                                    this.catalog[i].id_product_list[j].id_product[k][availability].remainder = count - (block * list[j].carton)

                                } else {
                                    this.openCalc(id, availability)
                                    break;
                                }
                            }
                        }
                    }

                }
            }
            // расчет тоталов
            this.totalCalculate()

        },

        calcInput: function (id, availability) {
            calcInput = document.querySelectorAll(`[calcInput="${id}"][availability="${availability}"]`)
            for (var i in this.catalog) {
                list = this.catalog[i].id_product_list
                for (var j in list) {
                    product = list[j].id_product
                    for (var k in product) {
                        if (product[k].id == id) {
                            if (availability in product[k]) {

                                // count
                                count = this.catalog[i].id_product_list[j].id_product[k][availability].count

                                // нак какой странице испоьльзовать калькулятор
                                if (this.currentScreenMain == 'screenCatalogMain') {
                                    count = Number(calcInput[0].value)
                                } else {
                                    count = Number(calcInput[1].value)
                                }

                                if (count >= 0) {
                                    this.catalog[i].id_product_list[j].id_product[k][availability].count = count
                                    // total
                                    this.catalog[i].id_product_list[j].id_product[k][availability].total = product[k].price * count

                                    // block
                                    this.catalog[i].id_product_list[j].id_product[k][availability].block = count / list[j].carton | 0
                                    block = this.catalog[i].id_product_list[j].id_product[k][availability].block

                                    // remainder

                                    this.catalog[i].id_product_list[j].id_product[k][availability].remainder = count - (block * list[j].carton)

                                } else {
                                    this.openCalc(id, availability)
                                    break;
                                }
                            }
                        }
                    }

                }
            }
            // расчет тоталов
            this.totalCalculate()


        },

        // расчет тоталов
        totalCalculate: function () {
            stockRes = 0
            remoteRes = 0
            wayRes = 0

            for (var i in this.catalog) {
                list = this.catalog[i].id_product_list
                for (var j in list) {
                    product = list[j].id_product
                    for (var k in product) {
                        remote = product[k].remote.total
                        way = product[k].way.total
                        stock = product[k].stock.total

                        stockRes += stock
                        wayRes += way
                        remoteRes += remote
                    }
                }
            }

            this.total.stock = stockRes
            this.total.way = wayRes
            this.total.remote = remoteRes
            this.total.total = (stockRes + wayRes + remoteRes)

            localStorage.setItem('catalog', JSON.stringify(this.catalog))
            localStorage.setItem('total', JSON.stringify(this.total))

        },

        // получаем категорию товара
        getCategoryByProduct: async function (id) {
            data = await this.getData(`/api/v1/CategoryByProduct/?product_id=${id}`)
            return data
        },

        // сортируем по категориям товары из каталога
        goBasket: async function () {
            basket = {}
            for (var i in this.catalog) {
                productList = this.catalog[i].id_product_list
                for (var l in productList) {
                    carton = productList[l].carton
                    for (var j in productList[l].id_product) {

                        product = productList[l].id_product[j]
                        product['carton'] = carton

                        if (product.remote.total != 0 || product.way.total != 0 || product.stock.total != 0) {

                            category = await this.getCategoryByProduct(product.id)

                            if (category[0].id in basket) {
                                basket[category[0].id].push(product)
                            } else {
                                basket[category[0].id] = [product]
                            }
                        }

                    }
                }
            }

            for (var i in basket) {
                category = await this.getCategoryById(i)
                this.categories[i] = { 'color': category[0].color, 'name': category[0].name, 'id': category[0].id }

                basket[i]['total'] = 0
            }

            this.basket = basket

        },

        /* КОРЗИНА */

        // получаем ифнормацио о категории по id
        getCategoryById: async function (id) {
            data = await this.getData(`api/v1/CategoryByID/?category_id=${id}`)
            return data
        },

        // сичтаем тотал категории
        calcTotalCategory: function (products) {
            total = 0
            for (var i in products) {
                product = products[i]
                if (product != 0) {
                    total += product.remote.total
                    total += product.way.total
                    total += product.stock.total
                }
            }

            return total
        },

        // 
        clearBasket: function() {
            this.basket = [];
            this.catalog = []
        },

        createOrder: function() {

        },

        // ФИЛЬТР
        FilterAvailability: function(availability) {
            if (!this.availability.includes(availability)) {
                this.availability.push(availability)
            } else {
                this.availability = this.availability.filter(function (f) { return f !== availability });
            }
        },

        FilterWeight: function(weight) {
            if (!this.weight.includes(weight)) {
                this.weight.push(weight)
            } else {
                this.weight = this.weight.filter(function (f) { return f !== weight });
            }
        },

        FilterStatus: function () {

        }
    },
    mounted() {

        // загрузка данных из локального хранилища
        // const catalog = localStorage.getItem('catalog');
        // const total = localStorage.getItem('total');

        // if (catalog != undefined) {
        //     this.catalog = JSON.parse(catalog)
        // }

        // if (total != undefined) {
        //     this.total = JSON.parse(total)
        // }
        

    },
})