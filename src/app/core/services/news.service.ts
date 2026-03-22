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

  /**
   * Noticias: menos de 1 h en minutos, mismo día "Hoy", día anterior "Ayer",
   * fechas más antiguas con formato local (ej. 15 mar 2026).
   */
  getRelativeDateLabel(date: string): string {
    if (!date) return '';

    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return date;

    const t = this.i18nService.getTranslations();
    const lang = this.i18nService.selectedLanguage().code;
    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - parsed.getTime());
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);

    if (diffSec < 60) return t.newsDateJustNow;
    if (diffMin < 60) {
      if (diffMin === 1) return t.newsDateOneMinuteAgo;
      return t.newsDateMinutesAgo.replace('{{n}}', String(diffMin));
    }

    if (this.sameLocalCalendarDay(parsed, now)) return t.newsDateToday;

    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    if (this.sameLocalCalendarDay(parsed, y)) return t.newsDateYesterday;

    const locale = lang === 'en' ? 'en-US' : 'es-ES';
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(parsed);
  }

  private sameLocalCalendarDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
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
