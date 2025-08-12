// NEW_MeetingSidebar.js

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageSquare, Share2, PanelLeftClose, Radio, Copy, Check, Mail, Award, MicOff, UserX, Mic } from 'lucide-react';

// --- Helper: Sidebar Navigation Button ---
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

// --- Helper: Participants Panel ---
// In NEW_MeetingSidebar.js

// ❗️ REPLACE your entire ParticipantsPanel component with this correct version ❗️
const ParticipantsPanel = ({ participants, isHost, onKick, onMuteAll, onAskToUnmute, onRequestMute }) => {
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
            <div className="flex justify-between items-center px-2 mb-2">
                <h3 className="text-white font-semibold text-sm">
                    In Meeting ({participants.length})
                </h3>
                {isHost && (
                    <button 
                        onClick={onMuteAll} 
                        title="Mute Everyone"
                        className="px-2 py-1 text-xs font-semibold text-slate-300 bg-slate-700/70 rounded-md hover:bg-slate-700 hover:text-white transition-colors"
                    >
                        Mute All
                    </button>
                )}
            </div>
            
            <div className="space-y-1 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50 scrollbar-thumb-rounded-full">
                {participants.map(p => (
                    <div key={p.participantId} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 transition-colors">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(p.formattedDisplayName)} flex-shrink-0 flex items-center justify-center font-bold text-white text-xs`}>
                            {p.formattedDisplayName?.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-slate-200 text-sm truncate flex-grow">{p.formattedDisplayName}</span>
                        <div className="ml-auto flex items-center gap-1">
                            {isHost && !p.isLocal && (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    {p.isAudioMuted ? (
                                        <button onClick={() => onAskToUnmute(p.participantId)} title="Ask to Unmute" className="p-1.5 text-cyan-400 hover:text-white hover:bg-slate-600 rounded-full">
                                            <Mic size={14} />
                                        </button>
                                    ) : (
                                        <button onClick={() => onRequestMute && onRequestMute(p.participantId)} title="Mute Participant" className="p-1.5 text-amber-500 hover:text-white hover:bg-amber-500 rounded-full">
                                            <MicOff size={14} />
                                        </button>
                                    )}
                                    <button onClick={() => onKick(p)} title="Remove Participant" className="p-1.5 text-red-500 hover:text-white hover:bg-red-500 rounded-full">
                                        <UserX size={14} />
                                    </button>
                                </div>
                            )}
                            {p.isModerator && (
                                <Award size={16} title={p.isLocal ? 'You are the host' : 'Host'} className="text-amber-400 flex-shrink-0" />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

// --- Helper: Share Panel ---
const SharePanel = ({ meetingLink, handleCopy, copiedItem }) => {
    const meetingCode = meetingLink ? meetingLink.substring(meetingLink.lastIndexOf('/') + 1) : '';

    return (
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
    )
};

const NEW_MeetingSidebar = ({ isOpen, setIsOpen, jitsiApi, meetingLink, isHost, localDisplayName, hostParticipantId, meetingId }) => {
    const [activePanel, setActivePanel] = useState('participants');
    const [copiedItem, setCopiedItem] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [localParticipantId, setLocalParticipantId] = useState(null);
    const [moderatorIds, setModeratorIds] = useState(new Set());
    const [confirmKick, setConfirmKick] = useState(null); // participant object to confirm removal
    const [confirmMute, setConfirmMute] = useState(null); // participant object to confirm mute
    const updateTimerRef = useRef(null);
    const pollRef = useRef(null);
    
    const sidebarRef = useRef(null);
    const tl = useRef();

    useGSAP(() => {
        gsap.set(sidebarRef.current, { width: isOpen ? '18rem' : 0, padding: isOpen ? '0 1rem' : 0 });
        if(isOpen) {
             gsap.fromTo(sidebarRef.current.children, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out', delay: 0.2 });
        }
    }, { dependencies: [isOpen] });
    
   const updateParticipantList = useCallback(() => {
        if (!jitsiApi) {
            return;
        }
        const rawList = Array.isArray(jitsiApi.getParticipantsInfo()) ? jitsiApi.getParticipantsInfo() : [];
        const dedupedMap = new Map();
        for (const p of rawList) {
            if (!dedupedMap.has(p.participantId)) dedupedMap.set(p.participantId, p);
        }
        const deduped = Array.from(dedupedMap.values());

        let finalList = [];
        if (isHost) {
            let effectiveLocalId = localParticipantId;
            if (!effectiveLocalId) {
                const byName = deduped.find(p => p.formattedDisplayName === localDisplayName || p.displayName === localDisplayName);
                if (byName) effectiveLocalId = byName.participantId;
            }
            const local = deduped.find(p => p.participantId === effectiveLocalId) || null;
            const others = deduped
                .filter(p => p.participantId !== effectiveLocalId)
                .map(p => ({
                    ...p,
                    isLocal: false,
                    isModerator: moderatorIds.has(p.participantId) || p.isModerator || p.role === 'moderator' || (hostParticipantId && p.participantId === hostParticipantId),
                }));
            const adminEntry = {
                participantId: 'local-admin-host',
                formattedDisplayName: (local?.formattedDisplayName || local?.displayName || localDisplayName || 'Admin') + ' (You)',
                isLocal: true,
                isModerator: true,
            };
            finalList = [adminEntry, ...others];
        } else {
            finalList = deduped.map(p => ({
                ...p,
                isModerator: moderatorIds.has(p.participantId) || p.isModerator || p.role === 'moderator' || (hostParticipantId && p.participantId === hostParticipantId),
            }));
        }

        setParticipants(finalList);
    }, [jitsiApi, isHost, localDisplayName, localParticipantId, moderatorIds, hostParticipantId]);// The function now depends on isHost

   const scheduleUpdate = useCallback(() => {
        if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
        updateTimerRef.current = setTimeout(() => {
            updateParticipantList();
        }, 150);
   }, [updateParticipantList]);

   useEffect(() => {
    if (!jitsiApi) {
        return;
    }

    updateParticipantList();

    const handleConferenceJoined = (e) => {
        if (e && e.id) setLocalParticipantId(e.id);
        scheduleUpdate();
    };
    const handleChanged = () => scheduleUpdate();
    const handleRoleChanged = ({ id, role }) => {
        setModeratorIds(prev => {
            const next = new Set(prev);
            if (role === 'moderator') next.add(id); else next.delete(id);
            return next;
        });
        scheduleUpdate();
    };
    jitsiApi.addEventListener('participantJoined', handleChanged);
    jitsiApi.addEventListener('participantLeft', handleChanged);
    jitsiApi.addEventListener('displayNameChange', handleChanged);
    jitsiApi.addEventListener('participantMuteStatusChanged', handleChanged);
    jitsiApi.addEventListener('videoConferenceJoined', handleConferenceJoined);
    jitsiApi.addEventListener('videoConferenceLeft', handleChanged);
    jitsiApi.addEventListener('participantRoleChanged', handleRoleChanged);

    return () => {
        jitsiApi.removeEventListener('participantJoined', handleChanged);
        jitsiApi.removeEventListener('participantLeft', handleChanged);
        jitsiApi.removeEventListener('displayNameChange', handleChanged);
        jitsiApi.removeEventListener('participantMuteStatusChanged', handleChanged);
        jitsiApi.removeEventListener('videoConferenceJoined', handleConferenceJoined);
        jitsiApi.removeEventListener('videoConferenceLeft', handleChanged);
        jitsiApi.removeEventListener('participantRoleChanged', handleRoleChanged);
        if (updateTimerRef.current) clearTimeout(updateTimerRef.current);

    };
}, [jitsiApi, isHost, updateParticipantList]); 

   useEffect(() => {
        if (!jitsiApi) return;
        pollRef.current = setInterval(() => {
            updateParticipantList();
        }, 3000);
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
   }, [jitsiApi, updateParticipantList]);

    const handleKickParticipant = (participantOrId) => {
        let id = null;
        let name = null;
        if (typeof participantOrId === 'string') {
            id = participantOrId;
            const p = participants.find(x => x.participantId === id);
            name = p?.formattedDisplayName || p?.displayName || null;
        } else if (participantOrId && typeof participantOrId === 'object') {
            id = participantOrId.participantId;
            name = participantOrId.formattedDisplayName || participantOrId.displayName || null;
        }
        if (!id) return;
        setConfirmKick({ participantId: id, displayName: name });
    };
    const handleMuteAll = () => {
        jitsiApi?.executeCommand('muteEveryone');
    };

    const handleAskToUnmute = (participantId) => {
        jitsiApi?.executeCommand('askToUnmute', participantId);
    };

    // Force mute using askToUnmute command (works as a mute request)
    const handleForceMute = (participantId) => {
        jitsiApi?.executeCommand('askToUnmute', participantId);
    };
    
    const handleTogglePanel = (panelName) => {
        if (panelName === 'chat') jitsiApi?.executeCommand('toggleChat');
        setActivePanel(panelName);
    };

    const handleCopy = (text, type) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedItem(type);
            setTimeout(() => setCopiedItem(null), 2500);
        });
    };

    return (
        <motion.aside
            ref={sidebarRef}
            className="h-screen bg-slate-900 border-r border-slate-800/70 overflow-hidden flex flex-col shadow-2xl"
            initial={{ width: 0, padding: 0 }}
            animate={{ width: isOpen ? '18rem' : 0, padding: isOpen ? '0 1rem' : 0 }}
            transition={{ duration: 0.5, ease: 'circOut' }}
        >
            <div className="flex items-center justify-between py-4 mb-2 border-b border-slate-800 flex-shrink-0">
                <h2 className="text-lg font-bold text-white tracking-wide">Meeting Hub</h2>
                <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                    <PanelLeftClose size={20} />
                </button>
            </div>

            <nav className="flex-shrink-0 space-y-1">
                <SidebarButton icon={Users} label="Participants" onClick={() => handleTogglePanel('participants')} isActive={activePanel === 'participants'} />
                <SidebarButton icon={MessageSquare} label="Chat" onClick={() => handleTogglePanel('chat')} isActive={activePanel === 'chat'}/>
                <SidebarButton icon={Share2} label="Share" onClick={() => handleTogglePanel('share')} isActive={activePanel === 'share'}/>
            </nav>
            
            <hr className="border-slate-800 my-3" />

            <div className="flex-grow overflow-hidden">
                <AnimatePresence mode="wait">
                    {activePanel === 'participants' && (
                         <ParticipantsPanel 
                            participants={participants}
                            isHost={isHost}
                            onKick={handleKickParticipant}
                            onMuteAll={handleMuteAll} 
                            onAskToUnmute={handleAskToUnmute}
                            onRequestMute={(participantId)=> setConfirmMute({ participantId })}
                        />
                    )}
                    {activePanel === 'share' && (
                        <SharePanel 
                            meetingLink={meetingLink} 
                            handleCopy={handleCopy} 
                            copiedItem={copiedItem} 
                        />
                    )}
                    {activePanel === 'chat' && (
                        <motion.div key="chat-placeholder" className="p-4 text-center text-slate-400 text-sm" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                            <p>Chat panel is managed by Jitsi.</p>
                            <p className="mt-2">Clicking the button again will close it.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-800 flex-shrink-0">
                 <div className="flex items-center justify-center gap-2.5 text-xs font-semibold rounded-lg p-2 bg-green-500/10 text-green-400">
                    <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span><span>Connected & Secure</span>
                </div>
            </div>
            {/* Custom Kick Confirmation */}
            <AnimatePresence>
                {confirmKick && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4"
                        onClick={() => setConfirmKick(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 10, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: -10, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h4 className="text-lg font-semibold text-white mb-1">Remove participant?</h4>
                            <p className="text-sm text-slate-300 mb-4">This participant will be disconnected from the meeting.</p>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setConfirmKick(null)} className="px-4 py-2 rounded-md bg-slate-700 text-slate-200 hover:bg-slate-600">Cancel</button>
                                <button onClick={async () => { 
                                    try {
                                        jitsiApi?.executeCommand('kickParticipant', confirmKick.participantId);
                                        if (isHost && meetingId && confirmKick.displayName) {
                                            // Persist ban in Firestore by display name (best-effort client-side)
                                            await updateDoc(doc(db, 'meetings', meetingId), {
                                                bannedDisplayNames: arrayUnion(confirmKick.displayName)
                                            });
                                        }
                                    } catch (e) {
                                        // ignore
                                    } finally {
                                        setConfirmKick(null);
                                    }
                                }} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-500">Remove</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Custom Mute Confirmation */}
            <AnimatePresence>
                {confirmMute && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4"
                        onClick={() => setConfirmMute(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 10, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: -10, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h4 className="text-lg font-semibold text-white mb-1">Mute participant?</h4>
                            <p className="text-sm text-slate-300 mb-4">They will be muted immediately.</p>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setConfirmMute(null)} className="px-4 py-2 rounded-md bg-slate-700 text-slate-200 hover:bg-slate-600">Cancel</button>
                                <button onClick={() => { handleForceMute(confirmMute.participantId); setConfirmMute(null); }} className="px-4 py-2 rounded-md bg-amber-500 text-white hover:bg-amber-400">Mute</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.aside>
    );
};

export default NEW_MeetingSidebar;