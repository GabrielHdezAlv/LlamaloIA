import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NewsItem } from '../../shared/models/news.model';
import { I18nService } from './i18n.service';

@Injectable({
    providedIn: 'root'
})
export class NewsService {
    private platformId = inject(PLATFORM_ID);
    private STORAGE_KEY = 'llamalo_news';

    constructor(private i18nService: I18nService) { }

    private initialNews: NewsItem[] = [
        {
            id: '1',
            title: {
                es: 'Motor de Voz Ultra-Rápido',
                en: 'Ultra-Fast Voice Engine'
            },
            description: {
                es: 'Latencia reducida en un 40%.',
                en: 'Latency reduced by 40%.'
            },
            imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=160&h=100&fit=crop',
            date: 'Hoy'
        },
        {
            id: '2',
            title: {
                es: 'Comunidad Discord',
                en: 'Discord Community'
            },
            description: {
                es: 'Únete a miles de desarrolladores y mejora tus agentes.',
                en: 'Join thousands of developers and improve your agents.'
            },
            imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=160&h=100&fit=crop',
            date: 'Ayer'
        },
        {
            id: '3',
            title: {
                es: 'Nueva Integración',
                en: 'New Integration'
            },
            description: {
                es: 'Conecta Llamalo IA con Slack y Telegram de forma nativa.',
                en: 'Connect Llamalo IA with Slack and Telegram natively.'
            },
            imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=160&h=100&fit=crop',
            date: 'Hace 3 días'
        },
        {
            id: '4',
            title: {
                es: 'Mejoras de Velocidad',
                en: 'Speed Improvements'
            },
            description: {
                es: 'Hemos optimizado nuestros servidores para una latencia mínima.',
                en: 'We have optimized our servers for minimum latency.'
            },
            imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=160&h=100&fit=crop',
            date: 'Hace 1 semana'
        }
    ];

    newsSignal = signal<NewsItem[]>(this.loadNews());

    private loadNews(): NewsItem[] {
        if (!isPlatformBrowser(this.platformId)) {
            return this.initialNews;
        }

        const storedNews = localStorage.getItem(this.STORAGE_KEY);
        if (!storedNews) {
            return this.initialNews;
        }

        try {
            const parsedNews = JSON.parse(storedNews);
            
            // Verificar si las noticias tienen el formato antiguo (strings) o nuevo (objetos)
            if (parsedNews.length > 0 && typeof parsedNews[0].title === 'string') {
                // Migrar formato antiguo a nuevo
                const migratedNews = parsedNews.map((news: any) => {
                    // Función para detectar idioma y asignar correctamente
                    const assignLanguage = (text: string) => {
                        // Heurística simple para detectar español
                        const spanishWords = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'como', 'las', 'del', 'los', 'una', 'mi', 'me', 'si', 'ya', 'muy', 'más', 'este', 'esta', 'esto', 'estos', 'estas'];
                        const words = text.toLowerCase().split(' ');
                        const spanishCount = words.filter(word => spanishWords.includes(word)).length;
                        
                        if (spanishCount > words.length * 0.1) { // Si más del 10% son palabras españolas
                            return { es: text, en: '' };
                        } else {
                            return { es: '', en: text };
                        }
                    };
                    
                    return {
                        ...news,
                        title: assignLanguage(news.title || ''),
                        description: assignLanguage(news.description || '')
                    };
                });
                
                // Guardar el formato migrado
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(migratedNews));
                return migratedNews;
            }
            
            return parsedNews;
        } catch (error) {
            console.error('Error loading news:', error);
            return this.initialNews;
        }
    }

    getNews() {
        return this.newsSignal();
    }

    getTranslatedNews() {
        const currentLang = this.i18nService.getCurrentLanguage().code;
        return this.newsSignal().map(news => ({
            ...news,
            title: news.title[currentLang as keyof typeof news.title] || news.title.es,
            description: news.description[currentLang as keyof typeof news.description] || news.description.es
        }));
    }

    saveNews(news: NewsItem[]) {
        this.newsSignal.set(news);
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(news));
        }
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
