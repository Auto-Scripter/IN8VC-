import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageSquare, Share2, PanelLeftClose, Radio, Copy, Check, Mail, Award, MicOff, UserX } from 'lucide-react';

// --- Helper Components (No changes needed here) ---
const SidebarButton = ({ icon: Icon, label, onClick, isActive }) => (
    <button 
        onClick={onClick}
        className={`relative w-full flex items-center gap-4 p-3 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive ? 'bg-slate-700/60' : 'hover:bg-slate-800/50'}`}
    >
        <span className={`absolute left-0 top-1/2 -translate-y-1/2 h-0 w-1 bg-cyan-400 rounded-r-full transition-all duration-300 ease-in-out ${isActive ? 'h-full' : 'group-hover:h-3/5'}`}></span>
        <Icon 
            size={18} 
            className={`ml-2 transition-colors duration-200 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} 
        />
        <span className={`transition-colors duration-200 ${isActive ? 'text-white font-semibold' : 'text-slate-300 group-hover:text-white'}`}>
            {label}
        </span>
    </button>
);

const ParticipantsPanel = ({ participants, isHost, onMute, onKick }) => {
    const avatarColors = [
        'from-cyan-500 to-blue-600', 'from-emerald-500 to-green-600',
        'from-purple-500 to-indigo-600', 'from-amber-500 to-orange-600',
        'from-pink-500 to-rose-600',
    ];
    
    const getAvatarColor = (name = '') => {
        const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return avatarColors[charCodeSum % avatarColors.length];
    };

    return (
        <motion.div
            key="participants-panel"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="p-1"
        >
            <h3 className="text-white font-semibold text-sm px-2 mb-2">
                In Meeting ({participants.length})
            </h3>
            <div className="space-y-1 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50 scrollbar-thumb-rounded-full">
                {participants.map(p => (
                    <div key={p.participantId} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 transition-colors">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(p.formattedDisplayName)} flex-shrink-0 flex items-center justify-center font-bold text-white text-xs`}>
                            {p.formattedDisplayName?.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-slate-200 text-sm truncate flex-grow">{p.formattedDisplayName}</span>
                        
                        {p.isLocal && isHost && <Award size={16} title="You are the host" className="text-amber-400 flex-shrink-0 ml-auto" />}

                        {isHost && !p.isLocal && (
                            <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button onClick={() => onMute(p.participantId)} title="Mute Participant" className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-600 rounded-full">
                                    <MicOff size={14} />
                                </button>
                                <button onClick={() => onKick(p.participantId)} title="Remove Participant" className="p-1.5 text-red-500 hover:text-white hover:bg-red-500 rounded-full">
                                    <UserX size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

const SharePanel = ({ meetingLink, meetingCode, handleCopy, copiedItem }) => (
    <motion.div 
        key="share-panel"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 20, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="p-3 space-y-4"
    >
        <h3 className="text-white font-semibold">Share Invite</h3>
        <div>
            <label className="text-xs text-slate-400 font-medium">Meeting Link</label>
            <div className="flex items-center bg-slate-900/50 border border-slate-700 rounded-lg p-1 mt-1">
                <p className="flex-grow bg-transparent text-slate-300 text-sm outline-none px-2 truncate">{meetingLink}</p>
                <button 
                    onClick={() => handleCopy(meetingLink, 'link')} 
                    className={`flex items-center justify-center gap-2 w-28 px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${copiedItem === 'link' ? 'bg-emerald-500' : 'bg-cyan-600 hover:bg-cyan-500'}`}
                >{copiedItem === 'link' ? <><Check size={16}/> Copied</> : <><Copy size={16}/> Copy</>}</button>
            </div>
        </div>
        <div>
            <label className="text-xs text-slate-400 font-medium">Meeting Code</label>
            <div className="flex items-center bg-slate-900/50 border border-slate-700 rounded-lg p-1 mt-1">
                <p className="flex-grow bg-transparent text-slate-300 text-sm font-bold tracking-wider outline-none px-2 truncate">{meetingCode}</p>
                <button 
                    onClick={() => handleCopy(meetingCode, 'code')}
                    className={`flex items-center justify-center gap-2 w-28 px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${copiedItem === 'code' ? 'bg-emerald-500' : 'bg-cyan-600 hover:bg-cyan-500'}`}
                >{copiedItem === 'code' ? <><Check size={16}/> Copied</> : <><Copy size={16}/> Copy</>}</button>
            </div>
        </div>
        <div className="pt-2">
            <a 
                href={`mailto:?subject=Invitation to join meeting&body=Join my meeting with this link: ${meetingLink}`}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold bg-slate-700/70 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            ><Mail size={16} /><span>Share via Email</span></a>
        </div>
    </motion.div>
);


// --- Main MeetingSidebar Component ---
const MeetingSidebar = ({ isOpen, setIsOpen, jitsiApi, meetingLink, isStreaming, isHost }) => {
    const [activePanel, setActivePanel] = useState('participants');
    const [copiedItem, setCopiedItem] = useState(null);
    const [participants, setParticipants] = useState([]);
    
    const sidebarRef = useRef(null);
    const tl = useRef();

    useGSAP(() => {
        const q = gsap.utils.selector(sidebarRef);
        const children = q(".sidebar-content > *");
        tl.current = gsap.timeline({ paused: true });
        tl.current
            .to(sidebarRef.current, { width: '18rem', paddingLeft: '1rem', paddingRight: '1rem', duration: 0.5, ease: 'power3.inOut' })
            .fromTo(children, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }, "-=0.3");
    }, { scope: sidebarRef });

    useGSAP(() => {
        if (isOpen) tl.current.play(); 
        else tl.current.reverse(); 
    }, { dependencies: [isOpen] });
    
    useEffect(() => {
        if (!jitsiApi) return;

        // highlight-start
        // --- THIS IS THE NEW ROBUST LOGIC ---
        const updateParticipantList = () => {
            // Step 1: Create a Map to store unique participants. This is the best way to avoid duplicates.
            const participantsMap = new Map();
             

            // Step 2: Create your local participant object with fallbacks, so it always works.
            const localParticipant = {
                participantId: jitsiApi._myUserId || 'local-user', // Fallback ID
                formattedDisplayName: (jitsiApi.getDisplayName() || 'Me').replace(/\s*\(me\)$/, '') + ' (You)',
                isLocal: true
            };
            
            // Add your local profile to the map first.
            participantsMap.set(localParticipant.participantId, localParticipant);

            // Step 3: Get all other participants from the API.
            const remoteParticipants = jitsiApi.getParticipantsInfo();
            
            // Step 4: Add the other participants to the map. If an ID already exists (like your local one), it won't be added again.
            remoteParticipants.forEach(p => {
                if (!participantsMap.has(p.participantId)) {
                    participantsMap.set(p.participantId, { ...p, isLocal: false });
                }
            });

            // Step 5: Convert the map back to an array and update the state.
            const uniqueParticipants = Array.from(participantsMap.values());
            setParticipants(uniqueParticipants);
        };
        // highlight-end

        // Run the function once initially
        updateParticipantList();
        
        // Set up event listeners to keep the list updated
        const handleParticipantUpdate = () => setTimeout(updateParticipantList, 200);
        
        jitsiApi.addEventListener('participantJoined', handleParticipantUpdate);
        jitsiApi.addEventListener('participantLeft', handleParticipantUpdate);
        jitsiApi.addEventListener('displayNameChange', handleParticipantUpdate);
        jitsiApi.addEventListener('videoConferenceJoined', handleParticipantUpdate);

        return () => {
            jitsiApi.removeEventListener('participantJoined', handleParticipantUpdate);
            jitsiApi.removeEventListener('participantLeft', handleParticipantUpdate);
            jitsiApi.removeEventListener('displayNameChange', handleParticipantUpdate);
            jitsiApi.removeEventListener('videoConferenceJoined', handleParticipantUpdate);
        };
    }, [jitsiApi]);

    const handleMuteParticipant = (participantId) => jitsiApi?.executeCommand('muteParticipant', participantId);
    const handleKickParticipant = (participantId) => {
        if (window.confirm("Are you sure you want to remove this participant?")) {
            jitsiApi?.executeCommand('kickParticipant', participantId);
        }
    };
    
    const handleTogglePanel = (panelName, command) => {
        if (command) {
            if (activePanel !== 'chat' || panelName !== 'chat') {
                 jitsiApi?.executeCommand(command);
            }
        } else {
            if (activePanel === 'chat' && panelName !== 'chat') {
                 jitsiApi?.executeCommand('toggleChat');
            }
        }
        setActivePanel(panelName);
    };

    const handleCopy = (text, type) => {
        if (text && copiedItem !== type) {
            navigator.clipboard.writeText(text).then(() => {
                setCopiedItem(type);
                setTimeout(() => setCopiedItem(null), 2500);
            });
        }
    };

    const meetingCode = meetingLink ? meetingLink.substring(meetingLink.lastIndexOf('/') + 1) : '';

    return (
        <aside
            ref={sidebarRef}
            className="h-screen bg-slate-900 border-r border-slate-800/70 overflow-hidden flex flex-col shadow-2xl"
            style={{ width: 0, padding: 0 }}
        >
            <div className="sidebar-content flex flex-col h-full">
                <div className="flex items-center justify-between py-4 mb-2 border-b border-slate-800 flex-shrink-0">
                    <h2 className="text-lg font-bold text-white tracking-wide">Meeting Hub</h2>
                    <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                        <PanelLeftClose size={20} />
                    </button>
                </div>

                <nav className="flex-shrink-0 space-y-1">
                    <SidebarButton icon={Users} label="Participants" onClick={() => handleTogglePanel('participants')} isActive={activePanel === 'participants'} />
                    <SidebarButton icon={MessageSquare} label="Chat" onClick={() => handleTogglePanel('chat', 'toggleChat')} isActive={activePanel === 'chat'}/>
                    <SidebarButton icon={Share2} label="Share" onClick={() => handleTogglePanel('share')} isActive={activePanel === 'share'}/>
                </nav>
                
                <hr className="border-slate-800 my-3" />

                <div className="flex-grow overflow-hidden">
                    <AnimatePresence mode="wait">
                        {activePanel === 'participants' && (
                            <ParticipantsPanel 
                                participants={participants}
                                isHost={isHost}
                                onMute={handleMuteParticipant}
                                onKick={handleKickParticipant}
                            />
                        )}
                        {activePanel === 'share' && (
                            <SharePanel 
                                meetingLink={meetingLink} 
                                meetingCode={meetingCode} 
                                handleCopy={handleCopy} 
                                copiedItem={copiedItem} 
                            />
                        )}
                    </AnimatePresence>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-800 flex-shrink-0">
                     <div className={`flex items-center justify-center gap-2.5 text-xs font-semibold rounded-lg p-2 ${isStreaming ? 'bg-red-500/20 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                           {isStreaming ? (
                               <><Radio size={14} className="animate-pulse" /><span>STREAMING LIVE</span></>
                           ) : (
                               <><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span><span>Connected</span></>
                           )}
                     </div>
                </div>
            </div>
        </aside>
    );
};

export default MeetingSidebar;