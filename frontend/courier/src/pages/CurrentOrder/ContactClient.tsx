// Tojrason/frontend/courier/src/pages/CurrentOrder/ContactClient.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../hooks/useSocket';
import Button from '../../components/common/Button/Button';
import Card from '../../components/common/Card/Card';
import Modal from '../../components/common/Modal/Modal';
import Input from '../../components/common/Input/Input';
import Loader from '../../components/common/Loader/Loader';

interface ClientInfo {
  id: string;
  name: string;
  phoneNumber: string;
  photo?: string;
  rating?: number;
}

interface ContactClientProps {
  client: ClientInfo;
  orderId: string;
  onCall?: () => void;
  onMessage?: () => void;
  variant?: 'full' | 'compact';
}

const ContactClient: React.FC<ContactClientProps> = ({
  client,
  orderId,
  onCall,
  onMessage,
  variant = 'full',
}) => {
  const navigate = useNavigate();
  const { sendChatMessage } = useSocket();
  
  const [showCallModal, setShowCallModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [quickMessage, setQuickMessage] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Паёмҳои тайёр
  const QUICK_MESSAGES = [
    { id: 'arrived', text: 'Ман ба суроға расидам', icon: '📍' },
    { id: 'waiting', text: 'Ман дар назди даромадгоҳ ҳастам', icon: '🚪' },
    { id: 'call', text: 'Лутфан ба ман занг занед', icon: '📞' },
    { id: 'delay', text: 'Ман каме дертар мерасам', icon: '⏰' },
    { id: 'ready', text: 'Фармоиши шумо омода аст', icon: '📦' },
    { id: 'help', text: 'Ба ман дар ёфтани суроға кумак кунед', icon: '🗺️' },
  ];

  // Тамос тавассути занг
  const handleCall = useCallback(() => {
    if (onCall) {
      onCall();
    } else if (client.phoneNumber) {
      window.location.href = `tel:${client.phoneNumber}`;
    }
    setShowCallModal(false);
  }, [client.phoneNumber, onCall]);

  // Кушодани чат
  const handleOpenChat = useCallback(() => {
    if (onMessage) {
      onMessage();
    } else {
      navigate(`/chat/${orderId}`);
    }
  }, [orderId, navigate, onMessage]);

  // Ирсоли паёми зуд
  const handleSendQuickMessage = useCallback(async (message: string) => {
    if (!message) return;
    
    setIsSending(true);
    const success = sendChatMessage(orderId, message);
    
    if (success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
    
    setIsSending(false);
    setShowMessageModal(false);
    setQuickMessage('');
  }, [orderId, sendChatMessage]);

  // Ирсоли паёми фармоишӣ
  const handleSendCustomMessage = useCallback(async () => {
    if (!customMessage.trim()) return;
    
    setIsSending(true);
    const success = sendChatMessage(orderId, customMessage);
    
    if (success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      setCustomMessage('');
    }
    
    setIsSending(false);
    setShowMessageModal(false);
  }, [orderId, customMessage, sendChatMessage]);

  // Компоненти паймон (compact)
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowCallModal(true)}
          className="flex-1 py-3 px-4 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-xl">📞</span>
          <span className="font-medium">Занг</span>
        </button>
        <button
          onClick={() => setShowMessageModal(true)}
          className="flex-1 py-3 px-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-xl">💬</span>
          <span className="font-medium">Паём</span>
        </button>

        {/* Модали занг */}
        <Modal
          isOpen={showCallModal}
          onClose={() => setShowCallModal(false)}
          title="Тамос бо муштарӣ"
        >
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">
                {client.photo ? (
                  <img src={client.photo} alt={client.name} className="w-full h-full rounded-full" />
                ) : (
                  client.name.charAt(0)
                )}
              </span>
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-1">{client.name}</p>
            <p className="text-gray-600 mb-4">{client.phoneNumber}</p>
            <Button variant="primary" size="lg" fullWidth onClick={handleCall}>
              📞 Занг задан
            </Button>
          </div>
        </Modal>

        {/* Модали паёми зуд */}
        <Modal
          isOpen={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          title="Паём ба муштарӣ"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {QUICK_MESSAGES.slice(0, 4).map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => handleSendQuickMessage(msg.text)}
                  disabled={isSending}
                  className="p-3 bg-gray-50 rounded-lg text-sm text-left hover:bg-gray-100 transition-colors"
                >
                  <span className="mr-2">{msg.icon}</span>
                  {msg.text}
                </button>
              ))}
            </div>
            
            <div className="relative">
              <Input
                placeholder="Паёми фармоишӣ..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
              />
              <button
                onClick={handleSendCustomMessage}
                disabled={!customMessage.trim() || isSending}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-emerald-600 disabled:text-gray-300"
              >
                {isSending ? <Loader size="sm" /> : '📤'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // Компоненти пурра (full)
  return (
    <Card className="p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Муштарӣ</h3>
      
      {/* Маълумоти муштарӣ */}
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
          {client.photo ? (
            <img src={client.photo} alt={client.name} className="w-full h-full rounded-full" />
          ) : (
            <span className="text-xl font-semibold text-emerald-600">
              {client.name.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900">{client.name}</p>
          <p className="text-sm text-gray-600">{client.phoneNumber}</p>
          {client.rating && (
            <div className="flex items-center mt-0.5">
              <span className="text-yellow-500 text-sm mr-1">★</span>
              <span className="text-xs text-gray-500">{client.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Тугмаҳои амал */}
      <div className="space-y-2">
        <Button
          variant="primary"
          fullWidth
          onClick={() => setShowCallModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <span className="mr-2">📞</span>
          Занг задан
        </Button>
        
        <Button
          variant="outline"
          fullWidth
          onClick={handleOpenChat}
        >
          <span className="mr-2">💬</span>
          Кушодани чат
        </Button>
        
        <Button
          variant="outline"
          fullWidth
          onClick={() => setShowMessageModal(true)}
        >
          <span className="mr-2">⚡</span>
          Паёми зуд
        </Button>
      </div>

      {/* Огоҳии муваффақият */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 p-2 bg-green-50 text-green-700 text-sm rounded-lg text-center"
          >
            ✅ Паём фиристода шуд
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модали тасдиқи занг */}
      <Modal
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
        title="Тамос бо муштарӣ"
      >
        <div className="text-center py-4">
          <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">
              {client.photo ? (
                <img src={client.photo} alt={client.name} className="w-full h-full rounded-full" />
              ) : (
                client.name.charAt(0)
              )}
            </span>
          </div>
          <p className="text-xl font-semibold text-gray-900 mb-1">{client.name}</p>
          <p className="text-gray-600 mb-6">{client.phoneNumber}</p>
          
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setShowCallModal(false)}>
              Бекор
            </Button>
            <Button variant="primary" fullWidth onClick={handleCall}>
              📞 Занг
            </Button>
          </div>
        </div>
      </Modal>

      {/* Модали паёми зуд */}
      <Modal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        title="Паёми зуд"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Паёми тайёрро интихоб кунед:</p>
          
          <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
            {QUICK_MESSAGES.map((msg) => (
              <button
                key={msg.id}
                onClick={() => handleSendQuickMessage(msg.text)}
                disabled={isSending}
                className="p-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors flex items-center"
              >
                <span className="text-xl mr-3">{msg.icon}</span>
                <span className="flex-1">{msg.text}</span>
              </button>
            ))}
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-2">Ё паёми фармоишӣ нависед:</p>
            <div className="flex gap-2">
              <Input
                placeholder="Паёми шумо..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="primary"
                onClick={handleSendCustomMessage}
                disabled={!customMessage.trim() || isSending}
              >
                {isSending ? <Loader size="sm" color="white" /> : '📤'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default ContactClient;
