// Tojrason/frontend/courier/src/pages/Profile/Profile.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { selectCourier } from '../../store/slices/courierSlice';
import { useAuth } from '../../hooks/useAuth';
import { courierApi } from '../../api';
import { COURIER_STATUS, VEHICLE_TYPES } from '../../utils/constants';
import { formatDate } from '../../utils/formatDate';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Loader from '../../components/common/Loader/Loader';
import Card from '../../components/common/Card/Card';
import Badge from '../../components/common/Badge/Badge';
import Modal from '../../components/common/Modal/Modal';

// Схемаи валидатсия барои профил
const profileSchema = z.object({
  firstName: z.string().min(2, 'Ном на камтар аз 2 аломат бошад'),
  lastName: z.string().min(2, 'Насаб на камтар аз 2 аломат бошад'),
  email: z.string().email('Email нодуруст аст'),
  phoneNumber: z.string().regex(/^\+992\d{9}$/, 'Рақами телефон бояд бо +992 оғоз шуда, 12 рақам дошта бошад'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Схемаи валидатсия барои нақлиёт
const vehicleSchema = z.object({
  type: z.enum(['bicycle', 'motorcycle', 'car', 'truck', 'walking']),
  model: z.string().min(2, 'Модели нақлиёт ворид карда шавад'),
  plateNumber: z.string().min(3, 'Рақами давлатӣ ворид карда шавад'),
  color: z.string().optional(),
  year: z.number().min(1990).max(2024).optional(),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { logout, updateProfile } = useAuth();
  const courier = useSelector(selectCourier);

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentsStatus, setDocumentsStatus] = useState<any>(null);
  const [vehicle, setVehicle] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  // Формаи профил
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: courier?.firstName || '',
      lastName: courier?.lastName || '',
      email: courier?.email || '',
      phoneNumber: courier?.phoneNumber || '+992',
    },
  });

  // Формаи нақлиёт
  const {
    register: registerVehicle,
    handleSubmit: handleVehicleSubmit,
    formState: { errors: vehicleErrors },
    reset: resetVehicle,
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      type: 'car',
      model: '',
      plateNumber: '',
      color: '',
    },
  });

  // Боргирии маълумоти иловагӣ
  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        const [docsStatus, vehicleData, statsData] = await Promise.all([
          courierApi.getDocumentsStatus().catch(() => null),
          courierApi.getVehicle().catch(() => null),
          courierApi.getStats().catch(() => null),
        ]);
        
        setDocumentsStatus(docsStatus);
        setVehicle(vehicleData);
        setStats(statsData);
        
        if (vehicleData) {
          resetVehicle(vehicleData);
        }
      } catch (error) {
        console.error('Failed to fetch additional data:', error);
      }
    };
    
    fetchAdditionalData();
  }, [resetVehicle]);

  // Навсозии профил
  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const result = await updateProfile(data);
    
    if (result.success) {
      setSuccessMessage('Профил бо муваффақият навсозӣ шуд');
      setIsEditing(false);
    } else {
      setError(result.error || 'Хатогӣ ҳангоми навсозии профил');
    }
    
    setIsLoading(false);
  };

  // Навсозии нақлиёт
  const onVehicleSubmit = async (data: VehicleFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updatedVehicle = await courierApi.updateVehicle(data as any);
      setVehicle(updatedVehicle);
      setSuccessMessage('Маълумоти нақлиёт навсозӣ шуд');
      setIsEditingVehicle(false);
    } catch (err: any) {
      setError(err.message || 'Хатогӣ ҳангоми навсозии нақлиёт');
    } finally {
      setIsLoading(false);
    }
  };

  // Боргузории ҳуҷҷат
  const handleUploadDocument = async (type: string, file: File) => {
    setIsLoading(true);
    try {
      await courierApi.uploadDocument(type as any, file);
      setSuccessMessage('Ҳуҷҷат бо муваффақият боргузорӣ шуд');
      
      // Навсозии статуси ҳуҷҷатҳо
      const docsStatus = await courierApi.getDocumentsStatus();
      setDocumentsStatus(docsStatus);
    } catch (err: any) {
      setError(err.message || 'Хатогӣ ҳангоми боргузории ҳуҷҷат');
    } finally {
      setIsLoading(false);
    }
  };

  // Баромад
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!courier) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="pb-4">
      {/* Сарлавҳа */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Профил</h1>
        <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Button>
      </div>

      {/* Намоиши паёмҳо */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Аватар ва маълумоти асосӣ */}
      <Card className="p-4 mb-4">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mr-4">
            <span className="text-2xl font-semibold text-emerald-600">
              {courier.firstName.charAt(0)}{courier.lastName.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">
              {courier.firstName} {courier.lastName}
            </h2>
            <p className="text-sm text-gray-600">{courier.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={courier.status === COURIER_STATUS.ONLINE ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {courier.status === COURIER_STATUS.ONLINE ? 'Онлайн' : 
                 courier.status === COURIER_STATUS.ON_DELIVERY ? 'Дар расонидан' : 'Офлайн'}
              </Badge>
              {stats && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  ★ {stats.total?.rating?.toFixed(1) || '0.0'}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Омори зуд */}
      {stats && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Card className="p-3 text-center">
            <p className="text-xl font-bold text-emerald-600">{stats.total?.deliveries || 0}</p>
            <p className="text-xs text-gray-500">Фармоишҳо</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-xl font-bold text-blue-600">{stats.month?.deliveries || 0}</p>
            <p className="text-xs text-gray-500">Ин моҳ</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-xl font-bold text-purple-600">{stats.today?.deliveries || 0}</p>
            <p className="text-xs text-gray-500">Имрӯз</p>
          </Card>
        </div>
      )}

      {/* Маълумоти шахсӣ */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Маълумоти шахсӣ</h3>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Таҳрир
            </Button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-3">
            <Input
              label="Ном"
              error={profileErrors.firstName?.message}
              {...registerProfile('firstName')}
            />
            <Input
              label="Насаб"
              error={profileErrors.lastName?.message}
              {...registerProfile('lastName')}
            />
            <Input
              label="Email"
              type="email"
              error={profileErrors.email?.message}
              {...registerProfile('email')}
            />
            <Input
              label="Рақами телефон"
              error={profileErrors.phoneNumber?.message}
              {...registerProfile('phoneNumber')}
            />
            <div className="flex gap-2">
              <Button type="submit" variant="primary" size="sm" disabled={isLoading}>
                {isLoading ? <Loader size="sm" color="white" /> : 'Захира'}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Бекор
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500">Ном ва насаб</p>
              <p className="text-gray-900">{courier.firstName} {courier.lastName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-gray-900">{courier.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Рақами телефон</p>
              <p className="text-gray-900">{courier.phoneNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Санаи бақайдгирӣ</p>
              <p className="text-gray-900">{formatDate(courier.joinedAt || courier.createdAt)}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Нақлиёт */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Нақлиёт</h3>
          {!isEditingVehicle && (
            <Button variant="outline" size="sm" onClick={() => setIsEditingVehicle(true)}>
              {vehicle ? 'Таҳрир' : 'Илова кардан'}
            </Button>
          )}
        </div>

        {isEditingVehicle ? (
          <form onSubmit={handleVehicleSubmit(onVehicleSubmit)} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Намуди нақлиёт</label>
              <select
                {...registerVehicle('type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
              >
                {Object.entries(VEHICLE_TYPES).map(([key, value]) => (
                  <option key={key} value={value}>
                    {value === 'bicycle' && 'Велосипед'}
                    {value === 'motorcycle' && 'Мотосикл'}
                    {value === 'car' && 'Мошин'}
                    {value === 'truck' && 'Мошини боркаш'}
                    {value === 'walking' && 'Пиёда'}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Модел"
              placeholder="Масалан: Toyota Camry"
              error={vehicleErrors.model?.message}
              {...registerVehicle('model')}
            />
            <Input
              label="Рақами давлатӣ"
              placeholder="Масалан: 0000AA00"
              error={vehicleErrors.plateNumber?.message}
              {...registerVehicle('plateNumber')}
            />
            <Input
              label="Ранг (ихтиёрӣ)"
              placeholder="Масалан: Сафед"
              error={vehicleErrors.color?.message}
              {...registerVehicle('color')}
            />
            <div className="flex gap-2">
              <Button type="submit" variant="primary" size="sm" disabled={isLoading}>
                {isLoading ? <Loader size="sm" color="white" /> : 'Захира'}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditingVehicle(false)}>
                Бекор
              </Button>
            </div>
          </form>
        ) : vehicle ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {vehicle.type === 'bicycle' && '🚲'}
                {vehicle.type === 'motorcycle' && '🏍️'}
                {vehicle.type === 'car' && '🚗'}
                {vehicle.type === 'truck' && '🚚'}
                {vehicle.type === 'walking' && '🚶'}
              </span>
              <div>
                <p className="font-medium text-gray-900">{vehicle.model}</p>
                <p className="text-sm text-gray-600">{vehicle.plateNumber}</p>
                {vehicle.color && <p className="text-sm text-gray-500">{vehicle.color}</p>}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Маълумоти нақлиёт ворид нашудааст</p>
        )}
      </Card>

      {/* Ҳуҷҷатҳо */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Ҳуҷҷатҳо</h3>
          <Button variant="outline" size="sm" onClick={() => setShowDocumentModal(true)}>
            Илова кардан
          </Button>
        </div>

        <div className="space-y-2">
          {documentsStatus ? (
            <>
              <DocumentStatusItem 
                label="Шаҳодатномаи шахсӣ" 
                status={documentsStatus.idCard} 
              />
              <DocumentStatusItem 
                label="Шаҳодатномаи ронандагӣ" 
                status={documentsStatus.driverLicense} 
              />
              <DocumentStatusItem 
                label="Ҳуҷҷатҳои нақлиёт" 
                status={documentsStatus.vehicleRegistration} 
              />
              <DocumentStatusItem 
                label="Суғурта" 
                status={documentsStatus.insurance} 
              />
            </>
          ) : (
            <p className="text-gray-500 text-sm">Ҳанӯз ҳуҷҷат боргузорӣ нашудааст</p>
          )}
        </div>
      </Card>

      {/* Амалҳо */}
      <div className="space-y-2">
        <Button variant="outline" fullWidth onClick={() => navigate('/change-password')}>
          🔒 Тағйири парол
        </Button>
        <Button variant="outline" fullWidth onClick={() => navigate('/work-schedule')}>
          📅 Ҷадвали корӣ
        </Button>
        <Button variant="outline" fullWidth onClick={() => navigate('/settings')}>
          ⚙️ Танзимот
        </Button>
        <Button variant="outline" fullWidth onClick={() => setShowLogoutModal(true)} className="text-red-600 border-red-200 hover:bg-red-50">
          🚪 Баромад
        </Button>
      </div>

      {/* Модали боргузории ҳуҷҷат */}
      <Modal
        isOpen={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
        title="Боргузории ҳуҷҷат"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Намуди ҳуҷҷатро интихоб кунед:</p>
          <select 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            onChange={(e) => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*,.pdf';
              input.onchange = (event) => {
                const file = (event.target as HTMLInputElement).files?.[0];
                if (file) {
                  handleUploadDocument(e.target.value, file);
                  setShowDocumentModal(false);
                }
              };
              input.click();
            }}
          >
            <option value="">Интихоб кунед...</option>
            <option value="idCard">Шаҳодатномаи шахсӣ</option>
            <option value="driverLicense">Шаҳодатномаи ронандагӣ</option>
            <option value="vehicleRegistration">Ҳуҷҷатҳои нақлиёт</option>
            <option value="insurance">Суғурта</option>
          </select>
        </div>
      </Modal>

      {/* Модали тасдиқи баромад */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Баромад аз система"
      >
        <p className="text-gray-600 mb-6">
          Оё шумо мутмаин ҳастед, ки мехоҳед аз система бароед?
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setShowLogoutModal(false)}>
            Бекор
          </Button>
          <Button variant="primary" onClick={handleLogout}>
            Бароед
          </Button>
        </div>
      </Modal>
    </div>
  );
};

// Компоненти намоиши статуси ҳуҷҷат
const DocumentStatusItem: React.FC<{ label: string; status: boolean }> = ({ label, status }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-gray-700">{label}</span>
    {status ? (
      <Badge className="bg-green-100 text-green-800">✅ Тасдиқ шуд</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">⏳ Дар интизорӣ</Badge>
    )}
  </div>
);

export default Profile;
