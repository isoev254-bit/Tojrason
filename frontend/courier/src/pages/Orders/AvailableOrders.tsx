// Tojrason/frontend/courier/src/pages/Orders/AvailableOrders.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useOrderUpdates } from '../../hooks/useOrderUpdates';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useDebouncedCallback } from '../../hooks/useDebounce';
import { formatPrice } from '../../utils/formatPrice';
import { formatDistance, formatDuration } from '../../utils/formatDistance';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Loader from '../../components/common/Loader/Loader';
import Card from '../../components/common/Card/Card';
import Badge from '../../components/common/Badge/Badge';
import Modal from '../../components/common/Modal/Modal';

// Иконаи фармоиш барои харита
const orderIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Иконаи макони курйер
const courierIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Компонент барои навсозии маркази харита
const MapController: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const AvailableOrders: React.FC = () => {
  const navigate = useNavigate();
  const { coordinates: myLocation } = useGeolocation({ watch: true });
  const { availableOrders, acceptOrder, rejectOrder, isLoadingAvailable, refresh } = useOrderUpdates();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'time'>('distance');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([38.5613, 68.7840]); // Душанбе

  // Навсозии маркази харита ба макони курйер
  useEffect(() => {
    if (myLocation) {
      setMapCenter([myLocation.latitude, myLocation.longitude]);
    }
  }, [myLocation]);

  // Филтр ва ҷобаҷогузории фармоишҳо
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...availableOrders];

    // Филтр аз рӯи ҷустуҷӯ
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.trackingNumber.toLowerCase().includes(query) ||
        order.pickupAddress.toLowerCase().includes(query) ||
        order.deliveryAddress.toLowerCase().includes(query)
      );
    }

    // Филтр аз рӯи намуди бор
    if (filterType) {
      filtered = filtered.filter(order => order.packageType === filterType);
    }

    // Ҷобаҷогузорӣ
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'price':
          return b.price - a.price;
        case 'time':
          return a.estimatedTime - b.estimatedTime;
        default:
          return 0;
      }
    });

    return filtered;
  }, [availableOrders, searchQuery, filterType, sortBy]);

  // Debounced ҷустуҷӯ
  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearchQuery(value);
  }, 300);

  // Қабули фармоиш
  const handleAcceptOrder = useCallback(async (orderId: string) => {
    setIsAccepting(true);
    const result = await acceptOrder(orderId);
    setIsAccepting(false);
    setShowOrderModal(false);
    
    if (result.success) {
      navigate('/current-order');
    }
  }, [acceptOrder, navigate]);

  // Кушодани модали тафсилот
  const handleViewDetails = useCallback((order: any) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  }, []);

  // Навсозӣ
  const handleRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  return (
    <div className="pb-4">
      {/* Сарлавҳа */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Фармоишҳои дастрас</h1>
          <p className="text-sm text-gray-500">{filteredAndSortedOrders.length} фармоиш дар наздикии шумо</p>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Харита */}
      <div className="mb-4 h-64 rounded-xl overflow-hidden shadow-md">
        <MapContainer
          center={mapCenter}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController center={mapCenter} />
          
          {/* Маркери макони курйер */}
          {myLocation && (
            <Marker
              position={[myLocation.latitude, myLocation.longitude]}
              icon={courierIcon}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">Макони шумо</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Маркерҳои фармоишҳо */}
          {filteredAndSortedOrders.slice(0, 20).map((order) => {
            // Барои намоиш дар харита координатаҳои тахминӣ истифода мешаванд
            // Дар версияи воқеӣ координатаҳои суроғаҳо бояд истифода шаванд
            const lat = myLocation ? myLocation.latitude + (Math.random() - 0.5) * 0.05 : 38.5613;
            const lng = myLocation ? myLocation.longitude + (Math.random() - 0.5) * 0.05 : 68.7840;
            
            return (
              <Marker
                key={order.id}
                position={[lat, lng]}
                icon={orderIcon}
              >
                <Popup>
                  <div className="text-sm min-w-[200px]">
                    <p className="font-semibold mb-1">#{order.trackingNumber}</p>
                    <p className="text-gray-600 mb-1">{formatDistance(order.distance)} км</p>
                    <p className="font-bold text-emerald-600 mb-2">{formatPrice(order.price)}</p>
                    <Button
                      size="sm"
                      fullWidth
                      onClick={() => handleViewDetails(order)}
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
      </div>

      {/* Филтрҳо ва ҷобаҷогузорӣ */}
      <div className="mb-4 space-y-3">
        <Input
          placeholder="Ҷустуҷӯ бо рақами пайгирӣ ё суроға..."
          onChange={(e) => debouncedSearch(e.target.value)}
          leftIcon={
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />

        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Ҳамаи намудҳо</option>
            <option value="document">Ҳуҷҷат</option>
            <option value="small">Хурд</option>
            <option value="medium">Миёна</option>
            <option value="large">Калон</option>
            <option value="fragile">Зудшикан</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="distance">Наздиктарин</option>
            <option value="price">Қиматтарин</option>
            <option value="time">Зудтарин</option>
          </select>
        </div>
      </div>

      {/* Рӯйхати фармоишҳо */}
      {isLoadingAvailable ? (
        <div className="flex justify-center py-8">
          <Loader size="lg" />
        </div>
      ) : filteredAndSortedOrders.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-4xl mb-3 block">📭</span>
          <p className="text-gray-500">Фармоиши дастрас нест</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchQuery || filterType ? 'Бо ин филтрҳо фармоиш ёфт нашуд' : 'Фармоишҳои нав ба зудӣ пайдо мешаванд'}
          </p>
          {(searchQuery || filterType) && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setFilterType('');
              }}
            >
              Тоза кардани филтрҳо
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedOrders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs text-gray-500 mb-1">#{order.trackingNumber}</p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-100 text-emerald-800">
                      {formatDistance(order.distance)} км
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800">
                      {formatDuration(order.estimatedTime)}
                    </Badge>
                  </div>
                </div>
                <p className="text-lg font-bold text-emerald-600">
                  {formatPrice(order.price)}
                </p>
              </div>

              <div className="mb-3">
                <div className="flex items-start gap-2 mb-1">
                  <span className="text-green-500 text-sm mt-0.5">📍</span>
                  <p className="text-sm text-gray-700 flex-1 line-clamp-1">{order.pickupAddress}</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-500 text-sm mt-0.5">🏁</span>
                  <p className="text-sm text-gray-700 flex-1 line-clamp-1">{order.deliveryAddress}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>📦 {order.packageType === 'document' ? 'Ҳуҷҷат' : 
                      order.packageType === 'small' ? 'Хурд' : 
                      order.packageType === 'medium' ? 'Миёна' : 
                      order.packageType === 'large' ? 'Калон' : 'Зудшикан'}</span>
                <span>⚖️ {order.weight} кг</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => handleViewDetails(order)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Қабул кардан
                </Button>
                <Button
                  variant="outline"
                  onClick={() => rejectOrder(order.id, 'Рад карда шуд')}
                >
                  Рад кардан
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Модали тафсилоти фармоиш */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        title={`Фармоиш #${selectedOrder?.trackingNumber || ''}`}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge className="bg-emerald-100 text-emerald-800">
                {formatDistance(selectedOrder.distance)} км
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                {formatDuration(selectedOrder.estimatedTime)}
              </Badge>
              <p className="text-xl font-bold text-emerald-600">
                {formatPrice(selectedOrder.price)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Суроғаи гирифтан:</p>
              <p className="text-gray-900">{selectedOrder.pickupAddress}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Суроғаи расонидан:</p>
              <p className="text-gray-900">{selectedOrder.deliveryAddress}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-500">Намуди бор</p>
                <p className="font-medium">
                  {selectedOrder.packageType === 'document' ? 'Ҳуҷҷат' : 
                   selectedOrder.packageType === 'small' ? 'Хурд' : 
                   selectedOrder.packageType === 'medium' ? 'Миёна' : 
                   selectedOrder.packageType === 'large' ? 'Калон' : 'Зудшикан'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Вазн</p>
                <p className="font-medium">{selectedOrder.weight} кг</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                fullWidth
                onClick={() => handleAcceptOrder(selectedOrder.id)}
                disabled={isAccepting}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isAccepting ? <Loader size="sm" color="white" /> : 'Қабул кардани фармоиш'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  rejectOrder(selectedOrder.id, 'Рад карда шуд');
                  setShowOrderModal(false);
                }}
              >
                Рад кардан
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AvailableOrders;
