import { Component, signal, effect, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RecommendationService, RecommendationResponse, VideoRecommendation, PlaylistFallback } from '../../core/services/recommendation.service';

interface ChatMessage {
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  recommendations?: VideoRecommendation[];
  fallbackPlaylist?: PlaylistFallback | null;
}

@Component({
  selector: 'app-assistant-widget',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="assistant-widget">
      <!-- Floating bubble -->
      <button
        class="assistant-bubble"
        [class.open]="isOpen()"
        (click)="togglePanel()"
        title="Assistant IA"
      >
        🤖
      </button>

      <!-- Chat Panel -->
      <div class="assistant-panel" [class.open]="isOpen()">
        <div class="panel-header">
          <h3>Assistant TechWall</h3>
          <button class="close-btn" (click)="togglePanel()">✕</button>
        </div>

        <!-- Chat Messages -->
        <div class="chat-messages" #messagesContainer>
          @for (message of messages(); track message.timestamp.getTime()) {
            @if (message.type === 'bot') {
              <div class="message bot-message">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                  <p class="message-text">{{ message.content }}</p>

                  <!-- Video Recommendations -->
                  @if (message.recommendations && message.recommendations.length > 0) {
                    <div class="recommendations">
                      @for (video of message.recommendations; track video.videoId) {
                        <div class="video-card">
                          <div class="video-title">{{ video.title }}</div>
                          <div class="video-playlist">{{ video.playlistTitle }}</div>
                          <p class="video-why">{{ video.whyRelevant }}</p>
                          <div class="video-axes">
                            @for (axis of video.axes; track axis) {
                              <span class="axis-tag">{{ axis }}</span>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  }

                  <!-- Fallback Playlist -->
                  @if (message.fallbackPlaylist) {
                    <div class="fallback-section">
                      <div class="fallback-label">📚 Playlist de secours</div>
                      <div class="fallback-card">
                        <div class="fallback-title">{{ message.fallbackPlaylist.title }}</div>
                        @if (message.fallbackPlaylist.reason) {
                          <p class="fallback-reason">{{ message.fallbackPlaylist.reason }}</p>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            } @else {
              <div class="message user-message">
                <div class="message-content">
                  <p class="message-text">{{ message.content }}</p>
                </div>
              </div>
            }
          }

          @if (isLoading()) {
            <div class="message bot-message">
              <div class="message-avatar">🤖</div>
              <div class="message-content">
                <p class="message-text loading">Analyse en cours...</p>
              </div>
            </div>
          }
        </div>

        <!-- Input Section -->
        <div class="input-section">
          <textarea
            [(ngModel)]="goalText"
            [disabled]="isLoading()"
            placeholder="Décrivez votre objectif d'apprentissage..."
            rows="2"
            class="goal-input"
            (keydown.enter)="onEnterKey($event)"
          ></textarea>
          <button
            (click)="submitGoal()"
            [disabled]="!goalText.trim() || isLoading()"
            class="submit-btn"
          >
            {{ isLoading() ? '⏳' : '📤' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .assistant-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      font-family: inherit;
    }

    .assistant-bubble {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--accent);
      border: none;
      cursor: pointer;
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
      color: var(--accent-ink);
    }

    .assistant-bubble:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .assistant-bubble.open {
      opacity: 0;
      pointer-events: none;
    }

    .assistant-panel {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 420px;
      max-height: 650px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      opacity: 0;
      visibility: hidden;
      transform: translateY(10px);
      transition: all 0.3s ease;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    .assistant-panel.open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }

    .panel-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: var(--ink-muted);
      transition: color 0.2s;
    }

    .close-btn:hover {
      color: var(--ink);
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .message {
      display: flex;
      gap: 8px;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .bot-message {
      justify-content: flex-start;
    }

    .user-message {
      justify-content: flex-end;
    }

    .message-avatar {
      font-size: 20px;
      flex-shrink: 0;
      width: 28px;
      display: flex;
      align-items: flex-start;
      padding-top: 2px;
    }

    .message-content {
      max-width: 85%;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .bot-message .message-content {
      background: color-mix(in oklch, var(--accent) 8%, transparent);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px 12px;
    }

    .user-message .message-content {
      background: var(--accent);
      color: var(--accent-ink);
      border-radius: 8px;
      padding: 10px 12px;
    }

    .message-text {
      margin: 0;
      font-size: 13px;
      line-height: 1.4;
    }

    .message-text.loading {
      font-style: italic;
      opacity: 0.7;
    }

    .recommendations {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 4px;
    }

    .video-card {
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 8px;
      font-size: 12px;
    }

    .video-title {
      font-weight: 600;
      color: var(--ink);
      margin-bottom: 2px;
      line-height: 1.3;
    }

    .video-playlist {
      font-size: 11px;
      color: var(--ink-muted);
      margin-bottom: 4px;
    }

    .video-why {
      margin: 4px 0;
      color: var(--ink-muted);
      line-height: 1.3;
    }

    .video-axes {
      display: flex;
      flex-wrap: wrap;
      gap: 3px;
      margin-top: 4px;
    }

    .axis-tag {
      display: inline-block;
      padding: 2px 5px;
      background: var(--accent);
      color: var(--accent-ink);
      border-radius: 3px;
      font-size: 10px;
      font-weight: 600;
    }

    .fallback-section {
      margin-top: 8px;
      border-top: 1px solid var(--border);
      padding-top: 8px;
    }

    .fallback-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--ink-muted);
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .fallback-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 8px;
    }

    .fallback-title {
      font-weight: 600;
      color: var(--ink);
      font-size: 12px;
      margin-bottom: 2px;
    }

    .fallback-reason {
      font-size: 11px;
      color: var(--ink-muted);
      margin: 0;
      line-height: 1.3;
    }

    .input-section {
      display: flex;
      gap: 8px;
      padding: 12px;
      border-top: 1px solid var(--border);
      flex-shrink: 0;
    }

    .goal-input {
      flex: 1;
      padding: 8px 10px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--bg-input);
      color: var(--ink);
      font-family: inherit;
      font-size: 13px;
      resize: none;
    }

    .goal-input:disabled {
      opacity: 0.6;
    }

    .submit-btn {
      padding: 8px 12px;
      background: var(--accent);
      color: var(--accent-ink);
      border: none;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      transition: filter 0.2s;
      flex-shrink: 0;
    }

    .submit-btn:hover:not(:disabled) {
      filter: brightness(1.08);
    }

    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 600px) {
      .assistant-panel {
        width: calc(100vw - 40px);
        max-height: 70vh;
      }

      .message-content {
        max-width: 90%;
      }
    }
  `],
})
export class AssistantWidgetComponent {
  isOpen = signal(false);
  isLoading = signal(false);
  goalText = '';
  messages = signal<ChatMessage[]>([
    {
      type: 'bot',
      content: 'Bienvenue! 👋 Je suis votre assistant d\'apprentissage IA. Décrivez votre objectif et je vous recommanderai les meilleures vidéos du catalogue TechWall pour l\'atteindre.',
      timestamp: new Date(),
    },
  ]);

  @ViewChild('messagesContainer') messagesContainer?: ElementRef<HTMLDivElement>;

  constructor(private recommendationService: RecommendationService) {
    // Auto-scroll vers le dernier message quand la liste change
    effect(() => {
      this.messages();
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  togglePanel() {
    this.isOpen.update(v => !v);
  }

  onEnterKey(event: Event) {
    const keyEvent = event as KeyboardEvent;
    if (keyEvent.ctrlKey) {
      this.submitGoal();
    }
  }

  submitGoal() {
    if (!this.goalText.trim() || this.isLoading()) return;

    const userGoal = this.goalText.trim();
    this.goalText = '';

    // Ajoute le message utilisateur
    this.messages.update(msgs => [
      ...msgs,
      {
        type: 'user',
        content: userGoal,
        timestamp: new Date(),
      },
    ]);

    // **POURQUOI:** les questions conversationnelles (qui es-tu, à quoi tu sers,
    // bonjour, merci...) ne sont PAS des objectifs d'apprentissage. On y répond
    // localement, sans appeler l'API de recommandation (instantané, pas de coût LLM).
    const cannedReply = this.detectConversationalIntent(userGoal);
    if (cannedReply) {
      this.addBotTextMessage(cannedReply);
      return;
    }

    // Objectif trop court (le backend exige >= 10 caractères): message clair plutôt
    // qu'un 400 affiché comme "service indisponible".
    if (userGoal.length < 10) {
      this.addBotTextMessage(
        "Peux-tu être un peu plus précis ? Décris ton objectif en une phrase, par exemple : « apprendre Angular », « sécuriser une route avec les guards » ou « débuter en Big Data ».",
      );
      return;
    }

    this.isLoading.set(true);

    // Mémoire conversationnelle: on envoie les échanges récents pour les questions de suivi
    const history = this.buildHistory();

    this.recommendationService.submitGoal(userGoal, history).subscribe({
      next: (response) => {
        const hasRecos = (response?.plan?.recommendations?.length ?? 0) > 0;
        const hasFallback = !!response?.plan?.fallbackPlaylist;
        if (hasRecos || hasFallback) {
          this.addBotRecommendationMessage(response);
        } else {
          // Réponse reçue mais aucune vidéo pertinente trouvée
          this.addBotTextMessage(
            "Je n'ai pas trouvé de vidéo qui corresponde précisément à cet objectif dans le catalogue TechWall. Essaie de le reformuler ou d'être un peu plus précis, par exemple : « sécuriser une route Angular avec les guards » ou « débuter avec Symfony ».",
          );
        }
        this.isLoading.set(false);
      },
      error: () => {
        // Panne LLM, souci réseau ou service indisponible : on parle à l'utilisateur, pas de jargon technique
        this.addBotTextMessage(
          "Désolé, je n'arrive pas à générer de recommandation pour le moment. Le service est peut-être momentanément indisponible. Réessaie dans quelques instants, et si le problème persiste tu peux explorer les cours directement depuis le menu.",
        );
        this.isLoading.set(false);
      },
    });
  }

  private addBotTextMessage(content: string) {
    this.messages.update(msgs => [
      ...msgs,
      { type: 'bot', content, timestamp: new Date() },
    ]);
  }

  /**
   * Construit un transcript des derniers échanges (hors message d'accueil et hors
   * objectif courant déjà ajouté) pour donner du contexte au LLM sur les questions
   * de suivi. Retourne undefined si c'est le premier vrai échange.
   */
  private buildHistory(): string | undefined {
    const msgs = this.messages();
    // slice(1, -1): retire le message d'accueil (1er) et l'objectif courant (dernier)
    const prior = msgs.slice(1, -1).slice(-4);
    if (prior.length === 0) return undefined;

    const lines = prior.map(m => {
      const who = m.type === 'user' ? 'Utilisateur' : 'Assistant';
      let content = (m.content || '').slice(0, 300);
      if (m.recommendations?.length) {
        content += ' [vidéos proposées: ' + m.recommendations.map(r => r.title).join('; ') + ']';
      }
      return `${who}: ${content}`;
    });
    return lines.join('\n');
  }

  /**
   * Détecte les messages conversationnels (identité, rôle, salutation, remerciement)
   * qui ne sont pas des objectifs d'apprentissage, et renvoie une réponse toute prête.
   * Retourne null si le message doit partir vers l'API de recommandation.
   */
  private detectConversationalIntent(raw: string): string | null {
    // Normalisation: minuscules, sans accents, sans ponctuation finale
    const t = raw
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[!?.]+$/, '')
      .trim();
    const wordCount = t.split(/\s+/).filter(Boolean).length;

    const aboutPatterns: RegExp[] = [
      /qui (es[- ]?tu|est[- ]?ce que tu es|tu es)/,
      /(t'?es|tu es) qui/,
      /a quoi (tu sers|sers[- ]?tu|ca sert|tu es utile)/,
      /tu sers a quoi/,
      /que (fais[- ]?tu|peux[- ]?tu faire|sais[- ]?tu faire)/,
      /qu'?est[- ]?ce que tu (fais|peux|sais)/,
      /comment (ca marche|tu marches|ca fonctionne|t'?utiliser|je t'?utilise)/,
      /c'?est quoi (ce|cet|cette|ton|toi|ton role)/,
      /ton (role|but|utilite|objectif)/,
      /presente[- ]?toi/,
      /^(aide|help|\?)$/,
    ];
    if (aboutPatterns.some(re => re.test(t))) {
      return "Je suis l'assistant d'apprentissage de TechWall 🤖. Mon rôle : tu me décris un objectif (par ex. « apprendre Angular », « sécuriser une route avec les guards », « débuter en Big Data ») et je te recommande les vidéos du catalogue TechWall les plus adaptées, avec le pourquoi de chaque choix. Qu'aimerais-tu apprendre ?";
    }

    // Remerciement (message court uniquement, pour ne pas capter un objectif qui contient "merci")
    if (/\b(merci|thanks|thank you|thx)\b/.test(t) && wordCount <= 4) {
      return "Avec plaisir ! 😊 Donne-moi un autre objectif d'apprentissage quand tu veux.";
    }

    // Salutation seule (message court, sinon on laisse passer un vrai objectif)
    if (/^(bonjour|bonsoir|salut|coucou|hello|hey|hi|yo)\b/.test(t) && wordCount <= 3) {
      return "Bonjour 👋 Je suis l'assistant TechWall. Dis-moi ce que tu veux apprendre et je te recommande les vidéos adaptées du catalogue.";
    }

    return null;
  }

  private addBotRecommendationMessage(response: RecommendationResponse) {
    const botMessage: ChatMessage = {
      type: 'bot',
      content: response.plan.goalSummary,
      timestamp: new Date(),
      recommendations: response.plan.recommendations,
      fallbackPlaylist: response.plan.fallbackPlaylist,
    };

    this.messages.update(msgs => [...msgs, botMessage]);
  }

  private scrollToBottom() {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}
