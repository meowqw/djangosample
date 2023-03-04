from rest_framework import serializers
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from main.models import *

        

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
        
class ProductListSerializer(serializers.ModelSerializer):
    id_product = ProductSerializer(many=True)
    
    class Meta:
        model = ProductList
        fields = '__all__'
        
class MainProductSerializer(serializers.ModelSerializer):
    id_product_list = ProductListSerializer(many=True)
    
    class Meta:
        model = MainProduct
        fields = '__all__'
        
class MainCategorySerializer(serializers.ModelSerializer):
    id_main_product = MainProductSerializer(many=True)
    # id_product_list = ProductListSerializer(many=True)
    
    
    class Meta:
        model = MainCategory
        fields = '__all__'
        
class DeliveryAddressesSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryAddresses
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    address = DeliveryAddressesSerializer()
    
    class Meta:
        model = Order
        fields = '__all__'
        
        
