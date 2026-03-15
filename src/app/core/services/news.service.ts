import { Injectable, signal, computed, inject, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NewsItem } from '../../shared/models/news.model';
import { I18nService } from './i18n.service';

@Injectable({
    providedIn: 'root'
})
export class NewsService {
    private http = inject(HttpClient);
    private platformId = inject(PLATFORM_ID);
    private apiUrl = 'https://llamaloiabackend-5294.onrender.com/news';
    private isBrowser: boolean;

    constructor(private i18nService: I18nService, @Inject(PLATFORM_ID) platformId: Object) { 
        this.isBrowser = isPlatformBrowser(platformId);
        this.loadNewsFromServer();
    }

    private initialNews: NewsItem[] = [
        {
            id: '1',
            title: { es: 'Motor de Voz Ultra-Rápido', en: 'Ultra-Fast Voice Engine' },
            description: { es: 'Latencia reducida en un 40%.', en: 'Latency reduced by 40%.' },
            imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=160&h=100&fit=crop',
            date: 'Hoy'
        },
        {
            id: '2',
            title: { es: 'Comunidad Discord', en: 'Discord Community' },
            description: { es: 'Únete a miles de desarrolladores y mejora tus agentes.', en: 'Join thousands of developers and improve your agents.' },
            imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=160&h=100&fit=crop',
            date: 'Ayer'
        }
    ];

    newsSignal = signal<NewsItem[]>(this.initialNews);

    private getAuthHeaders(): HttpHeaders {
        let token = '';
        if (this.isBrowser && typeof window !== 'undefined' && window.localStorage) {
            token = localStorage.getItem('token') || '';
        }

        return new HttpHeaders({
            'Content-Type': 'application/json',
            Accept: '*/*',
            Authorization: `Bearer ${token}`,
        });
    }

    private getFileUploadHeaders(): HttpHeaders {
        let token = '';
        if (this.isBrowser && typeof window !== 'undefined' && window.localStorage) {
            token = localStorage.getItem('token') || '';
        }

        return new HttpHeaders({
            Accept: '*/*',
            Authorization: `Bearer ${token}`,
        });
    }

    uploadImage(file: File) {
        if (!this.isBrowser) return new Observable<any>();

        const formData = new FormData();
        formData.append('image', file);

        return this.http.post<{ message: string, imageUrl: string }>(`${this.apiUrl}/image`, formData, {
            headers: this.getFileUploadHeaders()
        });
    }

    private loadNewsFromServer() {
        if (!this.isBrowser) return;
        
        this.http.get<NewsItem[]>(this.apiUrl).subscribe({
            next: (news) => {
                if (news && news.length > 0) {
                    this.newsSignal.set(news);
                } else {
                    // Si no hay noticias, dejamos las initialNews para la demo, o podríamos vaciarlas
                    this.newsSignal.set([]);
                }
            },
            error: (err) => {
                console.error('Error loading news from backend:', err);
                // Fallback a las noticias locales o dejar signal como está
            }
        });
    }

    getNews() {
        return this.newsSignal();
    }

    getTranslatedNews() {
        return this.getTranslatedNewsSignal();
    }

    getTranslatedNewsSignal = computed(() => {
        const currentLang = this.i18nService.selectedLanguage().code;
        return this.newsSignal().map(news => ({
            ...news,
            title: news.title[currentLang as keyof typeof news.title] || news.title.es,
            description: news.description[currentLang as keyof typeof news.description] || news.description.es
        }));
    });

  /** Etiqueta relativa: "hace 2 horas", "hace 20 horas", "hace 1 día", "hace 3 días", etc. */
  getRelativeDateLabel(date: string): string {
    if (!date) return '';

    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return date;

    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - parsed.getTime());
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return 'Justo ahora';
    if (diffMin < 60) return diffMin === 1 ? 'hace 1 minuto' : `hace ${diffMin} minutos`;
    // Menos de 24 h → siempre en horas (2 h, 20 h, 23 h)
    if (diffHours < 24) return diffHours === 1 ? 'hace 1 hora' : `hace ${diffHours} horas`;
    // 1 día o más
    if (diffDays === 1) return 'hace 1 día';
    if (diffDays < 7) return `hace ${diffDays} días`;

    const day = parsed.getDate();
    const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${day} ${monthNames[parsed.getMonth()]}`;
  }

    addNews(newsItem: Omit<NewsItem, 'id'>) {
        if (!this.isBrowser) return;

        this.http.post<NewsItem>(this.apiUrl, newsItem, {
            headers: this.getAuthHeaders()
        }).subscribe({
            next: (createdNews) => {
                this.newsSignal.update(current => [createdNews, ...current]);
            },
            error: (err) => {
                console.error('Error creating news:', err);
            }
        });
    }

    updateNews(id: string, updatedItem: Partial<NewsItem>) {
        if (!this.isBrowser) return;

        this.http.put<NewsItem>(`${this.apiUrl}/${id}`, updatedItem, {
            headers: this.getAuthHeaders()
        }).subscribe({
            next: (updatedNews) => {
                this.newsSignal.update(current => 
                    current.map(item => item.id === id ? { ...item, ...updatedNews } : item)
                );
            },
            error: (err) => {
                console.error('Error updating news:', err);
            }
        });
    }

    deleteNews(id: string) {
        if (!this.isBrowser) return;

        this.http.delete(`${this.apiUrl}/${id}`, {
            headers: this.getAuthHeaders()
        }).subscribe({
            next: () => {
                this.newsSignal.update(current => current.filter(item => item.id !== id));
            },
            error: (err) => {
                console.error('Error deleting news:', err);
            }
        });
    }
}
