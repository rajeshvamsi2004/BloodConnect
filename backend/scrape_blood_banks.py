# scrape_blood_banks.py

import sys
import json
import requests

def get_facilities_from_osm_by_coords(lat, lon, radius_km=50):
    overpass_url = "http://overpass-api.de/api/interpreter"
    radius_meters = radius_km * 1000

    overpass_query = f"""
    [out:json][timeout:25];
    (
      node["amenity"~"blood_bank|hospital"](around:{radius_meters},{lat},{lon});
      way["amenity"~"blood_bank|hospital"](around:{radius_meters},{lat},{lon});
      relation["amenity"~"blood_bank|hospital"](around:{radius_meters},{lat},{lon});
      
      node["healthcare"="blood_donation"](around:{radius_meters},{lat},{lon});
      way["healthcare"="blood_donation"](around:{radius_meters},{lat},{lon});
      relation["healthcare"="blood_donation"](around:{radius_meters},{lat},{lon});
    );
    out center;
    """

    try:
        response = requests.get(overpass_url, params={'data': overpass_query})
        response.raise_for_status()
        data = response.json()
    except requests.exceptions.RequestException as e:
        print(json.dumps({"error": f"API request error: {e}"}), file=sys.stderr)
        sys.exit(1)

    results_list = []
    for element in data.get('elements', []):
        tags = element.get('tags', {})
        
        # --- CATEGORIZATION LOGIC ---
        amenity = tags.get('amenity')
        healthcare = tags.get('healthcare')
        
        # Default to hospital, but prioritize blood bank tags
        item_type = 'hospital'
        if amenity == 'blood_bank' or healthcare == 'blood_donation':
            item_type = 'blood_bank'

        if 'center' in element:
            coords = element['center']
        elif 'lat' in element and 'lon' in element:
            coords = element
        else:
            continue

        address_parts = [tags.get('addr:housenumber'), tags.get('addr:street'), tags.get('addr:city'), tags.get('addr:postcode')]
        address = ' '.join(part for part in address_parts if part).strip()

        results_list.append({
            "name": tags.get('name', 'Hospital / Blood Center'),
            "address": address or "Address not available",
            "phone": tags.get('phone', 'Phone not available'),
            "location": {"lat": coords['lat'], "lng": coords['lon']},
            "type": item_type  # Add the new 'type' field
        })
        
    print(json.dumps(results_list))

if __name__ == "__main__":
    if len(sys.argv) == 3:
        try:
            get_facilities_from_osm_by_coords(float(sys.argv[1]), float(sys.argv[2]))
        except ValueError:
            print(json.dumps({"error": "Invalid coordinate format."}), file=sys.stderr)
            sys.exit(1)
    else:
        print(json.dumps({"error": "Latitude and longitude arguments are required."}), file=sys.stderr)
        sys.exit(1)