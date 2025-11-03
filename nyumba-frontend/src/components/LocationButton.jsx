import React, { useState } from 'react';
import { useMap } from 'react-leaflet';
import { FaCrosshairs } from 'react-icons/fa';
import { toast } from 'react-toastify';
import L, { Icon } from 'leaflet'; // <-- 1. IMPORT LEAFLET (L)

// --- 2. CREATE A NEW BLUE ICON FOR THE USER'S LOCATION ---
const userIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// This component is now just the control, not the container
const LocationButton = () => {
    const map = useMap();
    const [loading, setLoading] = useState(false);

    const handleClick = () => {
        setLoading(true);
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser.');
            setLoading(false);
            return;
        }

        // --- 3. OPTIONS FOR HIGH ACCURACY ---
        const options = {
            enableHighAccuracy: true, // Request the best possible accuracy
            timeout: 5000, // Stop trying after 5 seconds
            maximumAge: 0 // Don't use a cached position
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const latLng = [latitude, longitude];
                
                // Fly to the user's location
                map.flyTo(latLng, 14);
                toast.success('Location found!');

                // --- 4. ADD THE BLUE MARKER TO THE MAP ---
                L.marker(latLng, { icon: userIcon })
                    .addTo(map)
                    .bindPopup('<b>You are here!</b>')
                    .openPopup();
                
                setLoading(false);
            },
            (error) => {
                toast.error('Unable to retrieve your location. Please check browser permissions.');
                setLoading(false);
            },
            options // <-- Pass the high-accuracy options
        );
    };

    // We style it to look like a Leaflet control
    return (
        <div className="leaflet-control leaflet-bar">
            <button
                onClick={handleClick}
                disabled={loading}
                title="Find my location"
                className="w-8 h-8 flex items-center justify-center bg-white text-gray-700 rounded-sm shadow-md hover:bg-gray-100 disabled:opacity-50"
            >
                {loading ? (
                    <div className="w-4 h-4 border-2 border-t-transparent border-gray-700 rounded-full animate-spin"></div>
                ) : (
                    <FaCrosshairs />
                )}
            </button>
        </div>
    );
};

export default LocationButton;