interface Place {
  id: string;
  location?: { lat(): number; lng(): number };
  fetchFields(options: { fields: string[] }): Promise<unknown>;
}
export interface PlaceSelection extends Event { placePrediction: { toPlace(): Place } }
interface PlacesLibrary { PlaceAutocompleteElement: new () => HTMLElement }
interface MapsApi { maps: { importLibrary(name: string): Promise<PlacesLibrary> } }
let loading: Promise<PlacesLibrary> | undefined;

export function loadPlaces(): Promise<PlacesLibrary> {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  if (!key) return Promise.reject(new Error('Configure VITE_GOOGLE_MAPS_API_KEY to enable Google place matching. You can enter your own coordinates below.'));
  const googleWindow = window as Window & { google?: MapsApi; astrydPlacesReady?: () => void };
  if (googleWindow.google?.maps) return googleWindow.google.maps.importLibrary('places');
  if (!loading) {
    loading = new Promise<PlacesLibrary>((resolve, reject) => {
      const script = document.createElement('script');
      googleWindow.astrydPlacesReady = () => {
        googleWindow.google!.maps.importLibrary('places').then(resolve, reject);
        delete googleWindow.astrydPlacesReady;
      };
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async&callback=astrydPlacesReady`;
      script.async = true;
      script.onerror = () => { script.remove(); loading = undefined; reject(new Error('Google Places could not load. Please try again.')); };
      document.head.appendChild(script);
    });
  }
  return loading;
}
