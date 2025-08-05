import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp, Hand, Radio, CircleDot,
    MoreVertical,
    Youtube, Waves, Paintbrush, Image as ImageIcon, BarChart3, LayoutGrid, X
} from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

import StreamKeyModal from './StreamKeyModal'; 

const ShareVideoModal = ({ onShare, onClose }) => {
    const [videoUrl, setVideoUrl] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (videoUrl.trim()) {
            onShare(videoUrl.trim());
        }
    };

    return (
        <motion.div
            className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-slate-800/80 backdrop-blur-lg border border-slate-700 p-6 rounded-xl shadow-xl w-full max-w-lg"
                initial={{ scale: 0.95, y: -20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Share a YouTube Video</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-700">
                        <X size={24} />
                    </button>
                </div>
                <p className="text-slate-400 mb-6">Enter the URL of the YouTube video you want to share with everyone in the meeting.</p>
                <form onSubmit={handleSubmit}>
                    <div className="relative mb-6">
                        <Youtube size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            placeholder="e.g., https://www.youtube.com/watch?v=..."
                            autoFocus
                            className="w-full bg-slate-900/50 border-2 border-slate-700 rounded-lg py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-slate-300 bg-slate-700/70 hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!videoUrl.trim()}
                            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Share Video
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

const ControlButtonWithTooltip = ({ onClick, tooltip, className = '', children }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className="relative flex flex-col items-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <AnimatePresence>
            {isHovered && (
                 <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-full mb-3 px-3 py-1.5 text-sm font-semibold text-white bg-gray-900/90 rounded-md shadow-lg pointer-events-none whitespace-nowrap"
                >
                    {tooltip}
                </motion.div>
            )}
            </AnimatePresence>
            <button
                onClick={onClick}
                className={`p-4 rounded-full transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-400 ${className}`}
            >
                {children}
            </button>
        </div>
    );
};

const MenuItem = ({ icon: Icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-4 px-4 py-2.5 text-sm text-slate-200 text-left rounded-md hover:bg-slate-700/80 transition-colors"
    >
        <Icon size={18} className="text-slate-400" />
        <span>{label}</span>
    </button>
);

const CustomControls = ({ jitsiApi, onHangup, areControlsVisible, pauseTimer, resumeTimer }) => {
    // Internal state for button statuses
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);
    const [isShareVideoModalOpen, setIsShareVideoModalOpen] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [isVideoSharing, setIsVideoSharing] = useState(false);
    
    // Refs
    const menuRef = useRef(null);
    const containerRef = useRef(null);

    // GSAP animation for showing/hiding the entire control bar
    useGSAP(() => {
        gsap.to(containerRef.current, {
            y: areControlsVisible ? '0%' : '150%',
            opacity: areControlsVisible ? 1 : 0,
            duration: 0.5,
            ease: 'power3.out',
        });
    }, [areControlsVisible]);

    // GSAP animations for recording/streaming indicators
    useGSAP(() => {
        if (isStreaming) {
            gsap.to('.live-indicator', { boxShadow: '0 0 15px 5px rgba(34, 197, 94, 0.7)', scale: 1.05, repeat: -1, yoyo: true, duration: 1.5, ease: 'power1.inOut' });
        } else {
            gsap.killTweensOf('.live-indicator');
        }
        if (isRecording) {
            gsap.to('.recording-indicator', { boxShadow: '0 0 15px 5px rgba(239, 68, 68, 0.7)', scale: 1.05, repeat: -1, yoyo: true, duration: 1.5, ease: 'power1.inOut' });
        } else {
            gsap.killTweensOf('.recording-indicator');
        }
    }, { scope: containerRef, dependencies: [isStreaming, isRecording] }); 

    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // +++ TEMPORARY DEBUGGER: Logs all Jitsi events to the console +++
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    useEffect(() => {
        if (!jitsiApi) return;
        const logAllEvents = (event) => {
            // This will log every single event fired by the API
            // Look for an event related to video sharing when you test
            console.log('[JITSI DEBUG EVENT]', event);
        };
        jitsiApi.addEventListener('log', logAllEvents);
        return () => {
            jitsiApi.removeEventListener('log', logAllEvents);
        };
    }, [jitsiApi]);
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // +++ END OF DEBUGGER                                          +++
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


    // Effect for Jitsi event listeners to update button states
    useEffect(() => {
        if (!jitsiApi) return;

        jitsiApi.isAudioMuted().then(muted => setIsAudioMuted(muted));
        jitsiApi.isVideoMuted().then(muted => setIsVideoMuted(muted));
        
        const handleAudioMute = ({ muted }) => setIsAudioMuted(muted);
        const handleVideoMute = ({ muted }) => setIsVideoMuted(muted);
        const handleStreamingStatus = ({ on }) => setIsStreaming(on);
        const handleRecordingStatus = ({ on }) => setIsRecording(on);
        const handleSharedVideoStatus = (event) => {
             // We are trying both possibilities, the debugger will tell us the correct one
            if (event.status) {
                setIsVideoSharing(event.status === 'start');
            } else if (typeof event.on !== 'undefined') {
                setIsVideoSharing(event.on);
            }
        };

        jitsiApi.addEventListener('audioMuteStatusChanged', handleAudioMute);
        jitsiApi.addEventListener('videoMuteStatusChanged', handleVideoMute);
        jitsiApi.addEventListener('streamStatusChanged', handleStreamingStatus);
        jitsiApi.addEventListener('recordingStatusChanged', handleRecordingStatus);
        jitsiApi.addEventListener('sharedVideoStatusChanged', handleSharedVideoStatus);
        
        return () => {
            jitsiApi.removeEventListener('audioMuteStatusChanged', handleAudioMute);
            jitsiApi.removeEventListener('videoMuteStatusChanged', handleVideoMute);
            jitsiApi.removeEventListener('streamStatusChanged', handleStreamingStatus);
            jitsiApi.removeEventListener('recordingStatusChanged', handleRecordingStatus);
            jitsiApi.removeEventListener('sharedVideoStatusChanged', handleSharedVideoStatus);
        };
    }, [jitsiApi]);

    // Effect to handle clicking outside the "More Options" menu to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMoreMenuOpen(false);
            }
        };
        if (isMoreMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMoreMenuOpen]);

    // Jitsi command functions
    const toggleAudio = () => jitsiApi?.executeCommand('toggleAudio');
    const toggleVideo = () => jitsiApi?.executeCommand('toggleVideo');
    const toggleScreenShare = () => jitsiApi?.executeCommand('toggleShareScreen');
    const raiseHand = () => jitsiApi?.executeCommand('toggleRaiseHand');
    const toggleRecording = () => jitsiApi?.executeCommand(isRecording ? 'stopRecording' : 'startRecording', { mode: 'file' });
    const handleStopStream = () => jitsiApi?.executeCommand('stopRecording', { mode: 'stream' });
    const handleStartStream = (streamKey) => {
        jitsiApi?.executeCommand('startRecording', { mode: 'stream', youtubeStreamKey: streamKey });
        setIsStreamModalOpen(false);
    };
    
    const executeCommandAndCloseMenu = (command, ...args) => {
        jitsiApi?.executeCommand(command, ...args);
        setIsMoreMenuOpen(false);
    };

    const handleShareVideo = () => {
        setIsMoreMenuOpen(false);
        setIsShareVideoModalOpen(true);
    };

    const handleStopShareVideo = () => executeCommandAndCloseMenu('stopShareVideo');
    const handleToggleNoiseSuppression = () => executeCommandAndCloseMenu('toggleNoiseSuppression');
    const handleToggleWhiteboard = () => executeCommandAndCloseMenu('toggleWhiteboard');
    const handleShowStats = () => executeCommandAndCloseMenu('toggleSpeakerStats');
    const handleToggleView = () => executeCommandAndCloseMenu('toggleTileView');

    return (
        <>
            {isStreamModalOpen && ( <StreamKeyModal onStart={handleStartStream} onClose={() => setIsStreamModalOpen(false)} isLoading={false} /> )}
            
            <AnimatePresence>
                {isShareVideoModalOpen && (
                    <ShareVideoModal
                        onClose={() => setIsShareVideoModalOpen(false)}
                        onShare={(url) => {
                            executeCommandAndCloseMenu('startShareVideo', url);
                        }}
                    />
                )}
            </AnimatePresence>
            
            <div 
                ref={containerRef}
                className="absolute bottom-5 left-1/2 -translate-x-1/2 w-auto z-20"
                onMouseEnter={pauseTimer}
                onMouseLeave={resumeTimer}
            >
                <div className="bg-gray-950/80 backdrop-blur-xl border border-gray-700/50 rounded-full shadow-2xl p-3 flex justify-center items-center gap-3">
                    
                    <ControlButtonWithTooltip onClick={toggleAudio} tooltip={isAudioMuted ? 'Unmute' : 'Mute'} className={isAudioMuted ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}>
                        {isAudioMuted ? <MicOff size={22} /> : <Mic size={22} />}
                    </ControlButtonWithTooltip>

                    <ControlButtonWithTooltip onClick={toggleVideo} tooltip={isVideoMuted ? 'Start Video' : 'Stop Video'} className={isVideoMuted ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}>
                        {isVideoMuted ? <VideoOff size={22} /> : <Video size={22} />}
                    </ControlButtonWithTooltip>
                    
                    <ControlButtonWithTooltip onClick={toggleScreenShare} tooltip="Share Screen" className="bg-gray-700 hover:bg-gray-600">
                        <MonitorUp size={22} />
                    </ControlButtonWithTooltip>

                    <ControlButtonWithTooltip onClick={raiseHand} tooltip="Raise Hand" className="bg-gray-700 hover:bg-gray-600">
                        <Hand size={22} />
                    </ControlButtonWithTooltip>

                    <ControlButtonWithTooltip onClick={() => isStreaming ? handleStopStream() : setIsStreamModalOpen(true)} tooltip={isStreaming ? "Stop Live Stream" : "Go Live"} className={isStreaming ? 'bg-green-500 text-white live-indicator' : 'bg-cyan-600 hover:bg-cyan-500'}>
                        <Radio size={22} />
                    </ControlButtonWithTooltip>

                    <ControlButtonWithTooltip onClick={toggleRecording} tooltip={isRecording ? "Stop Recording" : "Start Recording"} className={isRecording ? 'bg-red-600 text-white recording-indicator' : 'bg-gray-700 hover:bg-gray-600'}>
                        <CircleDot size={22} />
                    </ControlButtonWithTooltip>

                    <div className="relative" ref={menuRef}>
                        <ControlButtonWithTooltip
                            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                            tooltip="More Options"
                            className="bg-gray-700 text-gray-200 hover:bg-gray-600"
                        >
                            <MoreVertical size={22} />
                        </ControlButtonWithTooltip>

                        <AnimatePresence>
                            {isMoreMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.15, ease: 'easeOut' }}
                                    className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 bg-slate-800/90 backdrop-blur-lg border border-slate-700 rounded-lg shadow-2xl p-2"
                                >
                                    {isVideoSharing ? (
                                        <MenuItem icon={Youtube} label="Stop sharing video" onClick={handleStopShareVideo} />
                                    ) : (
                                        <MenuItem icon={Youtube} label="Share a video" onClick={handleShareVideo} />
                                    )}
                                    <MenuItem icon={Waves} label="Noise Suppression" onClick={handleToggleNoiseSuppression} />
                                    <MenuItem icon={Paintbrush} label="Show Whiteboard" onClick={handleToggleWhiteboard} />
                                    <MenuItem icon={BarChart3} label="Participants Stats" onClick={handleShowStats} />
                                    <MenuItem icon={LayoutGrid} label="Toggle Tile View" onClick={handleToggleView} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <ControlButtonWithTooltip onClick={onHangup} tooltip="Leave Meeting" className="bg-red-600 text-white hover:bg-red-500">
                        <PhoneOff size={22} />
                    </ControlButtonWithTooltip>
                    
                </div>
            </div>
        </>
    );
};

export default CustomControls;