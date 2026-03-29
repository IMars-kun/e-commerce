export type Role = "USER" | "ADMIN";

export interface Product{
    id: string;
    name: string;
    price: number;
    stock: number;
    images: string[];
    category: Category;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface Category {
    id: string;
    name: string;
}