import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface VideoRecommendation {
  type: 'video';
  videoId: string;
  title: string;
  playlistTitle: string;
  whyRelevant: string;
  axes: string[];
}

export interface PlaylistFallback {
  type: 'playlist';
  playlistId: string;
  title: string;
  reason?: string;
}

export interface RecommendationPlan {
  goalSummary: string;
  recommendations: VideoRecommendation[];
  fallbackPlaylist: PlaylistFallback | null;
}

export interface RecommendationResponse {
  sessionId: string;
  plan: RecommendationPlan;
  providerUsed: string;
  fallbackUsed: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class RecommendationService {
  // URLs et clé chargées depuis environment.ts / environment.prod.ts
  private apiUrl = `${environment.apiUrl}/recommendations`;
  private apiKey = environment.apiKey;

  constructor(private http: HttpClient) {}

  submitGoal(goalText: string, history?: string): Observable<RecommendationResponse> {
    const sessionId = this.getOrCreateSessionId();
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
    };
    const body: { goalText: string; sessionId: string; history?: string } = {
      goalText,
      sessionId,
    };
    // Historique des échanges récents (questions de suivi) si présent
    if (history) body.history = history;
    return this.http.post<RecommendationResponse>(this.apiUrl, body, { headers });
  }

  private getOrCreateSessionId(): string {
    const storageKey = 'techwall_session_id';
    let sessionId = localStorage.getItem(storageKey);
    if (!sessionId) {
      sessionId = this.generateUUID();
      localStorage.setItem(storageKey, sessionId);
    }
    return sessionId;
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
