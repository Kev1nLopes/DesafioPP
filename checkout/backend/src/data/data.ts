

export class CellShop {
    products: { id: number; name: string; price: number; stock: number; }[];

    constructor() {
        this.products = [
            { id: 1, name: "Capinha iPhone 13", price: 39.9, stock: 5 },
            { id: 2, name: "Capinha Samsung S22", price: 34.9, stock: 0 },
        ];
    }


    decrementStock(productId: number, quantity: number): boolean {
        const product = this.products.find(p => p.id === productId);
        if (product && product.stock >= quantity) {
            product.stock -= quantity;
            return true;
        }
        return false;
    }

    getProductById(productId: number) {
        return this.products.find(p => p.id === productId);
    }
}