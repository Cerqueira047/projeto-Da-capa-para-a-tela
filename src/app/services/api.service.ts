import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, timeout } from 'rxjs';
import { ApiUser, Suspect } from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  getSuspects(): Observable<Suspect[]> {
    return this.http.get<ApiUser[]>('https://jsonplaceholder.typicode.com/users').pipe(
      timeout(12000),
      map((users) =>
        users.map((user) => ({
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          city: user.address.city,
          company: user.company.name,
          // Classificação fictícia para demonstrar filtros; não vem da API.
          risk: user.id % 3 === 0 ? 'ALTO' : user.id % 2 === 0 ? 'MÉDIO' : 'BAIXO',
        })),
      ),
    );
  }
}
