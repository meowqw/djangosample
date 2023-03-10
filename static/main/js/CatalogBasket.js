new Vue({
    delimiters: ["{*", "*}"],
    el: "#app",
    data: {
        // arr: [], // впомогаьельный массив для рендера наличия товаров
        name: null, // впомогаьельный элемент для рендера наличия товаров
        catTotal: 0,
        currentScreen: "screenCatalog", // банеры - каталог
        currentScreenMain: "screenCatalogMain", // каталог - корзина
        catalog: [],
        basket: [],
        categories: {},
        total: { total: 0, stock: 0, remote: 0, way: 0 },

        // фильтр каталог
        weight: [],
        availability: [],
        status: [],
        // данные для фильтрации каталога
        catalogDataFilter: "",

        // payment
        code: null,
        wayGet: "DELIVERY", // способ получения
        address: null, // точка доставки
        paymentMethod: "CASH", // способ оплаты
        comment: null,

        // фильтр account
        orders: [],
        filterAddress: [],
        filterPaymentStatus: [],
        to: null,
        from: null,
        order: null,
        orderCategories: {},
        orderNumber: null,

        openedMainProduct: [],
    },
    methods: {
        // get request
        getData: async function (url) {
            token = document.getElementsByName("csrfmiddlewaretoken")[0].value;

            const response = await fetch(url, {
                headers: {
                    "Content-type": "application/json",
                    "X-CSRFTOKEN": token,
                },
                method: "GET",
            });

            return response.json();
        },

        /********* CATALOG **********/

        // получить список продуктов по id основного товара
        getProductsByMainProduct: async function (id) {
            var products = await this.getData(
                `/api/v1/ProductsByMainProductFilter/?main_product=${id}${this.catalogDataFilter}`
            );
            for (var i in products) {
                if (this.openedMainProduct.includes(id)) {
                    // pass
                } else {
                    this.catalog.push(products[i]);
                    this.openedMainProduct.push(id);
                }
            }
        },

        // удалить данные из каталога
        delProductsFromCatalog: function (id) {
            index = this.openedMainProduct.indexOf(id);
            this.openedMainProduct.splice(index, 1); // удаляем элемент из открытых

            for (var i in this.catalog) {
                if (this.catalog[i].id == id) {
                    this.catalog.splice(i, 1);
                }
            }

            // расчет тоталов
            this.totalCalculate();
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
                btn = btns[i];
                btnCat = btnsCatalog[i];
                if (btn.id == id) {
                    if (!this.openedMainProduct.includes(id)) {
                        color = btn.getAttribute("color");

                        btn.className = `btn-reset sidebar__btn sidebar__btn--sub sidebar__btn--active sidebar__btn--active-${color}`;
                        btnCat.className = `btn-reset menu__link menu__link--active menu__link--active-${color}`;

                        // подсветка категории
                        catBtn.className =
                            "btn-reset sidebar__btn sidebar__accordion accordion-header accordion-header--blue ui-accordion-header ui-corner-top ui-state-default ui-accordion-icons ui-sortable-handle ui-accordion-header-active ui-state-active";
                    } else {
                        btnCat.className = `btn-reset menu__link`;
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
        // открыть/закрыть таб каталога (список продуктов)
        openTab: function (id) {
            tab = document.querySelectorAll(`[tab="${id}"]`);
            tabBtn = document.querySelectorAll(`[tabBtn="${id}"]`);
            triagleTab = document.querySelectorAll(`[triagleTab="${id}"]`);

            if (tab[0].style.display == "none") {
                tabBtn[0].classList.add("ui-accordion-header-active");
                tab[0].style.display = "";
                triagleTab[0].className =
                    "ui-accordion-header-icon ui-icon ui-icon-triangle-1-s";
            } else {
                tabBtn[0].classList.remove("ui-accordion-header-active");
                tab[0].style.display = "none";
                triagleTab[0].className =
                    "ui-accordion-header-icon ui-icon ui-icon-triangle-1-e";
            }
        },

        // открыть/закрыть панель каталога (список товаров)
        openPanel: function (id) {
            panel = document.querySelectorAll(`[panel="${id}"]`);
            panelBtn = document.querySelectorAll(`[panelBtn="${id}"]`);
            triaglePanel = document.querySelectorAll(`[triaglePanel="${id}"]`);

            // console.log(panel[0].style.display)
            if (panel[0].style.display == "none") {
                panelBtn[0].classList.add("ui-accordion-header-active");
                panel[0].style.display = "block";
                triaglePanel[0].className =
                    "ui-accordion-header-icon ui-icon ui-icon-triangle-1-s";
            } else {
                panelBtn[0].classList.remove("ui-accordion-header-active");
                panel[0].style.display = "none";
                triaglePanel[0].className =
                    "ui-accordion-header-icon ui-icon ui-icon-triangle-1-e";
            }
        },
        // открыть/закрыть выпадающий список наличия
        openProductsList: function (id) {
            availabilityList = document.querySelectorAll(
                `[availabilityList="${id}"]`
            );
            availabilityBtn = document.querySelectorAll(`[availabilityBtn="${id}"]`);
            // triaglePanel = document.querySelectorAll(`[triaglePanel="${id}"]`);

            if (availabilityList[0].className.includes("open")) {
                availabilityList[0].className =
                    "product-accordion-content product-accordion-content";
            } else {
                availabilityList[0].className =
                    "product-accordion-content product-accordion-content--open";
            }
        },

        // открыть калькулятор
        openCalc: function (id, availability) {
            openCalcBtn = document.querySelectorAll(
                `[openCalcBtn="${id}"][availability="${availability}"]`
            );
            calc = document.querySelectorAll(
                `[calc="${id}"][availability="${availability}"]`
            );

            if (calc[0].style.display == "none") {
                openCalcBtn[0].style.display = "none";
                calc[0].style.display = "";
            } else {
                openCalcBtn[0].style.display = "";
                calc[0].style.display = "none";
            }
        },

        // калькулятор +
        calcPlus: function (id, availability) {
            for (var i in this.catalog) {
                list = this.catalog[i].id_product_list;
                for (var j in list) {
                    product = list[j].id_product;
                    for (var k in product) {
                        if (product[k].id == id) {
                            if (availability in product[k]) {
                                // count
                                this.catalog[i].id_product_list[j].id_product[k][
                                    availability
                                ].count += 1;
                                count =
                                    this.catalog[i].id_product_list[j].id_product[k][availability]
                                        .count;

                                // total
                                this.catalog[i].id_product_list[j].id_product[k][
                                    availability
                                ].total = product[k].price * count;

                                total =
                                    this.catalog[i].id_product_list[j].id_product[k][availability]
                                        .total;

                                // block

                                this.catalog[i].id_product_list[j].id_product[k][
                                    availability
                                ].block = (count / list[j].carton) | 0;
                                block =
                                    this.catalog[i].id_product_list[j].id_product[k][availability]
                                        .block;

                                // remainder

                                this.catalog[i].id_product_list[j].id_product[k][
                                    availability
                                ].remainder = count - block * list[j].carton;
                            }
                        }
                    }
                }
            }
            // расчет тоталов
            this.totalCalculate();

            // констроль состояния корзины
            this.basketController();
        },

        // калькулятор -
        calcMinus: function (id, availability) {
            for (var i in this.catalog) {
                list = this.catalog[i].id_product_list;
                for (var j in list) {
                    product = list[j].id_product;
                    for (var k in product) {
                        if (product[k].id == id) {
                            if (availability in product[k]) {
                                // count
                                count =
                                    this.catalog[i].id_product_list[j].id_product[k][availability]
                                        .count;
                                count = count -= 1;

                                if (count >= 0) {
                                    this.catalog[i].id_product_list[j].id_product[k][
                                        availability
                                    ].count = count;
                                    // total
                                    this.catalog[i].id_product_list[j].id_product[k][
                                        availability
                                    ].total = product[k].price * count;

                                    // block
                                    this.catalog[i].id_product_list[j].id_product[k][
                                        availability
                                    ].block = (count / list[j].carton) | 0;
                                    block =
                                        this.catalog[i].id_product_list[j].id_product[k][
                                            availability
                                        ].block;

                                    // remainder

                                    this.catalog[i].id_product_list[j].id_product[k][
                                        availability
                                    ].remainder = count - block * list[j].carton;
                                } else {
                                    this.openCalc(id, availability);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            // расчет тоталов
            this.totalCalculate();

            // констроль состояния корзины
            this.basketController();
        },

        calcInput: function (id, availability) {
            calcInput = document.querySelectorAll(
                `[calcInput="${id}"][availability="${availability}"]`
            );
            for (var i in this.catalog) {
                list = this.catalog[i].id_product_list;
                for (var j in list) {
                    product = list[j].id_product;
                    for (var k in product) {
                        if (product[k].id == id) {
                            if (availability in product[k]) {
                                // count
                                count =
                                    this.catalog[i].id_product_list[j].id_product[k][availability]
                                        .count;

                                // нак какой странице испоьльзовать калькулятор
                                if (this.currentScreenMain == "screenCatalogMain") {
                                    count = Number(calcInput[0].value);
                                } else {
                                    count = Number(calcInput[1].value);
                                }

                                if (count >= 0) {
                                    this.catalog[i].id_product_list[j].id_product[k][
                                        availability
                                    ].count = count;
                                    // total
                                    this.catalog[i].id_product_list[j].id_product[k][
                                        availability
                                    ].total = product[k].price * count;

                                    // block
                                    this.catalog[i].id_product_list[j].id_product[k][
                                        availability
                                    ].block = (count / list[j].carton) | 0;
                                    block =
                                        this.catalog[i].id_product_list[j].id_product[k][
                                            availability
                                        ].block;

                                    // remainder

                                    this.catalog[i].id_product_list[j].id_product[k][
                                        availability
                                    ].remainder = count - block * list[j].carton;
                                } else {
                                    this.openCalc(id, availability);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            // расчет тоталов
            this.totalCalculate();

            // констроль состояния корзины
            this.basketController();
        },

        // расчет тоталов
        totalCalculate: function () {
            stockRes = 0;
            remoteRes = 0;
            wayRes = 0;

            for (var i in this.catalog) {
                list = this.catalog[i].id_product_list;
                for (var j in list) {
                    product = list[j].id_product;
                    for (var k in product) {
                        remote = product[k].remote.total;
                        way = product[k].way.total;
                        stock = product[k].stock.total;

                        stockRes += stock;
                        wayRes += way;
                        remoteRes += remote;
                    }
                }
            }

            this.total.stock = stockRes;
            this.total.way = wayRes;
            this.total.remote = remoteRes;
            this.total.total = stockRes + wayRes + remoteRes;

            localStorage.setItem("catalog", JSON.stringify(this.catalog));
            localStorage.setItem("total", JSON.stringify(this.total));
        },

        // получаем категорию товара
        getCategoryByProduct: async function (id) {
            data = await this.getData(`/api/v1/CategoryByProduct/?product_id=${id}`);
            return data;
        },

        // сортируем по категориям товары из каталога
        goBasket: async function () {
            basket = {};
            for (var i in this.catalog) {
                productList = this.catalog[i].id_product_list;
                for (var l in productList) {
                    carton = productList[l].carton;
                    for (var j in productList[l].id_product) {
                        product = productList[l].id_product[j];
                        product["carton"] = carton;

                        if (
                            product.remote.total != 0 ||
                            product.way.total != 0 ||
                            product.stock.total != 0
                        ) {
                            category = await this.getCategoryByProduct(product.id);

                            if (category[0].id in basket) {
                                basket[category[0].id].push(product);
                            } else {
                                basket[category[0].id] = [product];
                            }
                        }
                    }
                }
            }

            for (var i in basket) {
                category = await this.getCategoryById(i);
                this.categories[i] = {
                    color: category[0].color,
                    name: category[0].name,
                    id: category[0].id,
                };
            }

            this.basket = basket;
        },

        /********* ПЕРЕХОДЫ **********/

        // переход с каталога на банеры
        switchScreen: function (screen) {
            // если пользвоатель ждем на одну и ту же ссылку - перенаправление на каталог
            if (screen == this.currentScreen) {
                screen = "screenCatalog";
            }
            goScreen = document.getElementById(screen).style.display = "";
            closeScreen = document.getElementById(this.currentScreen).style.display =
                "none";
            this.currentScreen = screen;
        },

        // переход корзины на каталог
        switchScreenMain: async function (screen) {
            if (screen != this.currentScreenMain) {
                goScreen = document.getElementById(screen).style.display = "";
                closeScreen = document.getElementById(
                    this.currentScreenMain
                ).style.display = "none";
                this.currentScreenMain = screen;
            }
        },

        // переход с каталога на корзину
        switchScreenBasket: async function (screen) {
            if (screen == "screenBasketMain" && this.total.total != 0) {
                await this.goBasket();

                if (screen != this.currentScreenMain) {
                    goScreen = document.getElementById(screen).style.display = "";
                    closeScreen = document.getElementById(
                        this.currentScreenMain
                    ).style.display = "none";
                    this.currentScreenMain = screen;
                }
            }
        },

        // смена экрана на payment
        switchToPayment: function (screen) {
            goScreen = document.getElementById(screen).style.display = "";
            closeScreen = document.getElementById(
                this.currentScreenMain
            ).style.display = "none";
            this.currentScreenMain = screen;
        },

        /********* КОРЗИНА **********/

        // получаем ифнормацио о категории по id
        getCategoryById: async function (id) {
            data = await this.getData(`api/v1/CategoryByID/?category_id=${id}`);
            return data;
        },

        // сичтаем тотал категории
        calcTotalCategory: function (products) {
            total = 0;
            for (var i in products) {
                product = products[i];
                if (product != 0) {
                    total += product.remote.total;
                    total += product.way.total;
                    total += product.stock.total;
                }
            }

            return total;
        },

        // очистка корзины
        clearBasket: function () {
            this.basket = [];
            this.catalog = [];
            this.total = { total: 0, stock: 0, remote: 0, way: 0 };
            // this.switchScreenMain('screenCatalogMain');
        },

        // создание ордера на заказ
        createOrder: function () {
            this.makeOrderCode();
            this.switchToPayment("screenPaymentMain");
        },

        // обработчик объектов в корзине (удаление)
        basketController: function () {
            newBasket = {};
            for (var i in this.basket) {
                category = this.basket[i]; // основная категория
                for (var j in category) {
                    product = category[j];
                    remote = product.remote.total;
                    way = product.way.total;
                    stock = product.stock.total;
                    if (remote == 0 && way == 0 && stock == 0) {
                        delete this.basket[i][j]; // удаляем продукт
                        this.basket[i].length -= 1;
                    }
                }
                if (category.length == 0) {
                    delete this.basket[i]; // удаляем категорию
                }
            }
        },

        // удаление объекта из корзины
        deleteProduct: function (id, availability) {
            for (var i in this.catalog) {
                list = this.catalog[i].id_product_list;
                for (var j in list) {
                    product = list[j].id_product;
                    for (var k in product) {
                        if (product[k].id == id) {
                            if (availability in product[k]) {
                                // count
                                count =
                                    this.catalog[i].id_product_list[j].id_product[k][availability]
                                        .count;
                                count = count = 0;

                                if (count >= 0) {
                                    this.catalog[i].id_product_list[j].id_product[k][
                                        availability
                                    ].count = count;
                                    // total
                                    this.catalog[i].id_product_list[j].id_product[k][
                                        availability
                                    ].total = product[k].price * count;

                                    // block
                                    this.catalog[i].id_product_list[j].id_product[k][
                                        availability
                                    ].block = (count / list[j].carton) | 0;
                                    block =
                                        this.catalog[i].id_product_list[j].id_product[k][
                                            availability
                                        ].block;

                                    // remainder
                                    this.catalog[i].id_product_list[j].id_product[k][
                                        availability
                                    ].remainder = count - block * list[j].carton;
                                } else {
                                    this.openCalc(id, availability);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            // расчет тоталов
            this.totalCalculate();

            // констроль состояния корзины
            this.basketController();
        },

        // ФИЛЬТР
        FilterAvailability: function (availability) {
            if (!this.availability.includes(availability)) {
                this.availability.push(availability);
            } else {
                this.availability = this.availability.filter(function (f) {
                    return f !== availability;
                });
            }

            this.FilterCatalog();
        },

        FilterWeight: function (weight) {
            if (!this.weight.includes(weight)) {
                this.weight.push(weight);
            } else {
                this.weight = this.weight.filter(function (f) {
                    return f !== weight;
                });
            }

            this.FilterCatalog();
        },

        FilterStatus: function () {
            this.FilterCatalog();
        },

        FilterCatalog: async function () {
            availability = "";
            if (this.availability.length > 0) {
                availability = "&availability=" + this.availability.toString();
            }

            weight = "";
            if (this.weight.length > 0) {
                weight = "&weight=" + this.weight.toString();
            }

            Status = "";
            if (this.status.length > 0) {
                Status = "&status=" + this.status.toString();
            }

            data = availability + weight + Status;

            // await this.getOrders(data)
            this.catalogDataFilter = data;

            // запуск ререндера
            await this.renderCatalogFilter();
        },


        // обработка содержимого каталога до ререндера
        catalogProcessingBeforeFilter: function() {
            // console.log(newCatalog);
            id_products = []

            for (var i in this.catalog) {
                mainProduct = this.catalog[i]
                for (var j in mainProduct.id_product_list) {
                    productList = mainProduct.id_product_list[j]
                    for (var k in productList.id_product) {
                        idProduct = productList.id_product[k]
                        stock = idProduct.stock.total
                        remote = idProduct.remote.total
                        way = idProduct.way.total

                        if (stock > 0 || remote > 0 || way > 0) {
                            id_products.push(idProduct.id)
                        }
                    }
                }
            }
            return id_products
        },

        catalogProcessingAfterFilter: function(newCatalog, id_products) {
            this.catalog = newCatalog;
        },
        
        
        // ререндкр каталога после фильтрации
        renderCatalogFilter: async function () {
            
            id_products = this.catalogProcessingBeforeFilter();
            // data = this.catalogDataFilter;
            openedIds = this.openedMainProduct;
            // this.catalog = []; // очистка каталога
            // // this.openedMainProduct = []  // очситка открытх продуктов
            // this.total = { total: 0, stock: 0, remote: 0, way: 0 };

            newCatalog = [];
            // берем открытые id и отправляем в фильтр
            for (var i in openedIds) {
                id = openedIds[i];
                var products = await this.getData(
                    `api/v1/ProductsByMainProductFilter/?main_product=${id}${data}`
                );

                for (var idProduct in products) {
                    newCatalog.push(products[idProduct]);
                }
            }
            
            this.catalogProcessingAfterFilter(newCatalog, id_products);
            
        },
        // --------

        /********* PAYMENT **********/

        postData: async function (url, data) {
            token = document.getElementsByName("csrfmiddlewaretoken")[0].value;

            const response = await fetch(url, {
                headers: {
                    "Content-type": "application/json",
                    "X-CSRFTOKEN": token,
                },
                body: JSON.stringify(data),
                method: "POST",
            });

            return response.json();
        },

        // генерирование номера заказа
        makeOrderCode: function () {
            date = new Date();
            strDate = date.toString().split(" ");
            code =
                strDate[0][0] +
                strDate[1][0] +
                "-" +
                strDate[2] +
                strDate[4].split(":")[0] +
                strDate[4].split(":")[1] +
                strDate[4].split(":")[2];
            this.code = code;
        },

        // Указать выбранный адрес по дефолту
        setAddress: function (address) {
            this.address = address;
        },

        // оформить заказ
        saveOrder: async function () {
            data = {
                number: this.code,
                items: this.basket,
                address: this.address,
                comment: this.comment,
                total: this.total.total,
                payment_method: this.paymentMethod,
                way_get: this.wayGet,
            };

            await this.postData("/api/v1/CreateOrder/", data);

            // обвить список заказов
            await this.getOrders("");
        },

        /********* ACCOUNT **********/

        // FILTER
        FilterAddress: function (address) {
            if (!this.filterAddress.includes(address)) {
                this.filterAddress.push(address);
            } else {
                this.filterAddress = this.filterAddress.filter(function (f) {
                    return f !== address;
                });
            }

            this.OrderFilter();
        },

        FilterPaymentStatus: function (paymentStatus) {
            if (!this.filterPaymentStatus.includes(paymentStatus)) {
                this.filterPaymentStatus.push(paymentStatus);
            } else {
                this.filterPaymentStatus = this.filterPaymentStatus.filter(function (
                    f
                ) {
                    return f !== paymentStatus;
                });
            }

            this.OrderFilter();
        },

        // получить заказы
        getOrders: async function (data) {
            orders = await this.getData(`/api/v1/Order?${data}`);
            this.orders = orders;
        },

        // привести дату к нужному виду
        processingDate: function (datetime) {
            date = datetime.split("T")[0];
            time = datetime.split("T")[1].split(".")[0];

            return [date, time];
        },

        // фильтрация заказов
        OrderFilter: async function () {
            // дата
            date = "";
            if (this.from != null && this.to != null) {
                date = `&from=${this.from.year}-${this.from.month}-${this.from.day}&to=${this.to.year}-${this.to.month}-${this.to.day}`;
            }

            // адреса
            address = "";
            if (this.filterAddress.length > 0) {
                address = "&address=" + this.filterAddress.toString();
            }

            paymentStatus = "";
            if (this.filterPaymentStatus.length > 0) {
                paymentStatus = "&payment=" + this.filterPaymentStatus.toString();
            }

            data = (date + address + paymentStatus).substring(1);

            await this.getOrders(data);
        },

        getOrderInfo: async function(id) {
            orderInfo = await this.getData(`/api/v1/OrderById/${id}`);
            order =  orderInfo[0].items;

            for (var i in order) {
                category = await this.getCategoryById(i);
                this.orderCategories[i] = {
                    color: category[0].color,
                    name: category[0].name,
                    id: category[0].id,
                };
            }

            this.orderNumber = orderInfo[0].number
            this.order = order;
            
            
        },
    },
    async mounted() {
        // установка дефолтного адреса доставки
        addressData = await this.getData("/api/v1/Address");
        this.address = Number(addressData[0].id);

        await this.getOrders("");

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
    // отслеживаем календарь
    created() {
        const onClickCalendar = (e) => {
            item = e.target;
            className = e.target.classList;
            if (className.toString().includes("air-datepicker-cell")) {
                if (className.toString().includes("-selected")) {
                    if (className.toString().includes("-range-from")) {
                        this.from = {
                            year: Number(item.getAttribute("data-year")),
                            month: Number(item.getAttribute("data-month")) + 1,
                            day: Number(item.getAttribute("data-date")),
                        };
                    } else if (className.toString().includes("-range-to")) {
                        this.to = {
                            year: Number(item.getAttribute("data-year")),
                            month: Number(item.getAttribute("data-month")) + 1,
                            day: Number(item.getAttribute("data-date")),
                        };
                    }
                } else if (!className.toString().includes("-selected")) {
                    if (className.toString().includes("-range-from")) {
                        this.from = null;
                    } else if (className.toString().includes("-range-to")) {
                        this.to = null;
                    }
                }

                this.OrderFilter();
            } else if (className.toString().includes("calendar__input")) {
                // this.from = null
                // this.to = null
                // this.OrderFilter()
            }
        };
        document.addEventListener("click", onClickCalendar);
    },
});
