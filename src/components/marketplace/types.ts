export interface Bot {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  rentPrice: number;
  rating: number;
  users: number;
  icon: string;
  features: string[];
}

export const categories = ['Все', 'Продажи', 'Поддержка', 'HR', 'Маркетинг', 'Финансы', 'Сервис'];
