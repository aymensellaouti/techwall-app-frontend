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

        <!-- Error Display -->
        @if (errorMessage()) {
          <div class="error-banner">{{ errorMessage() }}</div>
        }
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

    .error-banner {
      padding: 8px 12px;
      background: color-mix(in oklch, red 12%, transparent);
      color: color-mix(in oklch, red 70%, var(--ink));
      font-size: 12px;
      border-top: 1px solid var(--border);
      line-height: 1.3;
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
  errorMessage = signal<string | null>(null);

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
    this.errorMessage.set(null);

    // Ajoute le message utilisateur
    this.messages.update(msgs => [
      ...msgs,
      {
        type: 'user',
        content: userGoal,
        timestamp: new Date(),
      },
    ]);

    this.isLoading.set(true);

    this.recommendationService.submitGoal(userGoal).subscribe({
      next: (response) => {
        this.addBotRecommendationMessage(response);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Une erreur est survenue');
        this.isLoading.set(false);
      },
    });
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
