export interface MapLocation {
  lat: number;
  lng: number;
  title: string;
}

export interface MapProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  zoom?: number;
  openBalloon?: boolean;
  controls?: string[];
}

export interface YandexMapsAPI {
  ready: (callback: () => void) => void;
  Map: new (container: HTMLElement, state: any, options?: any) => any;
  Placemark: new (coordinates: [number, number], properties: any, options?: any) => any;
}
