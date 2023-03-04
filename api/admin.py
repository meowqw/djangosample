from django.contrib import admin
from main.models import *
# Register your models here.

class ProductListAdmin(admin.ModelAdmin):
    list_display = [field.name for field in ProductList._meta.fields]
    search_fields = list([field.name for field in ProductList._meta.fields])

    filter_horizontal = ()
    list_filter = ()
    fieldsets = ()

class ProductAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Product._meta.fields]
    search_fields = list([field.name for field in Product._meta.fields])

    filter_horizontal = ()
    list_filter = ()
    fieldsets = ()

class MainCategoryAdmin(admin.ModelAdmin):
    list_display = [field.name for field in MainCategory._meta.fields]
    search_fields = list([field.name for field in MainCategory._meta.fields])

    filter_horizontal = ()
    list_filter = ()
    fieldsets = ()

class MainProductAdmin(admin.ModelAdmin):
    list_display = [field.name for field in MainProduct._meta.fields]
    search_fields = list([field.name for field in MainProduct._meta.fields])

    filter_horizontal = ()
    list_filter = ()
    fieldsets = ()
    
class BannersAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Banners._meta.fields]
    search_fields = list([field.name for field in Banners._meta.fields])

    filter_horizontal = ()
    list_filter = ()
    fieldsets = ()
    
class AccountAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Account._meta.fields]
    search_fields = list([field.name for field in Account._meta.fields])

    filter_horizontal = ()
    list_filter = ()
    fieldsets = ()
    
class OrderAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Order._meta.fields]
    search_fields = list([field.name for field in Order._meta.fields])

    filter_horizontal = ()
    list_filter = ()
    fieldsets = ()

class DeliveryAddressesAdmin(admin.ModelAdmin):
    list_display = [field.name for field in DeliveryAddresses._meta.fields]
    search_fields = list([field.name for field in DeliveryAddresses._meta.fields])

    filter_horizontal = ()
    list_filter = ()
    fieldsets = ()


admin.site.register(ProductList, ProductListAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(MainCategory, MainCategoryAdmin)
admin.site.register(MainProduct, MainProductAdmin)
admin.site.register(Banners, BannersAdmin)

admin.site.register(Account, AccountAdmin)
admin.site.register(Order, OrderAdmin)
admin.site.register(DeliveryAddresses, DeliveryAddressesAdmin)

