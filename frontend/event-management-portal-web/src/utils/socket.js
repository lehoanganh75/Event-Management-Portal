import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') + '/ws/chat';

export const createStompClient = (onConnect, onDisconnect) => {
  const client = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    debug: (str) => {
      // console.log('STOMP: ' + str);
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  client.onConnect = (frame) => {
    // console.log('Connected to STOMP');
    if (onConnect) onConnect(frame);
  };

  client.onStompError = (frame) => {
    console.error('STOMP Error', frame);
  };

  client.onDisconnect = () => {
    // console.log('Disconnected from STOMP');
    if (onDisconnect) onDisconnect();
  };

  return client;
};
