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
    products: {}, // список продуктов, выбранных пользователем
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
    openedProduct: [],
    openedMainCategory: [],

    categoryStructure: {},

    // main category
    mainCategory: [],
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

      newCatalog = [];
      for (var idProduct in this.catalog) {
        newCatalog.push(this.catalog[idProduct]);
      }

      await this.catalogProcessingAfterFilter(newCatalog);

      await this.openCalcSelectedProducts();
    },

    // удалить данные из каталога
    delProductsFromCatalog: function (id) {
      index = this.openedMainProduct.indexOf(id);
      this.openedMainProduct.splice(index, 1); // удаляем элемент из открытых

      for (var i in this.catalog) {
        if (this.catalog[i].id == id) {
          // удаляем продукт из this.products
          // if (this.catalog[i].id in this.products) {
          //   delete this.products[this.catalog[i].id];
          // }

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

      // кнопки закрыть
      closeBtns = document.querySelectorAll(`[element="close"]`);

      if (catId in this.categoryStructure) {
        //
      } else {
        this.categoryStructure[catId] = [];
      }

      for (var i in btns) {
        btn = btns[i];
        btnCat = btnsCatalog[i];
        closeBtn = closeBtns[i];
        if (btn.id == id) {
          if (!this.openedMainProduct.includes(id)) {
            color = btn.getAttribute("color");

            btn.className = `btn-reset sidebar__btn sidebar__btn--sub sidebar__btn--active sidebar__btn--active-${color}`;
            btnCat.className = `btn-reset menu__link menu__link--active menu__link--active-${color}`;

            // подсветка категории
            catBtn.className = `btn-reset sidebar__btn sidebar__accordion accordion-header accordion-header--${color} ui-accordion-header ui-corner-top ui-state-default ui-accordion-icons ui-sortable-handle ui-accordion-header-active ui-state-active`;

            catBtn.getElementsByTagName("span")[0].className =
              "ui-accordion-header-icon ui-icon ui-icon-triangle-1-s";
            catBtn.setAttribute("aria-expanded", "true");
            catBtn.setAttribute("aria-selected", "true");

            // показываем кнопку
            closeBtn.style.display = "";

            this.categoryStructure[catId].push(id)
          } else {
            const index = this.categoryStructure[catId].indexOf(id); // находим индекс элемента
            if (index > -1) {
              this.categoryStructure[catId].splice(index, 1); // удаляем элемент по индексу
            }


            catBtn.setAttribute("aria-expanded", "false");
            catBtn.setAttribute("aria-selected", "false");

            btnCat.className = `btn-reset menu__link`;
            btn.className = `btn-reset sidebar__btn sidebar__btn--sub`;
            // скрываем кнопку
            closeBtn.style.display = "none";
          }
        }
      }

      this.addProductFromMainCategory(catId);

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
    calcPlus: async function (id, availability) {
      for (var i in this.catalog) {
        list = this.catalog[i].id_product_list;
        for (var j in list) {
          product = list[j].id_product;
          for (var k in product) {
            if (product[k].id == id) {
              if (availability in product[k]) {
                if (
                  this.catalog[i].id_product_list[j].id_product[k][availability]
                    .count <
                  this.catalog[i].id_product_list[j].id_product[k][availability]
                    .availability
                ) {
                  // count
                  this.catalog[i].id_product_list[j].id_product[k][
                    availability
                  ].count += 1;
                  count =
                    this.catalog[i].id_product_list[j].id_product[k][
                      availability
                    ].count;

                  // total
                  this.catalog[i].id_product_list[j].id_product[k][
                    availability
                  ].total = product[k].price * count;

                  total =
                    this.catalog[i].id_product_list[j].id_product[k][
                      availability
                    ].total;

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
                }

                product[k]["carton"] = list[j].carton;
                if (this.catalog[i].id in this.products) {
                  this.products[this.catalog[i].id][product[k].id] = product[k];
                } else {
                  this.products[this.catalog[i].id] = {
                    [product[k].id]: product[k],
                  };
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

      // await this.goBasket();
    },

    // калькулятор -
    calcMinus: async function (id, availability) {
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

              product[k]["carton"] = list[j].carton;
              if (this.catalog[i].id in this.products) {
                this.products[this.catalog[i].id][product[k].id] = product[k];
              } else {
                this.products[this.catalog[i].id] = {
                  [product[k].id]: product[k],
                };
              }
            }
          }
        }
      }
      // расчет тоталов
      this.totalCalculate();

      // констроль состояния корзины
      this.basketController();

      // await this.goBasket();
    },

    calcInput: async function (id, availability) {
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
                  if (
                    count >
                    this.catalog[i].id_product_list[j].id_product[k][
                      availability
                    ].availability
                  ) {
                    count =
                      this.catalog[i].id_product_list[j].id_product[k][
                        availability
                      ].availability;
                    if (this.currentScreenMain == "screenCatalogMain") {
                      calcInput[0].value = count;
                    } else {
                      calcInput[1].value = count;
                    }
                  }

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

              product[k]["carton"] = list[j].carton;
              if (this.catalog[i].id in this.products) {
                this.products[this.catalog[i].id][product[k].id] = product[k];
              } else {
                this.products[this.catalog[i].id] = {
                  [product[k].id]: product[k],
                };
              }
            }
          }
        }
      }
      // расчет тоталов
      this.totalCalculate();

      // констроль состояния корзины
      this.basketController();

      // await this.goBasket();
    },

    // расчет тоталов
    totalCalculate: async function () {
      stockRes = 0;
      remoteRes = 0;
      wayRes = 0;

      for (var i in this.products) {
        cat = this.products[i];
        for (var k in cat) {
          product = cat[k];
          remote = product.remote.total;
          way = product.way.total;
          stock = product.stock.total;

          stockRes += stock;
          wayRes += way;
          remoteRes += remote;
        }
      }

      this.total.stock = stockRes;
      this.total.way = wayRes;
      this.total.remote = remoteRes;
      this.total.total = stockRes + wayRes + remoteRes;

      localStorage.setItem("catalog", JSON.stringify(this.catalog));
      localStorage.setItem("total", JSON.stringify(this.total));

      // console.log(this.products);
    },

    // получаем категорию товара
    getCategoryByProduct: async function (id) {
      data = await this.getData(`/api/v1/CategoryByProduct/?product_id=${id}`);
      return data;
    },

    // сортируем по категориям товары из каталога
    goBasket: async function () {
      basket = {};

      for (var i in this.products) {
        for (var j in this.products[i]) {
          product = this.products[i][j];

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

    // открываем panel если проудкт выбран пользователем
    openSelectedProducts: async function () {
      // console.log(1);
      for (var i in this.catalog) {
        list = this.catalog[i].id_product_list;
        for (var j in list) {
          product = list[j].id_product;
          for (var k in product) {
            remote = product[k].remote;
            way = product[k].way;
            stock = product[k].stock;

            if (stock.total > 0) {
              openCalcBtn = document.querySelectorAll(
                `[openCalcBtn="${product[k].id}"][availability="stock"]`
              );
              calc = document.querySelectorAll(
                `[calc="${product[k].id}"][availability="stock"]`
              );

              if (calc[0].style.display == "none") {
                openCalcBtn[0].style.display = "none";
                calc[0].style.display = "";
              }
            }

            if (remote.total > 0) {
              openCalcBtn = document.querySelectorAll(
                `[openCalcBtn="${product[k].id}"][availability="remote"]`
              );
              calc = document.querySelectorAll(
                `[calc="${product[k].id}"][availability="remote"]`
              );

              if (calc[0].style.display == "none") {
                openCalcBtn[0].style.display = "none";
                calc[0].style.display = "";
              }
            }

            if (way.total > 0) {
              openCalcBtn = document.querySelectorAll(
                `[openCalcBtn="${product[k].id}"][availability="way"]`
              );
              calc = document.querySelectorAll(
                `[calc="${product[k].id}"][availability="way"]`
              );

              if (calc[0].style.display == "none") {
                openCalcBtn[0].style.display = "none";
                calc[0].style.display = "";
              }
            }

            /* */
            tab = document.querySelectorAll(`[tab="${this.catalog[i].id}"]`);
            tabBtn = document.querySelectorAll(
              `[tabBtn="${this.catalog[i].id}"]`
            );
            triagleTab = document.querySelectorAll(
              `[triagleTab="${this.catalog[i].id}"]`
            );

            if (tab[0].style.display == "none") {
              tabBtn[0].classList.add("ui-accordion-header-active");
              tab[0].style.display = "";
              triagleTab[0].className =
                "ui-accordion-header-icon ui-icon ui-icon-triangle-1-s";
            }

            panel = document.querySelectorAll(`[panel="${list[j].id}"]`);
            panelBtn = document.querySelectorAll(`[panelBtn="${list[j].id}"]`);
            triaglePanel = document.querySelectorAll(
              `[triaglePanel="${list[j].id}"]`
            );

            // console.log(panel[0].style.display)
            if (panel[0].style.display == "none") {
              panelBtn[0].classList.add("ui-accordion-header-active");
              panel[0].style.display = "block";
              triaglePanel[0].className =
                "ui-accordion-header-icon ui-icon ui-icon-triangle-1-s";
            }
          }
        }
      }
    },

    // окрыть калькулятор у открытых объектов
    openCalcSelectedProducts: async function () {
      for (var i in this.catalog) {
        list = this.catalog[i].id_product_list;
        for (var j in list) {
          product = list[j].id_product;
          for (var k in product) {
            remote = product[k].remote;
            way = product[k].way;
            stock = product[k].stock;

            if (stock.total > 0) {
              openCalcBtn = document.querySelectorAll(
                `[openCalcBtn="${product[k].id}"][availability="stock"]`
              );
              calc = document.querySelectorAll(
                `[calc="${product[k].id}"][availability="stock"]`
              );

              if (calc[0].style.display == "none") {
                openCalcBtn[0].style.display = "none";
                calc[0].style.display = "";
              }
            }

            if (remote.total > 0) {
              openCalcBtn = document.querySelectorAll(
                `[openCalcBtn="${product[k].id}"][availability="remote"]`
              );
              calc = document.querySelectorAll(
                `[calc="${product[k].id}"][availability="remote"]`
              );

              if (calc[0].style.display == "none") {
                openCalcBtn[0].style.display = "none";
                calc[0].style.display = "";
              }
            }

            if (way.total > 0) {
              openCalcBtn = document.querySelectorAll(
                `[openCalcBtn="${product[k].id}"][availability="way"]`
              );
              calc = document.querySelectorAll(
                `[calc="${product[k].id}"][availability="way"]`
              );

              if (calc[0].style.display == "none") {
                openCalcBtn[0].style.display = "none";
                calc[0].style.display = "";
              }
            }
          }
        }
      }
    },
    // заррыть все кнопки меню
    closedCatBtns: function () {
      btns = document.querySelectorAll('[type="mainProduct"]');

      // кнопки в каталоге (catalog.html)
      btnsCatalog = document.querySelectorAll('[type="mainProductCatalog"]');

      for (var i in btns) {
        btn = btns[i];
        btnCat = btnsCatalog[i];
        btnCat.className = `btn-reset menu__link`;
        btn.className = `btn-reset sidebar__btn sidebar__btn--sub`;
      }
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
      this.products = {};
      this.basket = [];
      this.catalog = [];
      this.total = { total: 0, stock: 0, remote: 0, way: 0 };
      this.openedMainProduct = [];
      this.closedCatBtns();

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
      for (var j in this.products) {
        if (id in this.products[j]) {
          product = this.products[j][id];
          // count
          this.products[j][id][availability].count = 0;
          count = this.products[j][id][availability].count;

          // total
          this.products[j][id][availability].total = product.price * count;
          total = this.products[j][id][availability].total;

          // block
          this.products[j][id][availability].block =
            (count / product.carton) | 0;
          block = this.products[j][id][availability].block;

          // remainder
          this.products[j][id][availability].remainder =
            count - block * product.carton;
        }
      }
      // расчет тоталов
      this.totalCalculate();

      // констроль состояния корзины
      this.basketController();
    },

    // calc в BASKET
    calcPlusBusket: function (id, availability) {
      for (var j in this.products) {
        if (id in this.products[j]) {
          if (
            this.products[j][id][availability].count <
            this.products[j][id][availability].availability
          ) {
            product = this.products[j][id];
            // count
            this.products[j][id][availability].count += 1;
            count = this.products[j][id][availability].count;

            // total
            this.products[j][id][availability].total = product.price * count;
            total = this.products[j][id][availability].total;

            // block
            this.products[j][id][availability].block =
              (count / product.carton) | 0;
            block = this.products[j][id][availability].block;

            // remainder
            this.products[j][id][availability].remainder =
              count - block * product.carton;
          }
        }
      }

      this.totalCalculate();

      // констроль состояния корзины
      this.basketController();
    },

    calcMinusBusket: function (id, availability) {
      for (var j in this.products) {
        if (id in this.products[j]) {
          product = this.products[j][id];
          // count
          this.products[j][id][availability].count -= 1;
          count = this.products[j][id][availability].count;

          // total
          this.products[j][id][availability].total = product.price * count;
          total = this.products[j][id][availability].total;

          // block
          this.products[j][id][availability].block =
            (count / product.carton) | 0;
          block = this.products[j][id][availability].block;

          // remainder
          this.products[j][id][availability].remainder =
            count - block * product.carton;
        }
      }

      this.totalCalculate();

      // констроль состояния корзины
      this.basketController();
    },

    calcInputBusket: function (id, availability) {
      calcInput = document.querySelectorAll(
        `[calcInput="${id}"][availability="${availability}"]`
      );
      // console.log(calcInput);

      for (var j in this.products) {
        if (id in this.products[j]) {
          product = this.products[j][id];
          // count

          count = this.products[j][id][availability].count;

          if (calcInput.length == 2) {
            count = Number(calcInput[1].value);
          } else {
            count = Number(calcInput[0].value);
          }

          if (count > this.products[j][id][availability].availability) {
            count = this.products[j][id][availability].availability;

            if (calcInput.length == 2) {
              calcInput[1].value = count;
            } else {
              calcInput[0].value = count;
            }
          }

          this.products[j][id][availability].count = count;

          // total
          this.products[j][id][availability].total = product.price * count;

          // block
          this.products[j][id][availability].block =
            (count / product.carton) | 0;
          block = this.products[j][id][availability].block;

          // remainder
          this.products[j][id][availability].remainder =
            count - block * product.carton;
        }
      }

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

    // Рендер продуктов полсе фильтрации отнссительно их наличия в products
    catalogProcessingAfterFilter: async function (newCatalog) {
      for (var i in this.products) {
        for (var d in this.products[i]) {
          product = this.products[i][d];

          for (var s in newCatalog) {
            mainProduct = newCatalog[s];
            for (var j in mainProduct.id_product_list) {
              productList = mainProduct.id_product_list[j];
              for (var k in productList.id_product) {
                idProduct = productList.id_product[k];
                if (idProduct.id == product.id) {
                  // idProduct = product

                  // STOCK
                  newCatalog[s].id_product_list[j].id_product[k].stock.total =
                    product.stock.total;
                  newCatalog[s].id_product_list[j].id_product[k].stock.count =
                    product.stock.count;
                  newCatalog[s].id_product_list[j].id_product[
                    k
                  ].stock.remainder = product.stock.remainder;
                  newCatalog[s].id_product_list[j].id_product[k].stock.block =
                    product.stock.block;

                  // WAY
                  newCatalog[s].id_product_list[j].id_product[k].way.total =
                    product.way.total;
                  newCatalog[s].id_product_list[j].id_product[k].way.count =
                    product.way.count;
                  newCatalog[s].id_product_list[j].id_product[k].way.remainder =
                    product.way.remainder;
                  newCatalog[s].id_product_list[j].id_product[k].way.block =
                    product.way.block;

                  // REMOTE
                  newCatalog[s].id_product_list[j].id_product[k].remote.total =
                    product.remote.total;
                  newCatalog[s].id_product_list[j].id_product[k].remote.count =
                    product.remote.count;
                  newCatalog[s].id_product_list[j].id_product[
                    k
                  ].remote.remainder = product.remote.remainder;
                  newCatalog[s].id_product_list[j].id_product[k].remote.block =
                    product.remote.block;
                }
              }
            }
          }
        }
      }

      this.catalog = newCatalog;

      // фильтрация каталога
      this.catalog.sort((a, b) => {
        if (a.color > b.color) {
          return 1;
        }
        if (a.color < b.color) {
          return -1;
        }
        if (a.color === b.color) {
          if (a.id > b.id) {
            return 1;
          }
          if (a.id < b.id) {
            return -1;
          }
        }
        return 0;
      });

    },

    // ререндкр каталога после фильтрации
    renderCatalogFilter: async function () {
      data = this.catalogDataFilter;
      openedIds = this.openedMainProduct;
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

      await this.catalogProcessingAfterFilter(newCatalog);

      await this.openSelectedProducts();
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
      this.products = {};
      this.basket = [];
      this.catalog = [];
      this.total = { total: 0, stock: 0, remote: 0, way: 0 };
      this.openedMainProduct = [];
      this.closedCatBtns();
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
    // получить ифнормацию о товаре
    getOrderInfo: async function (id) {
      orderInfo = await this.getData(`/api/v1/OrderById/${id}`);
      order = orderInfo[0].items;

      for (var i in order) {
        category = await this.getCategoryById(i);
        this.orderCategories[i] = {
          color: category[0].color,
          name: category[0].name,
          id: category[0].id,
        };
      }

      this.orderNumber = orderInfo[0].number;
      this.order = order;
    },

    // склонения блоков
    pluralizeBlocks: function (numBlocks) {
      // Используем остаток от деления на 10 и на 100 для определения правильного склонения
      const lastDigit = numBlocks % 10;
      const lastTwoDigits = numBlocks % 100;

      if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        // Если число заканчивается на 11-19, то используем форму "блоков"
        return "блоков";
      } else if (lastDigit === 1) {
        // Если число заканчивается на 1, то используем форму "блок"
        return "блок";
      } else if (lastDigit >= 2 && lastDigit <= 4) {
        // Если число заканчивается на 2-4, то используем форму "блока"
        return "блока";
      } else {
        // Во всех остальных случаях используем форму "блоков"
        return "блоков";
      }
    },

    /** ЕСЛИ ВЫБРАН ФИЛЬТР ПО NEW TOP SALE НАЖАТИЕ НА КАТЕГОРИЮ ОТКРЫЫАЕТ ПРОДУКТЫ */

    // добавляем рподукты
    addProduct: async function (category) {
      for (let i in this.mainCategory) {
        if (this.mainCategory[i].id == category) {
          let products = this.mainCategory[i].id_main_product
          for (let product of products) {
            await this.getProductsByMainProduct(product.id, category)
          }
        }
      }
    },

    // подсвечиваем кнопки
    lightButton: async function (catId) {
      for (let productlist of this.catalog) {
        btns = document.querySelectorAll('[type="mainProduct"]');

        // кнопки в каталоге (catalog.html)
        btnsCatalog = document.querySelectorAll('[type="mainProductCatalog"]');

        // кнопка категории
        catBtn = document.querySelectorAll(`[category="${catId}"]`)[0];

        // кнопки закрыть
        closeBtns = document.querySelectorAll(`[element="close"]`);

        for (var i in btns) {
          btn = btns[i];
          btnCat = btnsCatalog[i];
          closeBtn = closeBtns[i];
          if (btn.id == productlist.id) {
            color = btn.getAttribute("color");

            btn.className = `btn-reset sidebar__btn sidebar__btn--sub sidebar__btn--active sidebar__btn--active-${color}`;
            btnCat.className = `btn-reset menu__link menu__link--active menu__link--active-${color}`;

            // подсветка категории
            catBtn.className = `btn-reset sidebar__btn sidebar__accordion accordion-header accordion-header--${color} ui-accordion-header ui-corner-top ui-state-default ui-accordion-icons ui-sortable-handle ui-accordion-header-active ui-state-active`;

            catBtn.getElementsByTagName("span")[0].className =
              "ui-accordion-header-icon ui-icon ui-icon-triangle-1-s";
            catBtn.setAttribute("aria-expanded", "true");
            catBtn.setAttribute("aria-selected", "true");

            // показываем кнопку
            closeBtn.style.display = "";
          }
        }
      }
    },

    // отрабытывает при нажатии
    addProductFromMainCategory: async function (category) {
      if (!this.openedMainCategory.includes(category)) {

        if (this.status.length > 0) {

          await this.addProduct(category);

          await this.lightButton(category);

        }
        this.openedMainCategory.push(category);

      } else {
        // console.log(1)
        this.openedMainCategory = this.openedMainCategory.filter(function (
          f
        ) {
          return f !== category;
        });

        if (category in this.categoryStructure) {
          if (this.categoryStructure[category].length) {
            let btn = document.querySelectorAll(`[category="${category}"]`)[0]
            let color = btn.getAttribute('color');
            // console.log(color);
            btn.classList.add(`sidebar__btn--active-${color}`);

            // document.querySelectorAll(`[category="${category}"]`)[0].classList.add('ui-accordion-header-active');

          } else {
            // console.log('non style')
            document.querySelectorAll(`[category="${category}"]`)[0].className = 'btn-reset sidebar__btn sidebar__accordion accordion-header accordion-header--blue ui-accordion-header ui-corner-top ui-state-default ui-accordion-icons ui-sortable-handle ui-accordion-header-collapsed ui-corner-all';
          }

        }
      }
    }

    /* ------------------- */
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

    let mainCategory = await this.getData('/api/v1/MainCategory/')
    this.mainCategory = mainCategory;

  },
  // отслеживаем календарь
  created() {
    const onClickCalendar = (e) => {
      item = e.target;
      className = e.target.classList;
      // console.log(className)
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
      } else if (className.value.length == 0) {
        this.from = null;
        this.to = null;
        this.OrderFilter();
      }
    };
    document.addEventListener("click", onClickCalendar);
  },
  watch: {
    openedMainProduct() {
      for (let id of this.openedMainProduct) {
        let openedMainProduct = document.querySelectorAll(
          `[type="mainProduct"][id="${id}"]`
        );

        if (openedMainProduct.length > 0) {
          for (let openedMP of openedMainProduct) {
            let panel = openedMP.parentNode.parentNode.parentNode;
            let categoryBtn = panel.parentNode;

            // panel.style.display = "block";
            // panel.className =
            //   "sidebar__panel ui-accordion-content ui-corner-bottom ui-helper-reset ui-widget-content ui-accordion-content-active";

            // categoryBtn.className = 'btn-reset sidebar__btn sidebar__accordion accordion-header accordion-header--blue ui-accordion-header ui-corner-top ui-state-default ui-accordion-icons ui-sortable-handle ui-accordion-header-active ui-state-active'
          }
        }
      }
    },
    currentScreenMain() {
      if (this.currentScreenMain != 'screenCatalogMain') {
        document.getElementById('btnMenu').style.display = ''
        document.getElementById('btnMenuPopup').style.display = 'none'
        document.getElementById('btnMenuPopupClose').style.display = 'none'
      } else {
        document.getElementById('btnMenu').style.display = 'none'
        document.getElementById('btnMenuPopup').style.display = ''
        document.getElementById('btnMenuPopupClose').style.display = ''

      }
    }
  },
});
