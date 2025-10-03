// MapComponent.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Map, Marker, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

// Make sure your Mapbox token is set in a .env file
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

function MapComponent() {
  // State for each category
  const [bloodBanks, setBloodBanks] = useState([]);
  const [hospitals, setHospitals] = useState([]);

  // General state
  const [userLocation, setUserLocation] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // Start loading initially
  const [locationQuery, setLocationQuery] = useState('');

  const [viewState, setViewState] = useState({
    longitude: 80.6480, // Default to a central location in India
    latitude: 16.5062,
    zoom: 6,
  });

  // Function to fetch all facilities from the backend
  const fetchFacilities = async (latitude, longitude, locationName) => {
    setLoading(true);
    setError('');
    setBloodBanks([]);
    setHospitals([]);

    try {
      const response = await axios.get(`http://localhost:4000/api/blood-banks`, {
        params: { lat: latitude, lon: longitude, locationName: locationName }
      });

      if (response.data && response.data.length > 0) {
        const allResults = response.data;
        // Filter results into the correct state arrays based on the 'type' field
        setBloodBanks(allResults.filter(item => item.type === 'blood_bank'));
        setHospitals(allResults.filter(item => item.type === 'hospital'));
      } else {
        setError('No facilities found near this location.');
      }
    } catch (err) {
      setError('Error fetching data. Is the backend server running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Function to get the user's location and then fetch data
  const handleGetLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setViewState(prev => ({ ...prev, longitude, latitude, zoom: 12 }));

        // Reverse-geocode to get a location name for the Justdial scraper
        try {
          const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`;
          const geoResponse = await axios.get(url);
          const locationName = geoResponse.data.features.find(f => f.place_type.includes('place'))?.text || 'your location';
          await fetchFacilities(latitude, longitude, locationName);
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
          await fetchFacilities(latitude, longitude, "your location"); // Fallback
        }
      },
      (geoError) => {
        setError('Unable to retrieve your location. Please enable location services.');
        setLoading(false);
      }
    );
  };
  
  // --- NEW: Automatically ask for location when the component loads ---
  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      setError('Mapbox token is not set in the .env file.');
      setLoading(false);
      return;
    }
    // Call the function to get location and fetch data on initial render
    handleGetLocation();
  }, []); // The empty array [] ensures this runs only once

  // Handler for the text search input
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!locationQuery) return;
    try {
      const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationQuery)}.json?access_token=${MAPBOX_TOKEN}`;
      const geocodingResponse = await axios.get(geocodingUrl);
      if (geocodingResponse.data.features.length > 0) {
        const [longitude, latitude] = geocodingResponse.data.features[0].center;
        setViewState({ longitude, latitude, zoom: 12 });
        await fetchFacilities(latitude, longitude, locationQuery);
      } else {
        setError('Location not found.');
      }
    } catch (err) {
      setError('Error fetching location data.');
    }
  };
  
  // Handler for when a user clicks an item in the sidebar
  const handleItemSelect = (item) => {
      setSelectedItem(item);
      if (item.location) {
        setViewState(prev => ({ ...prev, longitude: item.location.lng, latitude: item.location.lat, zoom: 14 }));
      }
  };

  return (
    <div className="flex h-screen font-sans">
      <aside className="w-96 flex-shrink-0 bg-gray-100 border-r border-gray-300 flex flex-col">
        {/* --- Top Search Bar Section --- */}
        <div className="p-4 border-b border-gray-300">
          <h1 className="text-2xl font-bold text-gray-800">Blood Bank Finder</h1>
          <form onSubmit={handleSearch} className="mt-4">
            <label htmlFor="location-search" className="block text-sm font-medium text-gray-700">Search Another Location</label>
            <div className="flex mt-1">
              <input type="text" id="location-search" value={locationQuery} onChange={(e) => setLocationQuery(e.target.value)} placeholder="e.g., Eluru, AP" className="flex-grow p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"/>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-r-md hover:bg-blue-700" disabled={loading}>
                {loading ? '...' : 'Search'}
              </button>
            </div>
          </form>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>

        {/* --- Results Section with Separate Divs --- */}
        <div className="flex-grow overflow-y-auto">
          {loading && <p className="p-4 text-center text-gray-600">Finding nearby facilities...</p>}
          
          {/* DIV 1: BLOOD BANKS */}
          {bloodBanks.length > 0 && (
            <div className="border-b border-gray-300">
              <h2 className="p-4 text-xl font-semibold bg-red-100 border-b border-gray-300 text-red-800 sticky top-0">
                Blood Banks
              </h2>
              <ul>
                {bloodBanks.map((bank, index) => (
                  <li key={`bank-${index}`} onClick={() => handleItemSelect(bank)} className="p-4 border-b border-gray-200 cursor-pointer hover:bg-red-50">
                    <h3 className="font-bold text-gray-900">{bank.name}</h3>
                    <p className="text-sm text-gray-600">{bank.address}</p>
                    <p className="text-sm text-gray-600">{bank.phone}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* DIV 2: HOSPITALS */}
          {hospitals.length > 0 && (
            <div>
              <h2 className="p-4 text-xl font-semibold bg-blue-100 border-b border-gray-300 text-blue-800 sticky top-0">
                Hospitals
              </h2>
              <ul>
                {hospitals.map((hospital, index) => (
                  <li key={`hospital-${index}`} onClick={() => handleItemSelect(hospital)} className="p-4 border-b border-gray-200 cursor-pointer hover:bg-blue-50">
                    <h3 className="font-bold text-gray-900">{hospital.name}</h3>
                    <p className="text-sm text-gray-600">{hospital.address}</p>
                    <p className="text-sm text-gray-600">{hospital.phone}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </aside>

      {/* --- Map Area --- */}
      <main className="flex-grow">
        <Map {...viewState} onMove={evt => setViewState(evt.viewState)} style={{ width: '100%', height: '100%' }} mapStyle="mapbox://styles/mapbox/streets-v11" mapboxAccessToken={MAPBOX_TOKEN}>
          {userLocation && <Marker longitude={userLocation.longitude} latitude={userLocation.latitude} color="green" />}
          
          {/* Blood Bank Markers (Red) */}
          {bloodBanks.filter(b => b.location).map((b, i) => <Marker key={`m-b-${i}`} longitude={b.location.lng} latitude={b.location.lat} color="red" onClick={(e) => { e.originalEvent.stopPropagation(); handleItemSelect(b); }} />)}

          {/* Hospital Markers (Blue) */}
          {hospitals.filter(h => h.location).map((h, i) => <Marker key={`m-h-${i}`} longitude={h.location.lng} latitude={h.location.lat} color="blue" onClick={(e) => { e.originalEvent.stopPropagation(); handleItemSelect(h); }} />)}

          {/* Popup for selected item */}
          {selectedItem && selectedItem.location && (
            <Popup longitude={selectedItem.location.lng} latitude={selectedItem.location.lat} onClose={() => setSelectedItem(null)} anchor="top" closeOnClick={false}>
              <div className="p-1">
                <h3 className="text-lg font-bold text-gray-900">{selectedItem.name}</h3>
                <p className="text-sm text-gray-700">{selectedItem.address}</p>
              </div>
            </Popup>
          )}
        </Map>
      </main>
    </div>
  );
}

export default MapComponent;