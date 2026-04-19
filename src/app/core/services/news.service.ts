import { Injectable, signal, computed, inject, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NewsItem } from '../../shared/models/news.model';
import { I18nService } from './i18n.service';
import { environment } from '../../../environments/environment';
import { UserStorage } from '../../storages/user/user-storage';

/** Id fijo para el aviso de cupo mensual agotado (no coincide con noticias del API). */
export const OUT_OF_MINUTES_NEWS_ID = '__llamalo_out_of_minutes__';

@Injectable({
    providedIn: 'root'
})
export class NewsService {
    private http = inject(HttpClient);
    private platformId = inject(PLATFORM_ID);
    private userStorage = inject(UserStorage);
    private apiUrl = `${environment.apiUrl}/news`;
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
        const base = this.newsSignal().map(news => ({
            ...news,
            title: news.title[currentLang as keyof typeof news.title] || news.title.es,
            description: news.description[currentLang as keyof typeof news.description] || news.description.es
        }));
        const outOfMinutes = this.buildOutOfMinutesTranslatedItem();
        if (outOfMinutes) {
            return [outOfMinutes, ...base];
        }
        return base;
    });

    /**
     * Plan no premium y 0 minutos restantes en el mes UTC (alineado con `minute-quota` / Firestore).
     */
    private buildOutOfMinutesTranslatedItem(): {
        id: string;
        title: string;
        description: string;
        imageUrl: string;
        date: string;
        link?: string;
    } | null {
        const u = this.userStorage.user();
        if (!u) return null;
        const plan = (u.plan ?? '').toLowerCase();
        if (plan === 'premium') return null;

        const month = new Date().toISOString().slice(0, 7);
        const usedRaw = u.minutesByMonth?.[month];
        const used =
            typeof usedRaw === 'number' && !Number.isNaN(usedRaw) ? usedRaw : 0;
        const planLimit = u.minutesLimit ?? 100;
        const extra = u.extraMinutes ?? 0;
        const total = planLimit + extra;
        const remaining = Math.max(0, total - used);
        if (remaining > 0) return null;

        const t = this.i18nService.getTranslations();
        return {
            id: OUT_OF_MINUTES_NEWS_ID,
            title: t.outOfMinutesBannerTitle,
            description: t.outOfMinutesBannerDesc,
            imageUrl:
                'https://images.unsplash.com/photo-1551434678-e076c223a692?w=320&h=200&fit=crop',
            date: new Date().toISOString(),
    };
    }

  /**
   * Noticias: minutos si es reciente, horas si es hoy pero hace más de 1 h (así se distinguen varias noticias del mismo día),
   * "Ayer" si el día local es el anterior, fecha completa si es más antigua.
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

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (this.sameLocalCalendarDay(parsed, yesterday)) return t.newsDateYesterday;

    if (this.sameLocalCalendarDay(parsed, now)) {
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours === 1) return t.newsDateOneHourAgo;
      return t.newsDateHoursAgo.replace('{{n}}', String(diffHours));
    }

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

    /** Crea noticia: el backend asigna `date` en ISO 8601; no enviar `date` desde el cliente. */
    addNews(newsItem: Omit<NewsItem, 'id' | 'date'>) {
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
