import { ObjectId } from 'mongodb';

export interface User {
  _id: ObjectId;
  email: string;
  passwordHash: string;
  role: 'admin' | 'customer';
  name: string;
  createdAt: Date;
}

export interface Product {
  _id: ObjectId;
  name: string;
  description: string;
  price: number; // cents
  stock: number;
  category: string;
  active: boolean;
}

export interface CartItem {
  productId: ObjectId;
  name: string;
  qty: number;
  unitPrice: number; // cents
}

export interface Cart {
  _id: ObjectId;
  customerId: ObjectId;
  items: CartItem[];
  updatedAt: Date;
}

export interface OrderItem {
  productId: ObjectId;
  name: string;
  qty: number;
  unitPrice: number; // cents
}

export interface Order {
  _id: ObjectId;
  customerId: ObjectId;
  items: OrderItem[];
  total: number; // cents
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  stripeSessionId: string | null;
  createdAt: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'customer';
  name: string;
}
