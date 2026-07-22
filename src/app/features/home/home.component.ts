import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogService } from '../../core/services/catalog.service';
import { Category, Playlist, Founder } from '../../core/models/catalog';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <section class="hero">
      <div class="hero-grid">
        <div>
          <div class="eyebrow"><span class="dot"></span>Depuis 2019 · par 3 enseignants-chercheurs de l'INSAT</div>
          <h1>Apprends les technologies qui comptent, à ton rythme.</h1>
          <p class="lede">Développement web (Symfony, Angular, NestJs), Big Data (Hadoop, Spark) et cybersécurité — des cours gratuits en français, conçus par des enseignants-chercheurs.</p>
          <div class="cta-row">
            <a class="btn" href="https://youtube.com/@TechWall" target="_blank">S'abonner sur YouTube</a>
            <a class="btn btn-ghost" href="/courses">Voir les cours</a>
          </div>
        </div>
        <div class="hero-panel">
          <img src="assets/logo.jpg" alt="TechWall Logo" class="hero-logo">
        </div>
      </div>
    </section>

    <section class="stats">
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-value">635+</div><div class="stat-label">vidéos publiées</div></div>
        <div class="stat-card"><div class="stat-value">28</div><div class="stat-label">playlists actives</div></div>
        <div class="stat-card"><div class="stat-value">26K</div><div class="stat-label">abonnés</div></div>
      </div>
    </section>

    <section class="block">
      <div class="block-inner">
        <div class="block-head">
          <h2>Explore par catégorie</h2>
          <a class="see-all" href="/courses">Tout voir →</a>
        </div>
        <div class="cat-grid">
          <a class="cat-card" *ngFor="let cat of categories()" href="/courses">
            <div class="cat-tag" [style.background]="getCategoryColor(cat.key)">{{ cat.key.substring(0, 3).toUpperCase() }}</div>
            <div class="cat-title">{{ cat.label }}</div>
            <div class="cat-desc">{{ cat.description }}</div>
            <div class="cat-count" [style.color]="getCategoryColor(cat.key)">{{ cat._count?.playlists || 0 }} playlists</div>
          </a>
        </div>
      </div>
    </section>

    <section class="block">
      <div class="block-inner">
        <div class="block-head">
          <h2>Cours récents</h2>
          <a class="see-all" href="/courses">Tout voir →</a>
        </div>
        <div class="video-grid">
          <div class="video-card" *ngFor="let video of recentVideos() | slice:0:4">
            <div class="video-thumb" [style.background]="video.thumbnailUrl ? 'url(' + video.thumbnailUrl + ')' : 'color-mix(in oklch, var(--web) 20%, var(--bg-card))'">
              <div *ngIf="!video.thumbnailUrl" style="width:100%;height:100%;background:repeating-linear-gradient(135deg, transparent 0 12px, color-mix(in oklch, var(--web) 14%, transparent) 12px 13px)"></div>
            </div>
            <div class="video-body">
              <div class="video-cat" style="color:var(--web)">Web</div>
              <div class="video-title">{{ video.title }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="block">
      <div class="block-inner">
        <h2 style="margin-bottom:28px">L'équipe derrière TechWall</h2>
        <div class="team-grid">
          <div class="team-card" *ngFor="let founder of founders()">
            <div class="avatar" *ngIf="!founder.photoUrl" [style.background]="'linear-gradient(135deg,var(--web),var(--mobile))'">{{ getInitials(founder.name) }}</div>
            <img *ngIf="founder.photoUrl" [src]="founder.photoUrl" alt="{{ founder.name }}" class="founder-photo">
            <div class="team-name">{{ founder.name }}</div>
            <div class="team-role">{{ founder.role }}</div>
            <div class="team-bio">{{ founder.bio }}</div>
            <a class="team-link" [href]="founder.linkedin" target="_blank">Voir sur LinkedIn →</a>
          </div>
        </div>
      </div>
    </section>
    <app-footer></app-footer>
    <button class="theme-toggle" (click)="toggleTheme()" title="Changer de thème">◐</button>
  `,
  styles: [`
    :host { display: block; }
    .hero {
      padding: 96px 48px 72px;
    }
    .hero-grid {
      max-width: 1200px; margin: 0 auto;
      display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 64px; align-items: center;
    }
    @media (max-width: 900px) { .hero-grid { grid-template-columns: 1fr; } }
    .eyebrow {
      display: inline-flex; align-items: center; gap: 8px;
      font-family: var(--font-mono); font-size: 12.5px; letter-spacing: 0.03em;
      color: var(--accent); background: var(--accent-dim);
      border: 1px solid color-mix(in oklch, var(--accent) 35%, transparent);
      border-radius: 100px; padding: 7px 14px; margin-bottom: 22px;
    }
    .eyebrow .dot {
      width: 6px; height: 6px; border-radius: 50%; background: var(--accent);
      animation: pulse 2.2s ease infinite;
    }
    @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
    h1 {
      font-family: var(--font-display); font-weight: 700;
      font-size: clamp(34px, 4.6vw, 54px); line-height: 1.06; letter-spacing: -0.02em;
      margin: 0 0 20px; text-wrap: balance;
    }
    .lede { font-size: 17px; color: var(--ink-muted); max-width: 52ch; margin: 0 0 32px; }
    .cta-row { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn {
      display: inline-flex; align-items: center; gap: 6px;
      background: var(--accent); color: var(--accent-ink);
      padding: 10px 18px; border-radius: 9px;
      font-weight: 700; font-size: 13.5px;
      border: none; cursor: pointer; text-decoration: none;
      transition: filter 0.15s, transform 0.1s;
    }
    .btn:hover { filter: brightness(1.08); }
    .btn-ghost {
      background: transparent; color: var(--ink);
      border: 1px solid var(--border);
    }
    .btn-ghost:hover { background: var(--bg-card-hover); }
    .hero-panel {
      aspect-ratio: 4 / 3; border-radius: 20px;
      background: var(--bg-card); border: 1px solid var(--border);
      position: relative; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
    }
    .hero-mark {
      position: relative; width: 46%; max-width: 190px; aspect-ratio: 1;
      border-radius: 24px; background: linear-gradient(135deg, var(--web), var(--mobile));
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-mono); font-weight: 700; font-size: 15px; color: var(--accent-ink);
    }
    .hero-logo {
      width: 100%; max-width: 280px; border-radius: 20px;
      object-fit: cover; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
    .stats {
      padding: 0 48px 80px;
    }
    .stats-grid {
      max-width: 1200px; margin: 0 auto;
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
    }
    @media (max-width: 720px) { .stats-grid { grid-template-columns: 1fr; } }

    .block { padding: 0 48px 88px; }
    .block-inner { max-width: 1200px; margin: 0 auto; }
    .block-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 28px; gap: 20px; }
    h2 { font-family: var(--font-display); font-weight: 700; font-size: 27px; margin: 0; text-wrap: balance; }
    .see-all { font-weight: 700; font-size: 13.5px; color: var(--accent); white-space: nowrap; cursor: pointer; }
    .see-all:hover { text-decoration: underline; }

    .cat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
    @media (max-width: 900px) { .cat-grid { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 600px) { .cat-grid { grid-template-columns: 1fr; } }
    .cat-card {
      display: block; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
      padding: 24px; transition: background 0.15s, border-color 0.15s, transform 0.15s; cursor: pointer; text-decoration: none;
    }
    .cat-card:hover { background: var(--bg-card-hover); border-color: color-mix(in oklch, var(--border) 40%, var(--ink)); transform: translateY(-2px); }
    .cat-tag {
      width: 40px; height: 40px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-mono); font-weight: 700; font-size: 10.5px; color: var(--accent-ink);
      margin-bottom: 16px;
    }
    .cat-title { font-family: var(--font-display); font-weight: 700; font-size: 17px; margin-bottom: 8px; }
    .cat-desc { font-size: 13.5px; color: var(--ink-muted); line-height: 1.55; margin-bottom: 14px; }
    .cat-count { font-family: var(--font-mono); font-size: 12.5px; font-weight: 700; font-variant-numeric: tabular-nums; }

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

    .team-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    @media (max-width: 860px) { .team-grid { grid-template-columns: 1fr; } }
    .team-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 26px; }
    .avatar {
      width: 56px; height: 56px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-display); font-weight: 700; font-size: 16px; color: var(--accent-ink);
      margin-bottom: 16px;
    }
    .founder-photo {
      width: 56px; height: 56px; border-radius: 50%; margin-bottom: 16px; object-fit: cover;
    }
    .team-name { font-family: var(--font-display); font-weight: 700; font-size: 16px; margin-bottom: 3px; }
    .team-role { font-size: 12.5px; color: var(--accent); font-weight: 700; margin-bottom: 12px; }
    .team-bio { font-size: 13.5px; color: var(--ink-muted); line-height: 1.6; margin-bottom: 14px; }
    .team-link { font-size: 12.5px; font-weight: 700; color: var(--accent); cursor: pointer; text-decoration: none; }
    .team-link:hover { text-decoration: underline; }

    .theme-toggle {
      position: fixed; bottom: 20px; right: 72px; z-index: 30;
      width: 40px; height: 40px; border-radius: 50%;
      background: var(--bg-card); border: 1px solid var(--border); color: var(--ink);
      cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center;
    }
    .theme-toggle:hover { background: var(--bg-card-hover); }
  `]
})
export class HomeComponent implements OnInit {
  categories = signal<Category[]>([]);
  founders = signal<Founder[]>([]);
  recentVideos = signal<Playlist[]>([]);

  constructor(private catalog: CatalogService) {}

  ngOnInit() {
    this.catalog.getCategories().subscribe(cats => this.categories.set(cats.slice(0, 3)));
    this.catalog.getFounders().subscribe(f => this.founders.set(f));
    this.catalog.getPlaylists().subscribe(p => this.recentVideos.set(p));
  }

  getCategoryColor(key: string): string {
    const colors: Record<string, string> = { web: 'var(--web)', mobile: 'var(--mobile)', cyber: 'var(--cyber)', data: 'var(--data)', algo: 'var(--algo)' };
    return colors[key] || 'var(--web)';
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  toggleTheme() {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    root.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
  }
}
