import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private apiUrl = 'https://techwall-app-backend.railway.internal/recommendations';
  // **POURQUOI cette clé:** Protège l'API contre les abus
  // - Stockée aussi en variable d'env Railway
  // - Envoyée dans le header Authorization
  // - Rate limitée à 10 requêtes/min par IP
  private apiKey = 'techwall-api-key-v1';

  constructor(private http: HttpClient) {}

  submitGoal(goalText: string): Observable<RecommendationResponse> {
    const sessionId = this.getOrCreateSessionId();
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
    };
    return this.http.post<RecommendationResponse>(this.apiUrl, {
      goalText,
      sessionId,
    }, { headers });
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
