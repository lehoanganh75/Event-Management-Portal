import { useState, useEffect, useRef } from 'react';
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export const useQuiz = (eventId) => {
    const [quizState, setQuizState] = useState({ type: 'WAITING', data: null });
    const [leaderboard, setLeaderboard] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [activeQuizId, setActiveQuizId] = useState(null);
    const [joinedQuizzes, setJoinedQuizzes] = useState({});
    const [lastQuestionIndex, setLastQuestionIndex] = useState(0);
    const [lastQuestionId, setLastQuestionId] = useState(null);
    const stompClientRef = useRef(null);

    useEffect(() => {
        if (!eventId) return;

        const wsBaseUrl = import.meta.env.VITE_API_BASE_URL || "https://fitiuh-events.io.vn";
        const token = localStorage.getItem('accessToken');
        const wsUrl = token ? `${wsBaseUrl}/ws?token=${token}` : `${wsBaseUrl}/ws`;

        const wsBrokerUrl = wsUrl.replace(/^http/, "ws");

        const client = new Client({
            brokerURL: wsBrokerUrl,
            webSocketFactory: typeof WebSocket !== "undefined" ? null : () => new SockJS(wsUrl),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("✅ [Quiz WS] Connected for Event:", eventId);
                client.subscribe(`/topic/quiz.${eventId}`, (message) => {
                    if (message.body) {
                        const event = JSON.parse(message.body);
                        console.log("📩 [Quiz WS] Event Type:", event.type);
                        console.log("📩 [Quiz WS] Event Data:", event.data);

                        if (event.type === 'LEADERBOARD') {
                            setLeaderboard(event.data);
                            setQuizState({ type: 'LEADERBOARD', data: event.data });
                        } else if (event.type === 'START') {
                            setActiveQuizId(event.data);
                            setQuizState({ type: 'START', data: event.data });
                            setLastQuestionIndex(0);
                            setLastQuestionId(null);
                        } else if (event.type === 'LOBBY_UPDATE') {
                            setParticipants(event.data || []);
                        } else if (event.type === 'END') {
                            setQuizState({ type: 'END', data: null });
                            setLastQuestionIndex(0);
                            setLastQuestionId(null);
                        } else if (event.type === 'FORCE_CLOSE') {
                            setQuizState({ type: 'FORCE_CLOSE', data: event.data });
                            setLastQuestionIndex(0);
                            setLastQuestionId(null);
                        } else if (event.type === 'NEXT_QUESTION') {
                            if (event.data && typeof event.data.orderIndex === 'number') {
                                setLastQuestionIndex(event.data.orderIndex);
                            }
                            if (event.data && event.data.id) {
                                setLastQuestionId(event.data.id);
                            }
                            setQuizState({ type: event.type, data: event.data });
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

    const joinQuiz = (quizId, nickname, avatar, userId) => {
        if (stompClientRef.current && stompClientRef.current.connected) {
            stompClientRef.current.publish({
                destination: `/app/quiz.join/${quizId}`,
                body: JSON.stringify({ nickname, avatar, userId })
            });
            const effectiveId = userId || nickname;
            setJoinedQuizzes(prev => ({
                ...prev,
                [quizId]: { nickname, avatar, participantId: effectiveId }
            }));
            return true;
        }
        return false;
    };

    const leaveQuiz = (quizId, userId) => {
        if (stompClientRef.current && stompClientRef.current.connected) {
            stompClientRef.current.publish({
                destination: `/app/quiz.leave/${quizId}`,
                body: JSON.stringify({ userId })
            });
            setJoinedQuizzes(prev => {
                const copy = { ...prev };
                delete copy[quizId];
                return copy;
            });
            return true;
        }
        return false;
    };

    const closeQuiz = (quizId) => {
        if (stompClientRef.current && stompClientRef.current.connected) {
            stompClientRef.current.publish({
                destination: `/app/quiz.close/${quizId}`
            });
            return true;
        }
        return false;
    };

    return { 
        quizState, 
        leaderboard, 
        participants, 
        activeQuizId, 
        joinQuiz, 
        leaveQuiz, 
        closeQuiz, 
        joinedQuizzes, 
        setJoinedQuizzes,
        lastQuestionIndex,
        setLastQuestionIndex,
        lastQuestionId,
        setLastQuestionId
    };
};

