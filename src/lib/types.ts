export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  description: string;
  badge?: "New" | "Sale" | "Popular" | "Hot";
  rating: number;
  reviews: number;
  quantity: number;
  sortOrder?: number; // lower = appears first (0 = top)
}


export interface CartItem extends Product {
  quantity: number;
}
