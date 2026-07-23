import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { Category, Playlist } from '../../core/models/catalog';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';

@Component({
  selector: 'app-recent',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <section class="block" style="padding-top: 48px;">
      <div class="block-inner">
        <h1>Cours récents</h1>
        <p style="color: var(--ink-muted); margin-bottom: 32px;">
          Les dernières playlists publiées sur TechWall.
          <a routerLink="/courses" style="color: var(--accent); font-weight: 700;">Explorer par catégorie →</a>
        </p>

        <div class="video-grid">
          <a class="video-card" *ngFor="let playlist of recentPlaylists()"
             [routerLink]="['/courses']" [queryParams]="{ category: categoryKey(playlist.categoryId) }">
            <div class="video-thumb" [style.background]="playlist.thumbnailUrl ? 'url(' + playlist.thumbnailUrl + ')' : 'color-mix(in oklch, ' + categoryColor(playlist.categoryId) + ' 20%, var(--bg-card))'">
              <div *ngIf="!playlist.thumbnailUrl" style="width:100%;height:100%;background:repeating-linear-gradient(135deg, transparent 0 12px, color-mix(in oklch, var(--web) 14%, transparent) 12px 13px)"></div>
            </div>
            <div class="video-body">
              <div class="video-cat" [style.color]="categoryColor(playlist.categoryId)">{{ categoryLabel(playlist.categoryId) }}</div>
              <div class="video-title">{{ playlist.title }}</div>
              <div style="font-size: 12px; color: var(--ink-faint); margin-top: 8px;">{{ playlist.videoCount }} vidéos</div>
            </div>
          </a>
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
    .video-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    @media (max-width: 980px) { .video-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 560px) { .video-grid { grid-template-columns: 1fr; } }
    .video-card {
      display: block; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden;
      transition: transform 0.15s, border-color 0.15s; cursor: pointer; text-decoration: none;
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
export class RecentComponent implements OnInit {
  recentPlaylists = signal<Playlist[]>([]);
  private categories = signal<Category[]>([]);

  constructor(private catalog: CatalogService) {}

  ngOnInit() {
    this.catalog.getCategories().subscribe(cats => this.categories.set(cats));
    this.catalog.getPlaylists().subscribe(p => this.recentPlaylists.set(p));
  }

  private findCategory(categoryId?: string): Category | undefined {
    return this.categories().find(c => c.id === categoryId);
  }

  categoryKey(categoryId?: string): string {
    return this.findCategory(categoryId)?.key ?? '';
  }

  categoryLabel(categoryId?: string): string {
    return this.findCategory(categoryId)?.label ?? 'Cours';
  }

  categoryColor(categoryId?: string): string {
    const key = this.categoryKey(categoryId);
    const colors: Record<string, string> = { web: 'var(--web)', mobile: 'var(--mobile)', cyber: 'var(--cyber)', data: 'var(--data)', algo: 'var(--algo)' };
    return colors[key] || 'var(--web)';
  }

  toggleTheme() {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    root.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
  }
}
