import { Injectable, signal } from '@angular/core';
import { NewsItem } from '../../shared/models/news.model';

@Injectable({
    providedIn: 'root'
})
export class NewsService {
    private STORAGE_KEY = 'llamalo_news';

    private initialNews: NewsItem[] = [
        {
            id: '1',
            title: 'Motor de Voz Ultra-Rápido',
            description: 'Latencia reducida en un 40%.',
            imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=160&h=100&fit=crop',
            date: 'Hoy'
        },
        {
            id: '2',
            title: 'Comunidad Discord',
            description: 'Únete a miles de desarrolladores y mejora tus agentes.',
            imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=160&h=100&fit=crop',
            date: 'Ayer'
        },
        {
            id: '3',
            title: 'Nueva Integración',
            description: 'Conecta Llamalo IA con Slack y Telegram de forma nativa.',
            imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=160&h=100&fit=crop',
            date: 'Hace 3 días'
        },
        {
            id: '4',
            title: 'Mejoras de Velocidad',
            description: 'Hemos optimizado nuestros servidores para una latencia mínima.',
            imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=160&h=100&fit=crop',
            date: 'Hace 1 semana'
        }
    ];

    newsSignal = signal<NewsItem[]>(this.loadNews());

    constructor() { }

    private loadNews(): NewsItem[] {
        const storedNews = localStorage.getItem(this.STORAGE_KEY);
        return storedNews ? JSON.parse(storedNews) : this.initialNews;
    }

    getNews() {
        return this.newsSignal();
    }

    saveNews(news: NewsItem[]) {
        this.newsSignal.set(news);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(news));
    }

    addNews(newsItem: Omit<NewsItem, 'id'>) {
        const newId = Math.random().toString(36).substring(2, 9);
        const updatedNews = [...this.newsSignal(), { ...newsItem, id: newId }];
        this.saveNews(updatedNews);
    }

    updateNews(id: string, updatedItem: Partial<NewsItem>) {
        const updatedNews = this.newsSignal().map(item =>
            item.id === id ? { ...item, ...updatedItem } : item
        );
        this.saveNews(updatedNews);
    }

    deleteNews(id: string) {
        const updatedNews = this.newsSignal().filter(item => item.id !== id);
        this.saveNews(updatedNews);
    }
}
