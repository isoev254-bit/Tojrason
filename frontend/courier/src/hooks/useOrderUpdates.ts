// Tojrason/frontend/courier/src/hooks/useOrderUpdates.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSocket } from './useSocket';
import { useGeolocation } from './useGeolocation';
import { ordersApi } from '../api';
import {
  addOrder,
  updateOrderInList,
  removeOrderFromList,
  setCurrentOrder,
  updateCurrentOrder,
  updateOrderStatus as updateOrderStatusAction,
  clearCurrentOrder,
  selectOrders,
  selectCurrentOrder,
} from '../store/slices/orderSlice';
import { selectCourierStatus } from '../store/slices/courierSlice';
import { COURIER_STATUS, ORDER_STATUS } from '../utils/constants';
import { CourierOrder } from '../types/courier.types';
import { Order } from '../types/order.types';

export interface NewOrderNotification {
  order: CourierOrder;
  expiresAt: string;
}

export const useOrderUpdates = () => {
  const dispatch = useDispatch();
  const courierStatus = useSelector(selectCourierStatus);
  const orders = useSelector(selectOrders);
  const currentOrder = useSelector(selectCurrentOrder);
  
  const {
    onNewOrder,
    onOrderUpdate,
    onOrderAccepted,
    onOrderCancelled,
    onEarningsUpdate,
    updateLocation: socketUpdateLocation,
    acceptOrder: socketAcceptOrder,
    rejectOrder: socketRejectOrder,
    updateOrderStatus: socketUpdateOrderStatus,
    isConnected,
  } = useSocket();

  const { coordinates, setCurrentOrderId, forceSyncLocation } = useGeolocation({
    autoSync: true,
    watch: true,
  });

  const [availableOrders, setAvailableOrders] = useState<CourierOrder[]>([]);
  const [newOrderNotification, setNewOrderNotification] = useState<NewOrderNotification | null>(null);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);

  // Танзими ID-и фармоиши ҷорӣ барои пайгирии макон
  useEffect(() => {
    setCurrentOrderId(currentOrder?.id || null);
  }, [currentOrder?.id, setCurrentOrderId]);

  // Боргирии фармоишҳои дастрас
  const fetchAvailableOrders = useCallback(async () => {
    // Танҳо агар курйер онлайн ё дар расонидан бошад
    const isActive = courierStatus === COURIER_STATUS.ONLINE || 
                     courierStatus === COURIER_STATUS.ON_DELIVERY;
    
    if (!isActive) {
      setAvailableOrders([]);
      return;
    }

    setIsLoadingAvailable(true);
    try {
      const orders = await ordersApi.getAvailableOrders({
        sortBy: 'distance',
        sortOrder: 'asc',
        limit: 20,
      });
      setAvailableOrders(orders);
    } catch (error) {
      console.error('Failed to fetch available orders:', error);
    } finally {
      setIsLoadingAvailable(false);
    }
  }, [courierStatus]);

  // Боргирии фармоишҳои қабулкарда
  const fetchMyOrders = useCallback(async () => {
    try {
      const myOrders = await ordersApi.getMyOrders({
        sortBy: 'createdAt',
        sortOrder: 'desc',
        limit: 50,
      });
      // Навсозӣ дар Redux
      myOrders.forEach(order => {
        dispatch(addOrder(order as any));
      });
    } catch (error) {
      console.error('Failed to fetch my orders:', error);
    }
  }, [dispatch]);

  // Боргирии аввалаи фармоишҳо
  useEffect(() => {
    fetchAvailableOrders();
    fetchMyOrders();
  }, [fetchAvailableOrders, fetchMyOrders]);

  // Навсозии даврагии фармоишҳои дастрас
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAvailableOrders();
    }, 30000); // ҳар 30 сония

    return () => clearInterval(interval);
  }, [fetchAvailableOrders]);

  // Обшавӣ ба фармоиши нав тавассути сокет
  useEffect(() => {
    const unsubscribe = onNewOrder((data) => {
      // Илова кардани фармоиш ба рӯйхати дастрас
      const newOrder: CourierOrder = {
        id: data.orderId,
        trackingNumber: data.trackingNumber,
        pickupAddress: data.pickupAddress,
        deliveryAddress: data.deliveryAddress,
        recipientName: '',
        recipientPhone: '',
        packageType: data.packageType,
        weight: 0,
        price: data.price,
        distance: data.distance,
        estimatedTime: data.estimatedTime,
        status: ORDER_STATUS.PENDING,
        createdAt: new Date().toISOString(),
      };

      setAvailableOrders(prev => [newOrder, ...prev]);
      
      // Намоиши огоҳӣ
      setNewOrderNotification({
        order: newOrder,
        expiresAt: data.expiresAt,
      });

      // Пинҳон кардани огоҳӣ пас аз 30 сония
      setTimeout(() => {
        setNewOrderNotification(null);
      }, 30000);
    });

    return unsubscribe;
  }, [onNewOrder]);

  // Обшавӣ ба навсозии статуси фармоиш
  useEffect(() => {
    const unsubscribe = onOrderUpdate((data) => {
      dispatch(updateOrderStatusAction({
        orderId: data.orderId,
        status: data.status as any,
      }));

      // Агар фармоиш дар рӯйхати дастрас бошад, онро нест мекунем
      setAvailableOrders(prev => prev.filter(o => o.id !== data.orderId));
    });

    return unsubscribe;
  }, [onOrderUpdate, dispatch]);

  // Обшавӣ ба қабули фармоиш аз ҷониби курйери дигар
  useEffect(() => {
    const unsubscribe = onOrderAccepted((data) => {
      // Нест кардани фармоиш аз рӯйхати дастрас
      setAvailableOrders(prev => prev.filter(o => o.id !== data.orderId));
      
      // Агар огоҳии фармоиши нав кушода бошад, пинҳон мекунем
      if (newOrderNotification?.order.id === data.orderId) {
        setNewOrderNotification(null);
      }
    });

    return unsubscribe;
  }, [onOrderAccepted, newOrderNotification]);

  // Обшавӣ ба бекоршавии фармоиш
  useEffect(() => {
    const unsubscribe = onOrderCancelled((data) => {
      // Нест кардани фармоиш аз рӯйхати дастрас
      setAvailableOrders(prev => prev.filter(o => o.id !== data.orderId));
      
      // Агар фармоиши ҷорӣ бошад, тоза мекунем
      if (currentOrder?.id === data.orderId) {
        dispatch(clearCurrentOrder());
      }
    });

    return unsubscribe;
  }, [onOrderCancelled, currentOrder?.id, dispatch]);

  // Обшавӣ ба навсозии даромад
  useEffect(() => {
    const unsubscribe = onEarningsUpdate((data) => {
      console.log('Earnings updated:', data);
      // Метавонед даромадро дар Redux навсозӣ кунед
    });

    return unsubscribe;
  }, [onEarningsUpdate]);

  // Қабули фармоиш
  const acceptOrder = useCallback(async (orderId: string) => {
    try {
      const order = await ordersApi.acceptOrder(orderId);
      
      // Навсозӣ дар Redux
      dispatch(addOrder(order as any));
      dispatch(setCurrentOrder(order as any));
      
      // Нест кардан аз рӯйхати дастрас
      setAvailableOrders(prev => prev.filter(o => o.id !== orderId));
      
      // Қабул тавассути сокет
      socketAcceptOrder(orderId);
      
      // Навсозии макон барои ин фармоиш
      if (coordinates) {
        socketUpdateLocation(coordinates.latitude, coordinates.longitude, orderId);
      }
      
      return { success: true, order };
    } catch (error: any) {
      console.error('Failed to accept order:', error);
      return { success: false, error: error.message };
    }
  }, [dispatch, socketAcceptOrder, coordinates, socketUpdateLocation]);

  // Рад кардани фармоиш
  const rejectOrder = useCallback(async (orderId: string, reason?: string) => {
    try {
      await ordersApi.rejectOrder(orderId, reason);
      
      // Нест кардан аз рӯйхати дастрас
      setAvailableOrders(prev => prev.filter(o => o.id !== orderId));
      
      // Рад кардан тавассути сокет
      socketRejectOrder(orderId, reason);
      
      return { success: true };
    } catch (error: any) {
      console.error('Failed to reject order:', error);
      return { success: false, error: error.message };
    }
  }, [socketRejectOrder]);

  // Навсозии статуси фармоиш
  const updateOrderStatus = useCallback(async (
    orderId: string, 
    status: string, 
    note?: string
  ) => {
    try {
      const updatedOrder = await ordersApi.updateOrderStatus(orderId, {
        orderId,
        status,
        note,
        location: coordinates ? {
          lat: coordinates.latitude,
          lng: coordinates.longitude,
        } : undefined,
      });
      
      // Навсозӣ дар Redux
      dispatch(updateOrderStatusAction({ orderId, status: status as any }));
      if (currentOrder?.id === orderId) {
        dispatch(updateCurrentOrder(updatedOrder));
      }
      
      // Навсозӣ тавассути сокет
      socketUpdateOrderStatus(orderId, status, note);
      
      // Агар расонида шуда бошад, фармоиши ҷориро тоза мекунем
      if (status === ORDER_STATUS.DELIVERED) {
        dispatch(clearCurrentOrder());
        setCurrentOrderId(null);
        // Боргирии фармоишҳои нави дастрас
        fetchAvailableOrders();
      }
      
      return { success: true, order: updatedOrder };
    } catch (error: any) {
      console.error('Failed to update order status:', error);
      return { success: false, error: error.message };
    }
  }, [dispatch, currentOrder?.id, coordinates, socketUpdateOrderStatus, setCurrentOrderId, fetchAvailableOrders]);

  // Тасдиқи гирифтани бор
  const confirmPickup = useCallback(async (orderId: string, note?: string, photo?: File) => {
    try {
      const updatedOrder = await ordersApi.confirmPickup(orderId, note, photo);
      
      dispatch(updateOrderStatusAction({ orderId, status: ORDER_STATUS.IN_TRANSIT as any }));
      if (currentOrder?.id === orderId) {
        dispatch(updateCurrentOrder(updatedOrder));
      }
      
      socketUpdateOrderStatus(orderId, ORDER_STATUS.IN_TRANSIT, note);
      
      return { success: true, order: updatedOrder };
    } catch (error: any) {
      console.error('Failed to confirm pickup:', error);
      return { success: false, error: error.message };
    }
  }, [dispatch, currentOrder?.id, socketUpdateOrderStatus]);

  // Тасдиқи расонидан
  const confirmDelivery = useCallback(async (
    orderId: string, 
    note?: string, 
    photo?: File, 
    signature?: string
  ) => {
    try {
      const updatedOrder = await ordersApi.confirmDelivery(orderId, note, photo, signature);
      
      dispatch(updateOrderStatusAction({ orderId, status: ORDER_STATUS.DELIVERED as any }));
      dispatch(clearCurrentOrder());
      setCurrentOrderId(null);
      
      socketUpdateOrderStatus(orderId, ORDER_STATUS.DELIVERED, note);
      
      // Боргирии фармоишҳои нав
      setTimeout(() => {
        fetchAvailableOrders();
      }, 2000);
      
      return { success: true, order: updatedOrder };
    } catch (error: any) {
      console.error('Failed to confirm delivery:', error);
      return { success: false, error: error.message };
    }
  }, [dispatch, socketUpdateOrderStatus, setCurrentOrderId, fetchAvailableOrders]);

  // Гузориш додани мушкилот
  const reportIssue = useCallback(async (
    orderId: string,
    issueType: string,
    description: string,
    photo?: File
  ) => {
    try {
      const result = await ordersApi.reportIssue(orderId, issueType, description, photo);
      return { success: true, ticketId: result.ticketId };
    } catch (error: any) {
      console.error('Failed to report issue:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Навсозии дастӣ
  const refresh = useCallback(() => {
    fetchAvailableOrders();
    fetchMyOrders();
    forceSyncLocation();
  }, [fetchAvailableOrders, fetchMyOrders, forceSyncLocation]);

  // Пинҳон кардани огоҳии фармоиши нав
  const dismissNewOrderNotification = useCallback(() => {
    setNewOrderNotification(null);
  }, []);

  return {
    // Ҳолат
    availableOrders,
    myOrders: orders,
    currentOrder,
    newOrderNotification,
    isLoadingAvailable,
    isSocketConnected: isConnected,
    
    // Амалҳо
    acceptOrder,
    rejectOrder,
    updateOrderStatus,
    confirmPickup,
    confirmDelivery,
    reportIssue,
    refresh,
    dismissNewOrderNotification,
    fetchAvailableOrders,
  };
};

export default useOrderUpdates;
