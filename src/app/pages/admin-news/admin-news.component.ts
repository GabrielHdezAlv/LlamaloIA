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
  styleUrls: ['./admin-news.component.scss'],
})
export class AdminNewsComponent implements OnInit {
  private newsService = inject(NewsService);

  newsList = this.newsService.newsSignal;

  editingNews: Partial<NewsItem> | null = null;
  isAdding = false;

  // Form model
  newsForm: Omit<NewsItem, 'id'> = {
    title: { es: '', en: '' },
    description: { es: '', en: '' },
    imageUrl: '',
    // Guardamos una fecha real (ISO) y luego mostramos una etiqueta relativa
    date: new Date().toISOString(),
  };

  isUploadingImage = false;

  ngOnInit() {}

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isUploadingImage = true;
      this.newsService.uploadImage(file).subscribe({
        next: (res) => {
          this.newsForm.imageUrl = res.imageUrl;
          this.isUploadingImage = false;
        },
        error: (err) => {
          console.error('Error subiendo imagen', err);
          this.isUploadingImage = false;
          alert('Error subiendo la imagen');
        },
      });
    }
  }

  startAdding() {
    this.isAdding = true;
    this.editingNews = null;
    this.newsForm = {
      title: { es: '', en: '' },
      description: { es: '', en: '' },
      imageUrl: '',
      date: new Date().toISOString(),
    };
  }

  editNews(news: NewsItem) {
    this.editingNews = { ...news };
    this.isAdding = false;
    this.newsForm = {
      title: {
        es: news.title?.es || '',
        en: news.title?.en || '',
      },
      description: {
        es: news.description?.es || '',
        en: news.description?.en || '',
      },
      imageUrl: news.imageUrl,
      date: news.date,
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
      // Al editar, si un idioma está vacío o es igual al valor original, usar el otro idioma
      const updatedData = {
        ...this.newsForm,
        title: {
          es: this.newsForm.title.es || this.editingNews.title?.es || '',
          en:
            this.newsForm.title.en ||
            this.editingNews.title?.en ||
            this.newsForm.title.es ||
            '',
        },
        description: {
          es:
            this.newsForm.description.es ||
            this.editingNews.description?.es ||
            '',
          en:
            this.newsForm.description.en ||
            this.editingNews.description?.en ||
            this.newsForm.description.es ||
            '',
        },
      };
      this.newsService.updateNews(this.editingNews.id, updatedData);
    }
    this.cancelEdit();
  }

  deleteNews(id: string) {
    if (confirm('¿Estás seguro de que quieres eliminar esta noticia?')) {
      this.newsService.deleteNews(id);
    }
  }

  formatNewsDate(date: string): string {
    return this.newsService.getRelativeDateLabel(date);
  }
}
