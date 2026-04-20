// Tojrason/frontend/courier/src/pages/Map/Map.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';

import { useGeolocation } from '../../hooks/useGeolocation';
import { useOrderUpdates } from '../../hooks/useOrderUpdates';
import { useSocket } from '../../hooks/useSocket';
import { formatPrice } from '../../utils/formatPrice';
import { formatDistance } from '../../utils/formatDistance';
import Button from '../../components/common/Button/Button';
import Card from '../../components/common/Card/Card';
import Badge from '../../components/common/Badge/Badge';
import Loader from '../../components/common/Loader/Loader';

// Иконаҳои харита
const courierIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const orderIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const deliveryIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Компонент барои идоракунии маркази харита
const MapController: React.FC<{ 
  center: [number, number]; 
  zoom?: number;
  followUser?: boolean;
}> = ({ center, zoom, followUser = true }) => {
  const map = useMap();
  
  useEffect(() => {
    if (followUser) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, map, zoom, followUser]);
  
  return null;
};

// Компонент барои пайгирии клик дар харита
const MapClickHandler: React.FC<{ onMapClick: (latlng: L.LatLng) => void }> = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
};

const Map: React.FC = () => {
  const navigate = useNavigate();
  const mapRef = useRef<L.Map>(null);
  
  const { coordinates: myLocation, isWatching, error: locationError } = useGeolocation({ watch: true });
  const { availableOrders, currentOrder, acceptOrder } = useOrderUpdates();
  const { isConnected } = useSocket();

  const [mapCenter, setMapCenter] = useState<[number, number]>([38.5613, 68.7840]); // Душанбе
  const [mapZoom, setMapZoom] = useState(13);
  const [followUser, setFollowUser] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Навсозии маркази харита ба макони курйер
  useEffect(() => {
    if (myLocation) {
      setMapCenter([myLocation.latitude, myLocation.longitude]);
    }
  }, [myLocation]);

  // Қатъ кардани пайгирии худкор ҳангоми кашонидани харита
  const handleMapDrag = useCallback(() => {
    setFollowUser(false);
  }, []);

  // Бозгашт ба макони корбар
  const handleCenterOnUser = useCallback(() => {
    if (myLocation) {
      setMapCenter([myLocation.latitude, myLocation.longitude]);
      setFollowUser(true);
      mapRef.current?.setView([myLocation.latitude, myLocation.longitude], mapZoom);
    }
  }, [myLocation, mapZoom]);

  // Интихоби фармоиш
  const handleSelectOrder = useCallback((order: any) => {
    setSelectedOrder(order);
    setShowOrderPanel(true);
  }, []);

  // Қабули фармоиш
  const handleAcceptOrder = useCallback(async () => {
    if (selectedOrder) {
      const result = await acceptOrder(selectedOrder.id);
      if (result.success) {
        setShowOrderPanel(false);
        setSelectedOrder(null);
        navigate('/current-order');
      }
    }
  }, [selectedOrder, acceptOrder, navigate]);

  // Зуум кардан
  const handleZoomIn = useCallback(() => {
    setMapZoom(prev => Math.min(prev + 1, 18));
    mapRef.current?.setZoom(mapZoom + 1);
  }, [mapZoom]);

  const handleZoomOut = useCallback(() => {
    setMapZoom(prev => Math.max(prev - 1, 8));
    mapRef.current?.setZoom(mapZoom - 1);
  }, [mapZoom]);

  if (!isWatching && !myLocation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-56px-80px)]">
      {/* Харита */}
      <MapContainer
        ref={mapRef}
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController center={mapCenter} zoom={mapZoom} followUser={followUser} />
        <MapClickHandler onMapClick={() => setShowOrderPanel(false)} />

        {/* Маркери макони курйер */}
        {myLocation && (
          <Marker
            position={[myLocation.latitude, myLocation.longitude]}
            icon={courierIcon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">Макони шумо</p>
                <p className="text-gray-600 text-xs">
                  {myLocation.latitude.toFixed(4)}, {myLocation.longitude.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Фармоиши фаъол */}
        {currentOrder && (
          <>
            {currentOrder.pickupLocation && (
              <Marker
                position={[currentOrder.pickupLocation.lat, currentOrder.pickupLocation.lng]}
                icon={pickupIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold">Гирифтани бор</p>
                    <p className="text-gray-600 text-xs">{currentOrder.pickupAddress}</p>
                  </div>
                </Popup>
              </Marker>
            )}
            {currentOrder.deliveryLocation && (
              <Marker
                position={[currentOrder.deliveryLocation.lat, currentOrder.deliveryLocation.lng]}
                icon={deliveryIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold">Расонидан</p>
                    <p className="text-gray-600 text-xs">{currentOrder.deliveryAddress}</p>
                  </div>
                </Popup>
              </Marker>
            )}
            {route.length > 0 && (
              <Polyline positions={route} color="#10B981" weight={4} opacity={0.7} />
            )}
          </>
        )}

        {/* Фармоишҳои дастрас */}
        {availableOrders.slice(0, 15).map((order) => {
          // Барои намоиш координатаҳои тахминӣ
          const lat = myLocation ? myLocation.latitude + (Math.random() - 0.5) * 0.1 : 38.5613;
          const lng = myLocation ? myLocation.longitude + (Math.random() - 0.5) * 0.1 : 68.7840;
          
          return (
            <Marker
              key={order.id}
              position={[lat, lng]}
              icon={orderIcon}
              eventHandlers={{
                click: () => handleSelectOrder(order),
              }}
            >
              <Popup>
                <div className="text-sm min-w-[180px]">
                  <p className="font-semibold mb-1">#{order.trackingNumber}</p>
                  <p className="text-gray-600 mb-1">{formatDistance(order.distance)} км</p>
                  <p className="font-bold text-emerald-600 mb-2">{formatPrice(order.price)}</p>
                  <Button
                    size="sm"
                    fullWidth
                    onClick={() => handleSelectOrder(order)}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Тафсилот
                  </Button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Контролҳои харита */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </button>
        <button
          onClick={handleCenterOnUser}
          className={`w-10 h-10 rounded-lg shadow-md flex items-center justify-center transition-colors ${
            followUser 
              ? 'bg-emerald-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Нишондиҳандаи пайвасти сокет */}
      <div className="absolute top-4 left-4 z-10">
        <Badge className={`${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {isConnected ? '● Онлайн' : '○ Офлайн'}
        </Badge>
      </div>

      {/* Хатогии локатсия */}
      {locationError && (
        <div className="absolute bottom-20 left-4 right-4 z-10">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{locationError.message}</p>
          </div>
        </div>
      )}

      {/* Панели тафсилоти фармоиш */}
      <AnimatePresence>
        {showOrderPanel && selectedOrder && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-20"
          >
            <Card className="rounded-t-2xl shadow-2xl">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">
                    Фармоиш #{selectedOrder.trackingNumber}
                  </h3>
                  <button
                    onClick={() => setShowOrderPanel(false)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-emerald-100 text-emerald-800">
                    {formatDistance(selectedOrder.distance)} км
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800">
                    {selectedOrder.packageType === 'document' ? 'Ҳуҷҷат' : 
                     selectedOrder.packageType === 'small' ? 'Хурд' : 
                     selectedOrder.packageType === 'medium' ? 'Миёна' : 
                     selectedOrder.packageType === 'large' ? 'Калон' : 'Зудшикан'}
                  </Badge>
                </div>

                <div className="mb-3">
                  <div className="flex items-start gap-2 mb-1">
                    <span className="text-green-500 text-sm mt-0.5">📍</span>
                    <p className="text-sm text-gray-700 flex-1">{selectedOrder.pickupAddress}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 text-sm mt-0.5">🏁</span>
                    <p className="text-sm text-gray-700 flex-1">{selectedOrder.deliveryAddress}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600">Нархи фармоиш:</span>
                  <span className="text-xl font-bold text-emerald-600">
                    {formatPrice(selectedOrder.price)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleAcceptOrder}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Қабул кардан
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowOrderPanel(false)}
                  >
                    Бекор
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Тугмаи навсозӣ */}
      <button
        onClick={handleCenterOnUser}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-white rounded-full shadow-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        {followUser ? 'Пайгирии макон' : 'Бозгашт ба макон'}
      </button>
    </div>
  );
};

export default Map;
