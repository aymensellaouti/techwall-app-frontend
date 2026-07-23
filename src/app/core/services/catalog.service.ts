import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, Playlist, Founder } from '../models/catalog';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.API_URL}/catalog/categories`);
  }

  getPlaylists(categoryKey?: string): Observable<Playlist[]> {
    const url = categoryKey
      ? `${this.API_URL}/catalog/playlists?category=${categoryKey}`
      : `${this.API_URL}/catalog/playlists`;
    return this.http.get<Playlist[]>(url);
  }

  getPlaylistById(id: string): Observable<Playlist> {
    return this.http.get<Playlist>(`${this.API_URL}/catalog/playlists/${id}`);
  }

  getFounders(): Observable<Founder[]> {
    return this.http.get<Founder[]>(`${this.API_URL}/catalog/founders`);
  }
}
