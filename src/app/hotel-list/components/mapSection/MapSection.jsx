// app/map/page.js or pages/map.js
'use client'; // if using App Router
import styles from './MapSection.module.css';

import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

export default function MapSection() {
  const position = { lat: 37.7749, lng: -122.4194 }; // San Francisco

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <div className={styles.mapContainer}>
        <Map
          defaultCenter={position}
          defaultZoom={12}
          gestureHandling={'greedy'}
          disableDefaultUI={false}
        >
          <Marker position={position} />
        </Map>
      </div>
    </APIProvider>
  );
}