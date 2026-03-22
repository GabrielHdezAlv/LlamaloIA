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
  /** Fecha/hora de publicación en ISO 8601 (viene del API); las etiquetas "hace X min" se calculan en el cliente. */
  date: string;
  link?: string;
}
