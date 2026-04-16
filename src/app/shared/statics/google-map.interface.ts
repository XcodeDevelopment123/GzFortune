// Base interfaces for common properties
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PlaceLocation {
  latitude: number;
  longitude: number;
}

// New Places API (v1) response interfaces
export interface PlacesApiV1Response {
  places: PlaceV1[];
}

export interface PlaceV1 {
  id: string;
  place_id?: string;
  displayName: {
    text: string;
    languageCode?: string;
  };
  formattedAddress: string;
  location: PlaceLocation;
}

export interface PlaceDetailsV1Response {
  id: string;
  formattedAddress: string;
  location: PlaceLocation;
}

export interface PlaceAutocompleteSuggestion {
  placePrediction: {
    placeId: string;
    text: {
      text: string;
    };
  };
}

export interface PlaceAutocompleteResponse {
  suggestions: PlaceAutocompleteSuggestion[];
}

// Legacy Places API response interfaces
export interface PlacesApiLegacyResponse {
  status: string;
  results: PlaceLegacy[];
}

export interface PlaceLegacy {
  place_id: string;
  name: string;
  formatted_address?: string;
  vicinity?: string;
  geometry: {
    location: Coordinates;
  };
}

// Geocoding API response interfaces
export interface GeocodingResponse {
  status: string;
  results: GeocodingResult[];
}

export interface GeocodingResult {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: Coordinates;
  };
  address_components: AddressComponent[];
}

export interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

// Geolocation API response interface
export interface GeolocationResponse {
  location: Coordinates;
  accuracy: number;
}

// Transformed place data interface (consistent format returned by the service)
export interface TransformedPlace {
  name: string;
  formattedAddress: string;
  location: PlaceLocation;
  placeId: string;
}

// Address suggestion interface (for autocomplete)
export interface AddressSuggestion {
  placeId: string;
  address: string;
}
