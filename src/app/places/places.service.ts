import { inject, Injectable, signal } from '@angular/core';

import { catchError, map, tap, throwError } from 'rxjs';
import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { ErrorService } from '../shared/error.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private userPlaces = signal<Place[]>([]);
  private httpClient = inject(HttpClient);
  private errorService = inject(ErrorService);

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchPlaces('http://localhost:3000/places', 'The data was not loaded');
  }

  loadUserPlaces() {
    return this.fetchPlaces(
      'http://localhost:3000/user-places',
      'The data was not loaded'
    ).pipe(
      tap({
        next: (userPLaces) => this.userPlaces.set(userPLaces)
      })
    );
  }

  addPlaceToUserPlaces(newPlace: Place) {
    const prevPlaces = this.userPlaces();
    //this.userPlaces.update((prevPlaces) => [...prevPlaces, newPlace]);
    if (!prevPlaces.some((p) => p.id === newPlace.id)) {
      this.userPlaces.set([...prevPlaces, newPlace]);
    }
    return this.httpClient.put('http://localhost:3000/user-places', {
      placeId: newPlace.id,
    })
      .pipe(
        catchError(
          (error) => {
            this.userPlaces.set(prevPlaces);
            this.errorService.showError('Failed to store selected place');
            return throwError(()=> new Error('Failed to store selected place'))
        }
      )
    );
  }

  removeUserPlace(place: Place) {
    const prevPlaces = this.userPlaces();
    if (prevPlaces.some((p) => p.id === place.id)) {
      this.userPlaces.update((prevPlaces) =>
        prevPlaces.filter((p) => p.id !== place.id)
      );
    }
    return this.httpClient
      .delete(`http://localhost:3000/user-places/${place.id}`)
      .pipe(
        catchError((error) => {
          this.userPlaces.set(prevPlaces);
          this.errorService.showError('Unable to delete');
          return throwError(() => new Error('Unable to delete'));
        })
      );
  }

  private fetchPlaces(url: string, errorMessage: string) {
    return this.httpClient
      .get<{ places: Place[] }>(url)
      .pipe(
        map((resData) => resData.places),
        catchError((error) => {
          console.log(error);
          return throwError(() => new Error(errorMessage));
        })
      );
  }
}
