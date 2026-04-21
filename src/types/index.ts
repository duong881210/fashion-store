export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  addresses: IAddress[];
}

export interface IAddress {
  _id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  images: string[];
  variants: IProductVariant[];
  categories: ICategory[];
  reviews: IReview[];
}

export interface IProductVariant {
  _id: string;
  color: string;
  sizes: ISizeStock[];
}

export interface ISizeStock {
  _id: string;
  size: string;
  stock: number;
  price: number;
}

export interface IOrder {
  _id:string;
  user: IUser;
  items: IOrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: IAddress;
  paymentMethod: string;
  paymentResult: object;
}

export interface IOrderItem {
  product: IProduct;
  variant: IProductVariant;
  size: ISizeStock;
  quantity: number;
  price: number;
}

export interface ICart {
  items: ICartItem[];
  total: number;
}

export interface ICartItem {
  product: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
}

export interface ICategory {
  _id: string;
  name: string;
  description: string;
}

export interface IReview {
  _id: string;
  user: IUser;
  rating: number;
  comment: string;
}

export interface IChatMessage {
  _id: string;
  sender: IUser;
  receiver: IUser;
  message: string;
  timestamp: Date;
}
