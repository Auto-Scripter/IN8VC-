import React, { useState, useEffect, useRef, useCallback } from 'react';

// Helper component for SVG Icons
const Icon = ({ path, className = 'h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

// --- Components ---

// 1. Lobby Component: Meeting join karne se pehle ka screen
const Lobby = ({ onJoinMeeting }) => {
    const [roomName, setRoomName] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [jwt, setJwt] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (roomName && displayName) {
            // Pass JWT to the join function
            onJoinMeeting(roomName, displayName, jwt);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
                <h1 className="text-3xl font-bold mb-2">Meeting Setup</h1>
                <p className="text-gray-400 mb-6">Apni details enter karke meeting join karein.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="displayName" className="block text-left text-sm font-medium text-gray-300 mb-1">Aapka Naam</label>
                        <input
                            type="text"
                            id="displayName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Jaise, 'Rahul'"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="roomName" className="block text-left text-sm font-medium text-gray-300 mb-1">Room Ka Naam</label>
                        <input
                            type="text"
                            id="roomName"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            placeholder="Jaise, 'team-discussion'"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="jwt" className="block text-left text-sm font-medium text-gray-300 mb-1">Moderator Token (JWT - Optional)</label>
                        <input
                            type="text"
                            id="jwt"
                            value={jwt}
                            onChange={(e) => setJwt(e.target.value)}
                            placeholder="Agar aap moderator hain to token enter karein"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                         <p className="text-xs text-gray-500 mt-1 text-left">Yeh field secure Jitsi setups ke liye hai jahan moderator ki zaroorat hoti hai.</p>
                    </div>
                    <button type="submit" className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg">
                        Meeting Join Karein
                    </button>
                </form>
            </div>
        </div>
    );
};

// 2. Toolbar Component: Niche ke control buttons
const Toolbar = ({ api, onToggleChat, onToggleParticipants, onHangup, isMicMuted, isCamMuted, isSharingScreen }) => {
    return (
        <div className="bg-gray-900 bg-opacity-50 backdrop-blur-md p-4 flex justify-center items-center space-x-3 md:space-x-4">
            {/* Mic Button */}
            <button onClick={() => api.executeCommand('toggleAudio')} title="Mute/Unmute Mic" className={`control-btn p-3 rounded-full ${isMicMuted ? 'bg-red-600' : 'bg-gray-800'}`}>
                {isMicMuted ? <Icon path="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z M5 5l14 14" /> : <Icon path="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />}
            </button>
            {/* Camera Button */}
            <button onClick={() => api.executeCommand('toggleVideo')} title="Start/Stop Camera" className={`control-btn p-3 rounded-full ${isCamMuted ? 'bg-red-600' : 'bg-gray-800'}`}>
                 {isCamMuted ? <Icon path="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z M1 1l22 22" /> : <Icon path="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />}
            </button>
            {/* Screen Share Button */}
            <button onClick={() => api.executeCommand('toggleShareScreen')} title="Share Screen" className={`control-btn p-3 rounded-full ${isSharingScreen ? 'bg-indigo-600' : 'bg-gray-800'}`}>
                <Icon path="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </button>
            {/* Chat Button */}
            <button onClick={onToggleChat} title="Toggle Chat" className="control-btn bg-gray-800 p-3 rounded-full">
                <Icon path="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </button>
            {/* Participants Button */}
            <button onClick={onToggleParticipants} title="Toggle Participants" className="control-btn bg-gray-800 p-3 rounded-full">
                <Icon path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </button>
            {/* Hangup Button */}
            <button onClick={onHangup} title="Leave Meeting" className="control-btn bg-red-600 hover:bg-red-700 text-white p-3 rounded-full">
                <Icon path="M16 8l2-2m0 0l2 2m-2-2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h8" />
            </button>
        </div>
    );
};

// 3. Sidebar Component: Chat aur Participants ke liye
const Sidebar = ({ api, isOpen, onClose, type, participants, chatMessages }) => {
    const [chatInput, setChatInput] = useState('');

    const handleSendMessage = () => {
        if (chatInput.trim() && api) {
            api.executeCommand('sendChatMessage', chatInput);
            setChatInput('');
        }
    };

    const title = type === 'chat' ? 'Chat' : 'Participants';

    return (
        <div className={`absolute top-0 right-0 h-full w-full max-w-sm bg-gray-900 bg-opacity-90 backdrop-blur-sm shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-4 flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700">
                        <Icon path="M6 18L18 6M6 6l12 12" />
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {type === 'participants' && (
                        <ul className="space-y-3">
                            {participants.map(p => (
                                <li key={p.id} className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm">{p.name.charAt(0).toUpperCase()}</div>
                                    <span>{p.name} {p.isLocal ? '(Aap)' : ''}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    {type === 'chat' && (
                         <ul className="space-y-4">
                            {chatMessages.map((msg, index) => (
                                <li key={index} className={`flex flex-col ${msg.isLocal ? 'items-end' : 'items-start'}`}>
                                    <div className={`rounded-lg px-3 py-2 max-w-xs ${msg.isLocal ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                                        {!msg.isLocal && <div className="text-xs text-gray-400 font-bold mb-1">{msg.senderName}</div>}
                                        <p className="text-sm">{msg.message}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {type === 'chat' && (
                    <div className="mt-4">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                            placeholder="Message likhein..."
                        />
                        <button onClick={handleSendMessage} className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
                            Send
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};


// 4. MeetingRoom Component: Main meeting screen
const MeetingRoom = ({ roomName, displayName, jwt, onLeave }) => {
    const jitsiContainerRef = useRef(null);
    const [api, setApi] = useState(null);
    
    // UI states
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isCamMuted, setIsCamMuted] = useState(false);
    const [isSharingScreen, setIsSharingScreen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [sidebarType, setSidebarType] = useState('participants'); // 'chat' or 'participants'
    
    // Data states
    const [participants, setParticipants] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);

    const handleHangup = useCallback(() => {
        if (api) {
            api.dispose();
        }
        onLeave();
    }, [api, onLeave]);

    // Jitsi IFrame ko initialize karna
    useEffect(() => {
        if (!jitsiContainerRef.current || !window.JitsiMeetExternalAPI) return;

        const domain = 'meet.jit.si';
        const options = {
            roomName: roomName,
            width: '100%',
            height: '100%',
            parentNode: jitsiContainerRef.current,
            configOverwrite: {
                startWithAudioMuted: false,
                startWithVideoMuted: false,
                prejoinPageEnabled: false,
            },
            interfaceConfigOverwrite: {
                // Jitsi ke default UI elements ko hide karna
                TOOLBAR_BUTTONS: [],
                SETTINGS_SECTIONS: [],
                SHOW_CHROME_EXTENSION_BANNER: false,
                DISABLE_VIDEO_BACKGROUND: true,
            },
            userInfo: {
                displayName: displayName
            }
        };

        // Agar JWT hai to use options mein add karein
        if (jwt) {
            options.jwt = jwt;
        }

        const jitsiApi = new window.JitsiMeetExternalAPI(domain, options);
        setApi(jitsiApi);

        // Event listeners ko setup karna
        jitsiApi.addEventListener('videoConferenceJoined', () => {
            console.log('Local user joined');
            jitsiApi.executeCommand('displayName', displayName);
            
            const localId = jitsiApi.myUserId();
            const initialParticipants = jitsiApi.getParticipantsInfo().map(p => ({
                id: p.participantId,
                name: p.displayName,
                isLocal: p.participantId === localId,
            }));
             // Ensure local user is in the list
            if (!initialParticipants.some(p => p.id === localId)) {
                initialParticipants.push({ id: localId, name: displayName, isLocal: true });
            }
            setParticipants(initialParticipants);
        });

        jitsiApi.addEventListener('participantJoined', (participant) => {
            console.log('Participant joined', participant);
            setParticipants(prev => [...prev, { id: participant.id, name: participant.displayName, isLocal: false }]);
        });

        jitsiApi.addEventListener('participantLeft', (participant) => {
            console.log('Participant left', participant);
            setParticipants(prev => prev.filter(p => p.id !== participant.id));
        });

        jitsiApi.addEventListener('audioMuteStatusChanged', (event) => setIsMicMuted(event.muted));
        jitsiApi.addEventListener('videoMuteStatusChanged', (event) => setIsCamMuted(event.muted));
        jitsiApi.addEventListener('screenSharingStatusChanged', (event) => setIsSharingScreen(event.on));

        jitsiApi.addEventListener('incomingMessage', (message) => {
             setChatMessages(prev => [...prev, {
                senderId: message.from,
                senderName: jitsiApi.getParticipantsInfo().find(p => p.participantId === message.from)?.displayName || 'Unknown',
                message: message.message,
                isLocal: false
            }]);
        });
        
        jitsiApi.addEventListener('outgoingMessage', (message) => {
            setChatMessages(prev => [...prev, {
                senderId: jitsiApi.myUserId(),
                senderName: displayName,
                message: message.message,
                isLocal: true
            }]);
        });
        
        // Cleanup function
        return () => {
            console.log('Disposing Jitsi API');
            jitsiApi?.dispose();
        };
    }, [roomName, displayName, jwt]); // jwt ko dependency array mein add karein

    const toggleSidebar = (type) => {
        if (isSidebarOpen && sidebarType === type) {
            setIsSidebarOpen(false);
        } else {
            setSidebarType(type);
            setIsSidebarOpen(true);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-black">
            <div className="flex-grow relative">
                <div ref={jitsiContainerRef} className="w-full h-full" />
                <Sidebar 
                    api={api}
                    isOpen={isSidebarOpen} 
                    onClose={() => setIsSidebarOpen(false)} 
                    type={sidebarType}
                    participants={participants}
                    chatMessages={chatMessages}
                />
            </div>
            {api && (
                <Toolbar
                    api={api}
                    onHangup={handleHangup}
                    onToggleChat={() => toggleSidebar('chat')}
                    onToggleParticipants={() => toggleSidebar('participants')}
                    isMicMuted={isMicMuted}
                    isCamMuted={isCamMuted}
                    isSharingScreen={isSharingScreen}
                />
            )}
        </div>
    );
};

// 5. Main App Component
export default function App() {
    const [meetingDetails, setMeetingDetails] = useState(null);

    // Ye function Jitsi script ko dynamically load karega
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleJoinMeeting = (roomName, displayName, jwt) => {
        setMeetingDetails({ roomName, displayName, jwt });
    };

    const handleLeaveMeeting = () => {
        setMeetingDetails(null);
    };

    return (
        <div className="App">
            {meetingDetails ? (
                <MeetingRoom
                    roomName={meetingDetails.roomName}
                    displayName={meetingDetails.displayName}
                    jwt={meetingDetails.jwt}
                    onLeave={handleLeaveMeeting}
                />
            ) : (
                <Lobby onJoinMeeting={handleJoinMeeting} />
            )}
        </div>
    );
}
