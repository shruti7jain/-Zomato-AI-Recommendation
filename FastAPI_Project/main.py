from fastapi import FastAPI
from models import Product
app=FastAPI()

@app.get("/")
def greet():
    return "Welcome to first FastAPI project"

products=[
    Product(id=1,name="Raj",description="ABCD", price=1024.12, quantity=78),
    Product(id=2,name="Ram",description="arfd", price=10.35, quantity=145),
    Product(id=3,name="Ravi",description="qwxf", price=15.54, quantity=0),
    Product(id=4,name="Rj",description="asvg0", price=2000.23, quantity=12)

]

@app.get("/products")
def get_all_products():
    return products