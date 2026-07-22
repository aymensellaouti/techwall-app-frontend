import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer>
      <div class="foot-brand">
        <div class="brand-mark" style="width:26px;height:26px;font-size:11px">TW</div>
        <span class="foot-copy">© 2026 TechWall</span>
      </div>
      <div class="foot-links">
        <a href="/courses">Cours</a>
        <a href="/about">À propos</a>
        <a href="https://youtube.com/@TechWall" target="_blank">YouTube</a>
      </div>
    </footer>
  `,
  styles: [`
    footer {
      border-top: 1px solid var(--border);
      padding: 36px 48px;
      display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 18px;
    }
    .foot-brand { display: flex; align-items: center; gap: 10px; }
    .brand-mark {
      display: flex; align-items: center; justify-content: center;
      border-radius: 8px;
      background: linear-gradient(135deg, var(--accent), var(--mobile));
      color: var(--accent-ink);
      font-weight: 700;
    }
    .foot-copy { font-size: 12.5px; color: var(--ink-faint); }
    .foot-links { display: flex; gap: 26px; }
    .foot-links a { color: var(--ink-muted); font-size: 13.5px; text-decoration: none; }
    .foot-links a:hover { color: var(--ink); }
  `]
})
export class FooterComponent {}
