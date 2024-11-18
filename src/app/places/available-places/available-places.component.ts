import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { catchError, map, throwError } from 'rxjs';
import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from '@angular/common/http';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit{
  places = signal<Place[] | undefined>(undefined);
  isFetching = signal(false);

  error = signal('');
  
  private destroyRef = inject(DestroyRef);
  private httpClient = inject(HttpClient);
  private placesService = inject(PlacesService);

  ngOnInit(): void {
    this.isFetching.set(true);
    const subscription = this.placesService.loadAvailablePlaces()
      .subscribe({
        next: (places) => this.places.set(places),
        complete: () => this.isFetching.set(false),
        error: (error)=> this.error.set(error.message)
      });
    
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
 
  onSubmitPlace(place : Place) {
    const subscription=this.placesService.addPlaceToUserPlaces(place)
      .subscribe({
        next: (resData) => console.log(resData)
      });
    
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

}
