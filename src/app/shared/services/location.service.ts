import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { Geolocation } from '@capacitor/geolocation';
import { catchError, map, Observable, of, take } from 'rxjs';
import {
  Coordinates,
  PlaceDetailsV1Response,
  TransformedPlace,
  AddressSuggestion,
  PlaceAutocompleteResponse,
  GeocodingResponse,
  PlacesApiV1Response,
  PlacesApiLegacyResponse,
  GeolocationResponse,
  PlaceAutocompleteSuggestion,
} from '../statics/google-map.interface';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  constructor(private http: HttpClient) {}

  private readonly PLACE_API_NEW_URL = 'https://places.googleapis.com/v1/places';
  private readonly GEOLOCATION_API_URL = 'https://www.googleapis.com/geolocation/v1/geolocate';
  private readonly PLACE_API_LEGACY_URL = 'https://maps.googleapis.com/maps/api/place'; //cors issue

  private readonly GEOCODING_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json'; //cors issue

  /**
   * Get current user coordinates
   * - First tries browser's Geolocation API
   * - Falls back to Google Geolocation API if browser API fails
   */
  async checkLocationPermission(): Promise<boolean> {
    try {
      const permission = await Geolocation.checkPermissions();
      return permission.location === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Get current user coordinates
   * - First tries browser's Geolocation API
   * - Falls back to Google Geolocation API if browser API fails
   */
  async getCurrentLocation(): Promise<Coordinates> {
    try {
      const position = await Geolocation.getCurrentPosition();
      return { lat: position.coords.latitude, lng: position.coords.longitude };
    } catch {
      return this.getLocationFromGoogleApi();
    }
  }

  /**
   * Get detailed information about a specific place
   * @param placeId Google Places API place identifier
   */
  getPlaceDetail(placeId: string): Observable<TransformedPlace | null> {
    if (!placeId) {
      return of(null);
    }

    const url = `${this.PLACE_API_NEW_URL}/${placeId}`;
    const headers = this.getGooglePlaceHeader();

    return this.http.get<PlaceDetailsV1Response>(url, { headers }).pipe(
      map((res) => {
        return {
          placeId: res.id,
          location: res.location,
          formattedAddress: res.formattedAddress,
          name: '',
        };
      }),
      catchError((error) => {
        console.error('Google Place Details API Error:', error);
        return of(null);
      }),
    );
  }

  /**
   * Search for places based on text query
   * @param query Search keywords
   */
  searchGooglePlaces(query: string): Observable<TransformedPlace[]> {
    if (!query || query.trim().length < 3) {
      return of([]);
    }

    return this.searchGooglePlacesNew(query)
      .pipe
      // Fallback disabled - uncomment to enable legacy API fallback
      // catchError(() => this.searchGooglePlacesLegacy(query))
      ();
  }

  /**
   * Search for places near a specific location
   * @param lat Latitude
   * @param lng Longitude
   * @param radius Search radius in meters
   */
  searchNearbyPlaces(lat: number, lng: number, radius: number): Observable<TransformedPlace[]> {
    if (!lat || !lng || !radius) {
      return of([]);
    }

    return this.searchNearbyPlacesNew(lat, lng, radius).pipe(
      // Fallback disabled - uncomment to enable legacy API fallback
      catchError(() => this.searchNearbyPlacesLegacy(lat, lng, radius)),
    );
  }

  /**
   * Get address autocomplete suggestions
   * @param query User input (minimum 3 characters)
   */
  getAddressSuggestions(query: string): Observable<AddressSuggestion[]> {
    if (!query || query.trim().length < 3) {
      return of([]); // Ensure minimum 3 characters input
    }

    const url = `${this.PLACE_API_NEW_URL}:autocomplete`;
    const headers = this.getGoogleAutoCompleteHeader();
    const body = { input: query, includedRegionCodes: ['my'] };

    return this.http.post<PlaceAutocompleteResponse>(url, body, { headers }).pipe(
      map((response) => this.transformSuggestions(response.suggestions) || []),
      catchError((error) => {
        console.error('Google Autocomplete API Error:', error);
        return of([]);
      }),
    );
  }

  /**
   * Get place information from coordinates using Geocoding API
   * @param lat Latitude
   * @param lng Longitude
   * @returns List of places with place_id
   */
  getPlaceFromGeocode(lat: number, lng: number): Observable<{ place_id: string; name: string }[]> {
    if (!lat || !lng) {
      return of([]);
    }

    const url = `${this.GEOCODING_API_URL}?latlng=${lat},${lng}&key=${environment.googleMapsApiKey}`;

    return this.http.get<GeocodingResponse>(url).pipe(
      map((response) => {
        if (response.results && response.results.length > 0) {
          return response.results.map((place) => ({
            place_id: place.place_id,
            name: place.formatted_address,
          }));
        }
        return [];
      }),
      catchError((error) => {
        console.error('Geocoding API error:', error);
        return of([]);
      }),
    );
  }

  // =============== New Places API Methods ===============

  /**
   * Search places using new Places API
   * @param query Search text
   */
  private searchGooglePlacesNew(query: string): Observable<TransformedPlace[]> {
    const url = `${this.PLACE_API_NEW_URL}:searchText`;
    const headers = this.getGooglePlaceApiHeader();
    const body = { textQuery: query, regionCode: 'my' };

    return this.http.post<PlacesApiV1Response>(url, body, { headers }).pipe(
      map((response) => (response.places ? this.transformPlaces(response.places, true) : [])),
      catchError((error) => {
        console.error('New Places API search error:', error);
        return of([]);
      }),
    );
  }

  /**
   * Search nearby places using new Places API
   * @param lat Latitude
   * @param lng Longitude
   * @param radius Search radius in meters
   */
  private searchNearbyPlacesNew(
    lat: number,
    lng: number,
    radius: number,
  ): Observable<TransformedPlace[]> {
    const url = `${this.PLACE_API_NEW_URL}:searchNearby`;
    const headers = this.getGooglePlaceApiHeader();

    const body = {
      locationRestriction: {
        circle: { center: { latitude: lat, longitude: lng }, radius },
      },
    };

    return this.http.post<PlacesApiV1Response>(url, body, { headers }).pipe(
      map((response) => (response.places ? this.transformPlaces(response.places, true) : [])),
      catchError((error) => {
        console.error('New Places API nearby search error:', error);
        return of([]);
      }),
    );
  }

  // =============== Legacy Places API Methods ===============
  //Legacy method should call at server, due to CORS issue
  /**
   * Search places using legacy Places API
   * @param query Search text
   */
  private searchGooglePlacesLegacy(query: string): Observable<TransformedPlace[]> {
    const url = `${
      this.PLACE_API_LEGACY_URL
    }/textsearch/json?query=${encodeURIComponent(query)}&key=${environment.googleMapsApiKey}`;

    return this.http.get<PlacesApiLegacyResponse>(url).pipe(
      map((response) =>
        response.status === 'OK' ? this.transformPlaces(response.results, false) : [],
      ),
      catchError((error) => {
        console.error('Legacy Places API search error:', error);
        return of([]);
      }),
    );
  }

  /**
   * Search nearby places using legacy Places API
   * @param lat Latitude
   * @param lng Longitude
   * @param radius Search radius in meters
   */
  private searchNearbyPlacesLegacy(
    lat: number,
    lng: number,
    radius: number,
  ): Observable<TransformedPlace[]> {
    let url = `${this.PLACE_API_LEGACY_URL}/nearbysearch/json?location=${lat},${lng}&radius=${radius}&key=${environment.googleMapsApiKey}`;

    return this.http.get<PlacesApiLegacyResponse>(url).pipe(
      map((response) =>
        response.status === 'OK' ? this.transformPlaces(response.results, false) : [],
      ),
      catchError((error) => {
        console.error('Legacy Places API nearby search error:', error);
        return of([]);
      }),
    );
  }

  // =============== Fallback Location API ===============

  /**
   * Get location using Google Geolocation API as fallback
   */
  private async getLocationFromGoogleApi(): Promise<Coordinates> {
    const url = `${this.GEOLOCATION_API_URL}?key=${environment.googleMapsApiKey}`;

    return new Promise<Coordinates>((resolve, reject) => {
      this.http
        .post<GeolocationResponse>(url, { considerIp: true })
        .pipe(take(1))
        .subscribe({
          next: (response) =>
            response?.location
              ? resolve(response.location)
              : reject('Google Geolocation API failed'),
          error: (error) => {
            console.error('Geolocation API error:', error);
            reject('Google Geolocation API failed');
          },
        });
    });
  }

  // =============== Data Transformation Methods ===============

  /**
   * Transform place data from different API formats to a consistent structure
   * @param places Raw place data from API
   * @param isNewApi Flag indicating if data is from new or legacy API
   */
  private transformPlaces(places: any[], isNewApi: boolean): TransformedPlace[] {
    if (!places || !Array.isArray(places)) {
      return [];
    }

    return places.map((place) => ({
      name: isNewApi ? place.displayName?.text : place.name,
      formattedAddress: isNewApi
        ? place.formattedAddress
        : place.formatted_address || place.vicinity || '',
      location: {
        latitude: isNewApi ? place.location?.latitude : place.geometry?.location?.lat,
        longitude: isNewApi ? place.location?.longitude : place.geometry?.location?.lng,
      },
      placeId: isNewApi ? place.id : place.place_id,
    }));
  }

  /**
   * Transform autocomplete suggestions to a simplified format
   * @param suggestions Raw suggestions from API
   */
  private transformSuggestions(suggestions: PlaceAutocompleteSuggestion[]): AddressSuggestion[] {
    if (!suggestions || !Array.isArray(suggestions)) {
      return [];
    }

    return suggestions.map((suggestion) => ({
      placeId: suggestion.placePrediction?.placeId,
      address: suggestion.placePrediction?.text?.text,
    }));
  }

  // =============== API Header Configuration ===============

  /**
   * Get headers for Places API search operations
   */
  private getGooglePlaceApiHeader(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': environment.googleMapsApiKey,
      'X-Goog-FieldMask': 'places.id,places.formattedAddress,places.location,places.displayName',
    });
  }

  /**
   * Get headers for Places API autocomplete operations
   */
  private getGoogleAutoCompleteHeader(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': environment.googleMapsApiKey,
      'X-Goog-FieldMask':
        'suggestions.placePrediction.placeId,suggestions.placePrediction.text.text',
    });
  }

  /**
   * Get headers for Place Details API
   */
  private getGooglePlaceHeader(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': environment.googleMapsApiKey,
      'X-Goog-FieldMask': 'id,formattedAddress,location',
    });
  }
}
