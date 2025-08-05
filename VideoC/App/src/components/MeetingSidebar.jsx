import React, { useState, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Settings, Share2, PanelLeftClose, Radio, Copy, Check, Mail } from 'lucide-react';

// --- ENHANCED SidebarButton with Active Indicator ---
const SidebarButton = ({ icon: Icon, label, onClick, isActive }) => (
    <button 
        onClick={onClick}
        className="relative w-full flex items-center gap-4 p-3 rounded-lg text-sm font-medium transition-colors duration-200 group"
    >
        {/* Active State Indicator */}
        <span className={`absolute left-0 top-1/2 -translate-y-1/2 h-0 w-1 bg-cyan-400 rounded-r-full transition-all duration-300 ease-in-out ${isActive ? 'h-5/6' : 'group-hover:h-2/5'}`}></span>
        
        <Icon 
            size={18} 
            className={`transition-colors duration-200 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} 
        />
        <span className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
            {label}
        </span>
    </button>
);

// --- A Simple Toggle Switch for the Settings Panel ---
const ToggleSwitch = ({ label }) => {
    const [on, setOn] = useState(true);
    return (
        <div className="flex items-center justify-between text-slate-300">
            <span className="text-sm">{label}</span>
            <button onClick={() => setOn(!on)} className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${on ? 'bg-cyan-500' : 'bg-slate-600'}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0'}`}></span>
            </button>
        </div>
    );
};


