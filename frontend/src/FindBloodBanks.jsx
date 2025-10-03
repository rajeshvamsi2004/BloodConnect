// src/components/Dashboard/FindBloodBanks.js
import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindow } from '@react-google-maps/api';

// --- Map Configuration ---
const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem'
};

const defaultCenter = {
  lat: 20.5937, // Default center of the map (India)
  lng: 78.9629
};

const libraries = ['places']; // Enable the 'places' library

const FindBloodBanks = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [map, setMap] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchQueryRef = useRef(null);

  const onLoad = useCallback(function callback(mapInstance) {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const findNearbyBloodBanks = (location) => {
    if (!map) return;
    setIsLoading(true);
    setBloodBanks([]);

    const placesService = new window.google.maps.places.PlacesService(map);
    const request = {
      location: location,
      radius: '5000', // 5 kilometers
      keyword: 'blood bank'
    };

    placesService.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        setBloodBanks(results);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        alert('Could not find nearby blood banks. Please try a different location.');
      }
    });
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCenter(pos);
          setUserLocation(pos);
          findNearbyBloodBanks(pos);
          map.setZoom(14);
        },
        () => {
          setIsLoading(false);
          alert('Error: The Geolocation service failed. Please enable location services in your browser.');
        }
      );
    } else {
      alert("Error: Your browser doesn't support geolocation.");
    }
  };

  const handleSearch = () => {
    const query = searchQueryRef.current.value;
    if (!query) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: query }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const pos = { lat: location.lat(), lng: location.lng() };
        setCenter(pos);
        setUserLocation(pos);
        findNearbyBloodBanks(pos);
        map.setZoom(14);
      } else {
        alert(`Geocode was not successful for the following reason: ${status}`);
      }
    });
  };

  const handleMarkerClick = (markerId) => {
    setActiveMarker(markerId);
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Find a Blood Bank</h2>
      
      {/* --- Search Controls --- */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          ref={searchQueryRef}
          placeholder="Enter a city or address"
          className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <div className="flex gap-4">
          <button onClick={handleSearch} className="w-full md:w-auto px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition">Search</button>
          <button onClick={handleUseMyLocation} className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition">Use My Location</button>
        </div>
      </div>

      {/* --- Map and Results --- */}
      <div className="flex flex-col lg:flex-row gap-4 h-[60vh]">
        {/* Map */}
        <div className="w-full lg:w-2/3 h-full relative">
          {isLoading && <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10"><p className="text-lg font-semibold">Searching...</p></div>}
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={8}
            onLoad={onLoad}
            onUnmount={onUnmount}
          >
            {userLocation && <MarkerF position={userLocation} title="Your Location" />}
            
            {bloodBanks.map((bank) => (
              <MarkerF
                key={bank.place_id}
                position={bank.geometry.location}
                title={bank.name}
                onClick={() => handleMarkerClick(bank.place_id)}
                icon={{
                    url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                }}
              >
                {activeMarker === bank.place_id && (
                  <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                    <div>
                      <h3 className="font-bold">{bank.name}</h3>
                      <p>{bank.vicinity}</p>
                    </div>
                  </InfoWindow>
                )}
              </MarkerF>
            ))}
          </GoogleMap>
        </div>

        {/* List of Blood Banks */}
        <div className="w-full lg:w-1/3 h-full overflow-y-auto p-2 border rounded-md">
          <h3 className="font-bold text-lg mb-2">Nearby Blood Banks</h3>
          {bloodBanks.length > 0 ? (
            <ul className="space-y-2">
              {bloodBanks.map((bank) => (
                <li 
                  key={bank.place_id} 
                  className="p-3 border rounded-md cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                      setCenter(bank.geometry.location);
                      setActiveMarker(bank.place_id);
                      map.setZoom(15);
                  }}
                >
                  <p className="font-semibold text-red-700">{bank.name}</p>
                  <p className="text-sm text-gray-600">{bank.vicinity}</p>
                  <p className="text-sm text-yellow-600">Rating: {bank.rating} ({bank.user_ratings_total} reviews)</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No blood banks found. Try searching for a location.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindBloodBanks;