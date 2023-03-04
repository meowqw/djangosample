from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class Product(models.Model):
    
    def availability_stock_default():
        return {"availability": 0, "total": 0, "count": 0, "block": 0, "remainder": 0, "name": "В наличии", "color": ""}
    
    def availability_way_default():
        return {"availability": 0, "total": 0, "count": 0, "block": 0, "remainder": 0, 'name': 'В пути', 'color': 'blue'}
    
    def availability_remote_default():
        return {"availability": 0, "total": 0, "count": 0, "block": 0, "remainder": 0, 'name': 'Удаленный склад', 'color': 'orange'}
    
    
    PRODUCT_STATUS = (
        ('TOP', 'TOP'),
        ('NEW', 'NEW'),
        ('SALE', 'SALE'),
    )
    
    name = models.CharField(max_length=400, blank=True)
    status = models.CharField(max_length=20, choices=PRODUCT_STATUS)
    
    # наличие / остаток
    stock = models.JSONField(default=availability_stock_default)
    way = models.JSONField(default=availability_way_default)
    remote = models.JSONField(default=availability_remote_default)
    
    price = models.IntegerField(null=True, blank=True)
    
    img = models.ImageField(upload_to="media/")

    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = 'Товар'
        verbose_name_plural = 'Товары'
        
class ProductList(models.Model):
    WEIGHT = (
        ('10', '10'),
        ('100', '100'),
        ('1000', '1000'),
        ('10000', '10000'),
        
    )
    
    
    name = models.CharField(max_length=200, blank=True)
    carton = models.IntegerField(null=True, blank=True)
    rrc = models.IntegerField(null=True, blank=True)
    weight = models.CharField(max_length=20, choices=WEIGHT)
    id_product = models.ManyToManyField(Product)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = 'Список продуктов'
        verbose_name_plural = 'Список продуктов'
        

class MainProduct(models.Model):
    name = models.CharField(max_length=200, blank=True)
    id_product_list = models.ManyToManyField(ProductList)
    color = models.CharField(max_length=200, blank=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = 'Основной продукт'
        verbose_name_plural = 'Основной продукт'
    
    
class MainCategory(models.Model):
    name = models.CharField(max_length=200, blank=True)
    color = models.CharField(max_length=200, blank=True)
    id_main_product = models.ManyToManyField(MainProduct)
    
    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории товаров'
        

class Banners(models.Model):
    name = models.CharField(max_length=200, blank=True)
    img = models.ImageField(upload_to="media/")
    
    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Банеры'
        verbose_name_plural = 'Банеры'
        
        
class Account(models.Model):
    """User account data"""
    name = models.CharField('Имя', max_length=300)
    phone = models.CharField('Телефон', max_length=300)
    email = models.CharField('Почта', max_length=300)
    agents = models.CharField('Контрагенты', max_length=300)
    address = models.CharField('Адреса', max_length=300)

    user = models.ForeignKey(User, on_delete=models.PROTECT, null=True)

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        
        
class DeliveryAddresses(models.Model):
    """Addresses for delivery"""
    address = models.CharField('Адрес', max_length=300)
    time_create = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.address
    
    class Meta:
        verbose_name = 'Адрес доставки'
        verbose_name_plural = 'Адреса доставки'
        
        
class Order(models.Model):
    "Orders that the user has confirmed"
    PAYMENT_STATUS = (
        ('PAID', 'Оплачен'),
        ('NOTPAID', 'Не оплачен'),
        ('PART', 'Частично'),
    )
    ORDER_STATUS = (
        ('INPROCESSING', 'В обработке'),
        ('SHIPMENT', 'В процессе отгрузки'),
        ('DELIVERED', 'Доставлен'),
    )
    WAYGET = (
        ('DELIVERY', 'Доставка'),
        ('PICKUP', 'Савывоз'),
    )
    PAYMENT_METHOD = (
        ('CASH', 'Наличными'),
        ('CHECK', 'Расчетный счет'),
    )
        
    
    user = models.ForeignKey(User, on_delete=models.PROTECT, null=True)
    number = models.CharField('Номер заказа', max_length=300)
    items = models.JSONField("Ордер лист", null=True, blank=True)
    payment_status = models.CharField(max_length=100, choices=PAYMENT_STATUS)
    order_status = models.CharField(max_length=100, choices=ORDER_STATUS)
    address = models.ForeignKey(DeliveryAddresses, on_delete=models.PROTECT, null=True)
    comment = models.TextField('Комментарий', null=True, blank=True)
    total = models.IntegerField('Цена', blank=True)
    payment_method = models.CharField(max_length=100, choices=PAYMENT_METHOD)
    way_get = models.CharField(max_length=100, choices=WAYGET)
    debt = models.IntegerField('Задолжность (если есть)', null=True, blank=True)
    time_create = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.number

    class Meta:
        verbose_name = 'Заказ'
        verbose_name_plural = 'Заказы'