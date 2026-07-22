import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogService } from '../../core/services/catalog.service';
import { Category, Playlist } from '../../core/models/catalog';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <section class="block" style="padding-top: 48px;">
      <div class="block-inner">
        <h1>Tous les cours</h1>
        <p style="color: var(--ink-muted); margin-bottom: 24px;">Explorez notre catalogue complet de playlists, organisées par catégorie.</p>

        <div class="filter-pills" style="margin-bottom: 32px;">
          <button class="pill" [class.active]="activeFilter() === null" (click)="setFilter(null)">Tout</button>
          <button class="pill" *ngFor="let cat of categories()" [class.active]="activeFilter() === cat.key" (click)="setFilter(cat.key)">{{ cat.label }}</button>
        </div>

        <div *ngFor="let cat of filteredCategories()">
          <h3 style="margin-bottom: 16px; font-size: 18px;">{{ cat.label }}</h3>
          <div class="video-grid" style="margin-bottom: 32px;">
            <div class="video-card" *ngFor="let playlist of playlistsByCategory(cat.id)">
              <div class="video-thumb" [style.background]="playlist.thumbnailUrl ? 'url(' + playlist.thumbnailUrl + ')' : 'color-mix(in oklch, ' + getCategoryColor(cat.key) + ' 20%, var(--bg-card))'">
                <div *ngIf="!playlist.thumbnailUrl" style="width:100%;height:100%;background:repeating-linear-gradient(135deg, transparent 0 12px, color-mix(in oklch, ' + getCategoryColor(cat.key) + ' 14%, transparent) 12px 13px)"></div>
              </div>
              <div class="video-body">
                <div class="video-cat" [style.color]="getCategoryColor(cat.key)">{{ cat.label }}</div>
                <div class="video-title">{{ playlist.title }}</div>
                <div style="font-size: 12px; color: var(--ink-faint); margin-top: 8px;">{{ playlist.videoCount }} vidéos</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <app-footer></app-footer>
    <button class="theme-toggle" (click)="toggleTheme()" title="Changer de thème">◐</button>
  `,
  styles: [`
    :host { display: block; }
    h1 {
      font-family: var(--font-display); font-weight: 700;
      font-size: clamp(28px, 3vw, 42px); margin-bottom: 16px;
    }
    .block { padding: 0 48px 88px; }
    .block-inner { max-width: 1200px; margin: 0 auto; }
    .filter-pills {
      display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 32px;
    }
    .pill {
      background: var(--bg-card); border: 1px solid var(--border); color: var(--ink);
      padding: 8px 16px; border-radius: 20px; cursor: pointer; font-weight: 600;
      transition: background 0.15s, border-color 0.15s;
    }
    .pill:hover { background: var(--bg-card-hover); }
    .pill.active { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
    h3 { font-family: var(--font-display); font-weight: 700; font-size: 18px; margin-bottom: 16px; }
    .video-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    @media (max-width: 980px) { .video-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 560px) { .video-grid { grid-template-columns: 1fr; } }
    .video-card {
      background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden;
      transition: transform 0.15s, border-color 0.15s; cursor: pointer;
    }
    .video-card:hover { transform: translateY(-2px); border-color: color-mix(in oklch, var(--border) 40%, var(--ink)); }
    .video-thumb {
      aspect-ratio: 16/9; position: relative; overflow: hidden;
      display: flex; align-items: flex-end; padding: 10px;
      background-size: cover; background-position: center;
    }
    .video-body { padding: 14px 16px 16px; }
    .video-cat {
      font-family: var(--font-mono); font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
      margin-bottom: 8px;
    }
    .video-title { font-family: var(--font-display); font-weight: 600; font-size: 14.5px; line-height: 1.35; }
    .theme-toggle {
      position: fixed; bottom: 20px; right: 72px; z-index: 30;
      width: 40px; height: 40px; border-radius: 50%;
      background: var(--bg-card); border: 1px solid var(--border); color: var(--ink);
      cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center;
    }
    .theme-toggle:hover { background: var(--bg-card-hover); }
  `]
})
export class CoursesComponent implements OnInit {
  categories = signal<Category[]>([]);
  playlists = signal<Playlist[]>([]);
  activeFilter = signal<string | null>(null);

  constructor(private catalog: CatalogService) {}

  ngOnInit() {
    this.catalog.getCategories().subscribe(cats => this.categories.set(cats));
    this.catalog.getPlaylists().subscribe(p => this.playlists.set(p));
  }

  setFilter(key: string | null) {
    this.activeFilter.set(key);
  }

  filteredCategories(): Category[] {
    const cats = this.categories();
    if (!this.activeFilter()) return cats;
    return cats.filter(c => c.key === this.activeFilter());
  }

  playlistsByCategory(catId: string): Playlist[] {
    return this.playlists().filter(p => p.categoryId === catId);
  }

  getCategoryColor(key: string): string {
    const colors: Record<string, string> = { web: 'var(--web)', mobile: 'var(--mobile)', cyber: 'var(--cyber)', data: 'var(--data)', algo: 'var(--algo)' };
    return colors[key] || 'var(--web)';
  }

  toggleTheme() {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    root.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
  }
}
