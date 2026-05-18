import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.fitiuh-events.io.vn';
// SockJS requires http/https, not ws/wss
const SOCKJS_URL = WS_BASE_URL.replace(/^ws/, 'http') + '/ws/chat';

export const createStompClient = (onConnect, onDisconnect) => {
  const wsBrokerUrl = WS_BASE_URL.replace(/^http/, 'ws') + '/ws/chat';
  const client = new Client({
    brokerURL: wsBrokerUrl,
    webSocketFactory: typeof WebSocket !== 'undefined' ? null : () => new SockJS(SOCKJS_URL),
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

