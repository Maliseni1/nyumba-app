import React, { useState, useEffect } from 'react';
// --- 1. REMOVE ZOOMCONTROL FROM IMPORTS ---
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import { getListings } from '../services/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Icon } from 'leaflet';
import LocationButton from '../components/LocationButton';

// Fix for default Leaflet marker icon
const customIcon = new Icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const MapPage = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const { data } = await getListings();
                const validListings = data.filter(listing => 
                    listing.location && 
                    listing.location.coordinates && 
                    listing.location.coordinates.length === 2
                );
                setListings(validListings);
            } catch (error) {
                toast.error('Could not fetch listings for the map.');
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, []);

    if (loading) {
        return <div className="pt-24 text-center text-slate-400">Loading map...</div>;
    }

    return (
        <div className="pt-16 h-[calc(100vh-4rem)] w-full">
            <MapContainer 
                center={[-15.4167, 28.2833]} // Default center (e.g., Lusaka)
                zoom={13} 
                scrollWheelZoom={true} 
                className="w-full h-full"
                // --- 2. REMOVE zoomControl={false} ---
                // This lets the default zoom control render in the topleft.
            >
                {/* --- 3. REMOVE THE MANUAL <ZoomControl /> --- */}

                <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="Street Map">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Satellite View">
                        <TileLayer
                            url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                            attribution='&copy; <a href="https.www.esri.com/">Esri</a>'
                        />
                    </LayersControl.BaseLayer>
                </LayersControl>

                <div className="leaflet-top leaflet-right">
                    <div style={{ marginTop: '50px' }}>
                        <LocationButton />
                    </div>
                </div>

                {listings.map(listing => (
                    <Marker 
                        key={listing._id} 
                        position={[listing.location.coordinates[1], listing.location.coordinates[0]]}
                        icon={customIcon}
                    >
                        <Popup>
                            <div className="w-48">
                                <img 
                                    src={listing.images[0]} 
                                    alt={listing.title} 
                                    className="w-full h-24 object-cover rounded-md mb-2"
                                />
                                <h4 className="font-bold text-sm text-gray-900 truncate">{listing.title}</h4>
                                <p className="text-xs text-gray-700 mb-1">K{listing.price.toLocaleString()} / month</p>
                                <Link 
                                    to={`/listing/${listing._id}`} 
                                    className="text-xs font-semibold text-sky-600 hover:text-sky-800"
                                >
                                    View Details &rarr;
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapPage;