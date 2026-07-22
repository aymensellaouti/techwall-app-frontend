import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogService } from '../../core/services/catalog.service';
import { Category } from '../../core/models/catalog';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header>
      <div class="brand">
        <div class="brand-mark">TW</div>
        <span class="brand-name">TechWall</span>
      </div>
      <nav>
        <a class="navlink" href="/" [attr.aria-current]="currentPage === 'home' ? 'page' : null">Accueil</a>
        <a class="navlink" href="/courses" [attr.aria-current]="currentPage === 'courses' ? 'page' : null">Cours</a>
        <a class="navlink" href="/about" [attr.aria-current]="currentPage === 'about' ? 'page' : null">À propos</a>
        <a class="btn" href="https://youtube.com/@TechWall" target="_blank">S'abonner</a>
      </nav>
    </header>
  `,
  styles: [`
    header {
      position: sticky; top: 0; z-index: 20;
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 48px;
      border-bottom: 1px solid var(--border);
      background: color-mix(in oklch, var(--bg) 92%, transparent);
      backdrop-filter: blur(10px);
    }
    @media (max-width: 720px) { header { padding: 16px 20px; } }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand-mark {
      width: 32px; height: 32px; border-radius: 8px;
      background: linear-gradient(135deg, var(--accent), var(--mobile));
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-mono); font-weight: 700; font-size: 13px; color: var(--accent-ink);
      flex-shrink: 0;
    }
    .brand-name { font-family: var(--font-display); font-weight: 700; font-size: 18px; letter-spacing: -0.01em; }
    nav { display: flex; align-items: center; gap: 32px; }
    .navlink { color: var(--ink-muted); font-weight: 600; font-size: 14px; transition: color 0.15s; }
    .navlink:hover { color: var(--ink); }
    .navlink[aria-current="page"] { color: var(--ink); }
    .btn {
      display: inline-flex; align-items: center; gap: 6px;
      background: var(--accent); color: var(--accent-ink);
      padding: 10px 18px; border-radius: 9px;
      font-weight: 700; font-size: 13.5px;
      border: none; cursor: pointer; text-decoration: none;
      transition: filter 0.15s, transform 0.1s;
    }
    .btn:hover { filter: brightness(1.08); }
    .btn:active { transform: translateY(1px); }
    @media (max-width: 860px) { .navlink { display: none; } }
  `]
})
export class HeaderComponent {
  currentPage: string = 'home';
}