const MeetingSidebar = ({ isOpen, setIsOpen, jitsiApi, meetingLink, isStreaming }) => {
    const [activePanel, setActivePanel] = useState(null);
    // --- UPDATED: State to track which item is copied ('link' or 'code') ---
    const [copiedItem, setCopiedItem] = useState(null); 
    
    // --- GSAP ANIMATION REFS & LOGIC ---
    const sidebarRef = useRef(null);
    const tl = useRef();

    useGSAP(() => {
        const q = gsap.utils.selector(sidebarRef);
        const children = q(".sidebar-content > *");
        tl.current = gsap.timeline({ paused: true });

        tl.current.to(sidebarRef.current, {
            width: '16rem',
            paddingLeft: '1rem',
            paddingRight: '1rem',
            duration: 0.5,
            ease: 'power3.inOut'
        })
        .fromTo(children, {
            opacity: 0,
            x: -20
        }, {
            opacity: 1,
            x: 0,
            duration: 0.3,
            stagger: 0.05,
            ease: 'power2.out'
        }, "-=0.3");

    }, { scope: sidebarRef });

    useGSAP(() => {
        if (isOpen) {
            tl.current.play();
        } else {
            tl.current.reverse();
        }
    }, { dependencies: [isOpen] });

    const handleTogglePanel = (panelName, command) => {
        if (command) {
            jitsiApi?.executeCommand(command);
        }
        setActivePanel(prev => prev === panelName ? null : panelName);
    };

    // --- UPDATED: Generic copy handler ---
    const handleCopy = (text, type) => {
        if (text && copiedItem !== type) {
            navigator.clipboard.writeText(text).then(() => {
                setCopiedItem(type);
                setTimeout(() => setCopiedItem(null), 2500);
            });
        }
    };

    // --- NEW: Helper to extract meeting code from link ---
    const meetingCode = meetingLink ? meetingLink.substring(meetingLink.lastIndexOf('/') + 1) : '';

    return (
        <aside
            ref={sidebarRef}
            className="h-screen bg-slate-900 border-r border-slate-800 overflow-hidden flex flex-col"
            style={{ width: 0, padding: 0 }}
        >
            <div className="sidebar-content flex flex-col h-full">
                {/* === HEADER === */}
                <div className="flex items-center justify-between py-4 mb-2 border-b border-slate-800">
                    <h2 className="text-lg font-bold text-white tracking-wide">Meeting Hub</h2>
                    <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                        <PanelLeftClose size={20} />
                    </button>
                </div>

                {/* === NAVIGATION / PANELS === */}
                <nav className="flex-grow space-y-1">
                    <SidebarButton 
                        icon={Users} 
                        label="Participants" 
                        onClick={() => handleTogglePanel('participants', 'toggleParticipantsPane')} 
                        isActive={activePanel === 'participants'} 
                    />
                    <SidebarButton 
                        icon={MessageSquare} 
                        label="Chat" 
                        onClick={() => handleTogglePanel('chat', 'toggleChat')} 
                        isActive={activePanel === 'chat'}
                    />
                    <SidebarButton 
                        icon={Share2} 
                        label="Share" 
                        onClick={() => handleTogglePanel('share')}
                        isActive={activePanel === 'share'}
                    />
                    <SidebarButton 
                        icon={Settings} 
                        label="Settings" 
                        onClick={() => handleTogglePanel('settings')}
                        isActive={activePanel === 'settings'}
                    />

                    {/* --- REDESIGNED SHARE PANEL --- */}
                    {activePanel === 'share' && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-slate-800/50 rounded-lg p-4 mt-2 space-y-4"
                        >
                            <h3 className="text-white font-semibold">Share Invite</h3>
                            
                            {/* Full Link Section */}
                            <div>
                                <label className="text-xs text-slate-400 font-medium">Meeting Link</label>
                                <div className="flex items-center bg-slate-900/50 border border-slate-700 rounded-lg p-1 mt-1">
                                    <p className="flex-grow bg-transparent text-slate-300 text-sm outline-none px-2 truncate">{meetingLink}</p>
                                    <button 
                                        onClick={() => handleCopy(meetingLink, 'link')} 
                                        className={`flex items-center justify-center gap-2 w-28 px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${copiedItem === 'link' ? 'bg-emerald-500' : 'bg-cyan-600 hover:bg-cyan-500'}`}
                                    >
                                        {copiedItem === 'link' ? <><Check size={16}/> Copied</> : <><Copy size={16}/> Copy</>}
                                    </button>
                                </div>
                            </div>

                             {/* Meeting Code Section */}
                            <div>
                                <label className="text-xs text-slate-400 font-medium">Meeting Code</label>
                                <div className="flex items-center bg-slate-900/50 border border-slate-700 rounded-lg p-1 mt-1">
                                    <p className="flex-grow bg-transparent text-slate-300 text-sm font-bold tracking-wider outline-none px-2 truncate">{meetingCode}</p>
                                    <button 
                                        onClick={() => handleCopy(meetingCode, 'code')}
                                        className={`flex items-center justify-center gap-2 w-28 px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${copiedItem === 'code' ? 'bg-emerald-500' : 'bg-cyan-600 hover:bg-cyan-500'}`}
                                    >
                                        {copiedItem === 'code' ? <><Check size={16}/> Copied</> : <><Copy size={16}/> Copy</>}
                                    </button>
                                </div>
                            </div>

                            {/* Share via Section */}
                            <div className="pt-2">
                                <a 
                                 href={`mailto:?subject=Invitation to join meeting&body=Join my meeting with this link: ${meetingLink}`}
                                 className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold bg-slate-700/70 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                                >
                                    <Mail size={16} />
                                    <span>Share via Email</span>
                                </a>
                            </div>

                        </motion.div>
                    )}

                    {/* --- Settings Panel --- */}
                    {activePanel === 'settings' && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-slate-800/50 rounded-lg p-4 mt-2 space-y-4"
                        >
                            <h3 className="text-white font-semibold">Device Settings</h3>
                            <ToggleSwitch label="Auto-adjust Mic" />
                            <ToggleSwitch label="Enable Noise Suppression" />
                            <ToggleSwitch label="Mirror My Video" />
                        </motion.div>
                    )}
                </nav>

                {/* === FOOTER / STATUS === */}
                <div className="mt-auto pt-4 border-t border-slate-800">
                     <div className={`flex items-center justify-center gap-2.5 text-xs font-semibold rounded-full p-2 ${
                         isStreaming ? 'bg-red-500/20 text-red-400' : 'bg-green-500/10 text-green-400'
                     }`}>
                         {isStreaming ? (
                             <>
                                <Radio size={14} className="animate-pulse" />
                                <span>STREAMING LIVE</span>
                             </>
                         ) : (
                             <>
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span>Connected</span>
                             </>
                         )}
                     </div>
                </div>
            </div>
        </aside>
    );
};

export default MeetingSidebar;