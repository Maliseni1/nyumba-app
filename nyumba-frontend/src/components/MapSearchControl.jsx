import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

const MapSearchControl = () => {
    const map = useMap();

    useEffect(() => {
        // --- 1. CONFIGURE THE PROVIDER TO *ONLY* SEARCH ZAMBIA ---
        const provider = new OpenStreetMapProvider({
            params: {
                'accept-language': 'en', // Prefer English results
                countrycodes: 'ZM', // Restrict to Zambia (ISO code)
                
                // --- THIS IS THE NEW, MORE POWERFUL FIX ---
                // This is the bounding box for Zambia
                viewbox: '22,-18,34,-8', 
                // This tells Nominatim to *strictly* limit results to that box
                bounded: 1, 
            },
        });

        const searchControl = new GeoSearchControl({
            provider: provider,
            style: 'bar',
            showMarker: false,
            autoClose: true,
            keepResult: true,
            classNames: {
                input: 'dark-text-geosearch-input',
            },
        });

        map.addControl(searchControl);

        // --- 2. THIS IS THE ACTION THAT RUNS WHEN YOU *CLICK* A RESULT ---
        const onResult = (e) => {
            // e.result.bounds is the bounding box of the location
            if (e.result.bounds) {
                map.fitBounds(e.result.bounds);
            } else {
                // Fallback for a simple point
                map.setView([e.result.y, e.result.x], 16); 
            }
        };

        map.on('geosearch/showlocation', onResult);
        // --- END OF FIXES ---

        // Clean up the control and listener when the component unmounts
        return () => {
            map.off('geosearch/showlocation', onResult);
            map.removeControl(searchControl);
        };
    }, [map]);

    return null; // This component doesn't render any visible JSX
};

export default MapSearchControl;