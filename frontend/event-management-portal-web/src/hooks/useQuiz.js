import { useState, useEffect, useRef } from 'react';
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export const useQuiz = (eventId) => {
    const [quizState, setQuizState] = useState({ type: 'WAITING', data: null });
    const [leaderboard, setLeaderboard] = useState([]);
    const [activeQuizId, setActiveQuizId] = useState(null);
    const stompClientRef = useRef(null);

    useEffect(() => {
        if (!eventId) return;

        const client = new Client({
            webSocketFactory: () => new SockJS("http://localhost:8085/ws"),
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("✅ [Quiz WS] Connected for Event:", eventId);
                client.subscribe(`/topic/quiz.${eventId}`, (message) => {
                    if (message.body) {
                        const event = JSON.parse(message.body);
                        console.log("📩 [Quiz WS] Received event:", event);

                        if (event.type === 'LEADERBOARD') {
                            setLeaderboard(event.data);
                            setQuizState({ type: 'LEADERBOARD', data: event.data });
                        } else if (event.type === 'START') {
                            setActiveQuizId(event.data); // event.data = quizId
                            setQuizState({ type: 'START', data: event.data });
                        } else if (event.type === 'END') {
                            setQuizState({ type: 'END', data: null });
                        } else {
                            setQuizState({ type: event.type, data: event.data });
                        }
                    }
                });
            }
        });

        client.activate();
        stompClientRef.current = client;

        return () => client.deactivate();
    }, [eventId]);

    return { quizState, leaderboard, activeQuizId };
};
