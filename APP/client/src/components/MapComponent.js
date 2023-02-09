import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import useProgressController from '../StoreApi';

// Map Component: This component can create a leaflet map
function Map() {
    const { currentPosition, setPosition } = useProgressController();
    const mapRef = useRef(null)
    const markerRef = useRef(null)

    useEffect(() => {
    // create map
    mapRef.current = L.map('map', {
        center: [currentPosition.lat, currentPosition.lng],
        zoom: 5,
        layers: [
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution:
            '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }),
        ]
    });
    mapRef.current.locate({setView: true, maxZoom: 17});
    }, []);
    // set the new position from locate
    useEffect(() => {
        mapRef.current.on('locationfound', function(e) {
            const newPosition = {
                lat: e.latlng.lat,
                lng: e.latlng.lng
            }
            console.log(newPosition)
            // set the new position and update the marker
            setPosition(newPosition);
            markerRef.current.setLatLng(newPosition).update()
        });
    }, []);

    // create the marker
    useEffect(() => {
        if (markerRef.current) {
            markerRef.current.setLatLng(currentPosition).update()
        }
        else {
            markerRef.current = L.marker(currentPosition, {draggable: 'true'}).addTo(mapRef.current)
        }
    }, []);
    // on dragMarker side effect
    useEffect(() => {
        markerRef.current.on('dragend', function(e) {
            const newPosition = {
                lat: markerRef.current.getLatLng().lat,
                lng: markerRef.current.getLatLng().lng,
            }
            console.log(newPosition)
            // set the new position
            setPosition(newPosition);
        });
    })
    return <div style={{height:"400px"}} id="map"></div>
}

export default Map;
