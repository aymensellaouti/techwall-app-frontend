import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogService } from '../../core/services/catalog.service';
import { Founder } from '../../core/models/catalog';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <section class="block" style="padding-top: 48px;">
      <div class="block-inner">
        <h1>À propos de TechWall</h1>
        <p style="color: var(--ink-muted); max-width: 65ch; margin-bottom: 48px; font-size: 17px;">
          TechWall est une chaîne YouTube éducative fondée en 2019 par trois enseignants-chercheurs de l'INSAT.
          Nous créons du contenu technique gratuit en français : développement web, Big Data, cybersécurité, et bien d'autres domaines.
        </p>

        <h2 style="margin-bottom: 28px;">L'équipe</h2>
        <div class="team-grid">
          <div class="team-card" *ngFor="let founder of founders()">
            <img *ngIf="founder.photoUrl" [src]="founder.photoUrl" class="founder-photo" alt="{{ founder.name }}">
            <div class="team-name">{{ founder.name }}</div>
            <div class="team-role">{{ founder.role }}</div>
            <div class="team-bio">{{ founder.bio }}</div>
            <a class="team-link" [href]="founder.linkedin" target="_blank">Voir sur LinkedIn →</a>
          </div>
        </div>

        <h2 style="margin-top: 72px; margin-bottom: 28px;">En chiffres</h2>
        <div class="stats-grid" style="max-width: 100%; margin-bottom: 72px;">
          <div class="stat-card"><div class="stat-value">635+</div><div class="stat-label">vidéos publiées</div></div>
          <div class="stat-card"><div class="stat-value">28</div><div class="stat-label">playlists actives</div></div>
          <div class="stat-card"><div class="stat-value">26K</div><div class="stat-label">abonnés</div></div>
        </div>

        <h2 style="margin-bottom: 28px;">Notre mission</h2>
        <div class="mission-grid">
          <div class="mission-card">
            <div class="mission-title">Gratuit et accessible</div>
            <p>Tout le contenu est gratuit, en français, et accessible à tous.</p>
          </div>
          <div class="mission-card">
            <div class="mission-title">Par des enseignants</div>
            <p>Créé par des enseignants-chercheurs avec une expérience pédagogique.</p>
          </div>
          <div class="mission-card">
            <div class="mission-title">Contenu de qualité</div>
            <p>Chaque vidéo est soigneusement planifiée et réalisée pour une meilleure compréhension.</p>
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
    h2 { font-family: var(--font-display); font-weight: 700; font-size: 27px; margin: 0; text-wrap: balance; }
    .block { padding: 0 48px 88px; }
    .block-inner { max-width: 1200px; margin: 0 auto; }
    .founder-photo {
      width: 100%; height: 200px; border-radius: 12px; margin-bottom: 16px; object-fit: cover;
    }
    .team-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    @media (max-width: 860px) { .team-grid { grid-template-columns: 1fr; } }
    .team-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 26px; }
    .team-name { font-family: var(--font-display); font-weight: 700; font-size: 16px; margin-bottom: 3px; }
    .team-role { font-size: 12.5px; color: var(--accent); font-weight: 700; margin-bottom: 12px; }
    .team-bio { font-size: 13.5px; color: var(--ink-muted); line-height: 1.6; margin-bottom: 14px; }
    .team-link { font-size: 12.5px; font-weight: 700; color: var(--accent); cursor: pointer; text-decoration: none; }
    .team-link:hover { text-decoration: underline; }
    .stats-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
    }
    @media (max-width: 720px) { .stats-grid { grid-template-columns: 1fr; } }
    .stat-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; text-align: center; }
    .stat-value { font-family: var(--font-display); font-weight: 700; font-size: 32px; line-height: 1.2; margin-bottom: 8px; }
    .stat-label { font-size: 13.5px; color: var(--ink-muted); }
    .mission-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 48px;
    }
    @media (max-width: 720px) { .mission-grid { grid-template-columns: 1fr; } }
    .mission-card {
      background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px;
    }
    .mission-title {
      font-family: var(--font-display); font-weight: 700; font-size: 17px; margin-bottom: 12px;
    }
    .mission-card p {
      font-size: 14px; color: var(--ink-muted); line-height: 1.6; margin: 0;
    }
    .theme-toggle {
      position: fixed; bottom: 20px; right: 72px; z-index: 30;
      width: 40px; height: 40px; border-radius: 50%;
      background: var(--bg-card); border: 1px solid var(--border); color: var(--ink);
      cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center;
    }
    .theme-toggle:hover { background: var(--bg-card-hover); }
  `]
})
export class AboutComponent implements OnInit {
  founders = signal<Founder[]>([]);

  constructor(private catalog: CatalogService) {}

  ngOnInit() {
    this.catalog.getFounders().subscribe(f => this.founders.set(f));
  }

  toggleTheme() {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    root.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
  }
}
