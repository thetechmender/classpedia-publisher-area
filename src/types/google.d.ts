declare global {
  interface Window {
    google: typeof import('@types/google.maps');
  }
}

export {};
