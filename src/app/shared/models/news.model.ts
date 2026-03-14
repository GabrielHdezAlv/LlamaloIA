export interface NewsItem {
  id: string;
  title: {
    es: string;
    en: string;
  };
  description: {
    es: string;
    en: string;
  };
  imageUrl: string;
  date: string;
  link?: string;
}
