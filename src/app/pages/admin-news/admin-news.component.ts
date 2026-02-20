import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewsService } from '../../core/services/news.service';
import { NewsItem } from '../../shared/models/news.model';

@Component({
    selector: 'app-admin-news',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-news.component.html',
    styleUrls: ['./admin-news.component.scss']
})
export class AdminNewsComponent implements OnInit {
    private newsService = inject(NewsService);

    newsList = this.newsService.newsSignal;

    editingNews: Partial<NewsItem> | null = null;
    isAdding = false;

    // Form model
    newsForm: Omit<NewsItem, 'id'> = {
        title: '',
        description: '',
        imageUrl: '',
        date: 'Hoy'
    };

    ngOnInit() { }

    startAdding() {
        this.isAdding = true;
        this.editingNews = null;
        this.newsForm = {
            title: '',
            description: '',
            imageUrl: '',
            date: 'Hoy'
        };
    }

    editNews(news: NewsItem) {
        this.editingNews = { ...news };
        this.isAdding = false;
        this.newsForm = {
            title: news.title,
            description: news.description,
            imageUrl: news.imageUrl,
            date: news.date
        };
    }

    cancelEdit() {
        this.isAdding = false;
        this.editingNews = null;
    }

    saveNews() {
        if (this.isAdding) {
            this.newsService.addNews(this.newsForm);
        } else if (this.editingNews?.id) {
            this.newsService.updateNews(this.editingNews.id, this.newsForm);
        }
        this.cancelEdit();
    }

    deleteNews(id: string) {
        if (confirm('¿Estás seguro de que quieres eliminar esta noticia?')) {
            this.newsService.deleteNews(id);
        }
    }
}
