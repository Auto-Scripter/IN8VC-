import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    VideoIcon, Mail, Calendar, Clock, Video, X, Share2, Copy, Check,
    Users, Film, MessageSquare, ArrowLeft, User as UserIcon, KeyRound, ChevronLeft, ChevronRight,
    Mic, MicOff, VideoOff, PanelLeftOpen, Settings as SettingsIcon, Hand, MonitorUp, PhoneOff,
    Presentation, Timer, HardDriveDownload, CalendarClock
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';


import { InfoPanel } from '../components/InfoPanel';
import Toast from "../components/Toast";
import JitsiMeet from '../components/JitsiMeet';
import { createAdminJwt } from '../utils/jwt';
import CustomControls from '../components/CustomControls';
import { supabase } from '../supabase';
import MeetingSidebar from '../components/MeetingSidebar';


const LoadingScreen = () => {
    return (
        <div className="absolute inset-0 bg-slate-900 flex justify-center items-center z-[100]">
            <div className="flex flex-col items-center gap-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-blue-500"
                />
                <p className="text-slate-400">Loading meeting...</p>
            </div>
        </div>
    );
};

const ShineButton = ({ children, ...props }) => {
    const buttonRef = useRef(null);
    const shineRef = useRef(null);
    const timeline = useRef(null);

    useGSAP(() => {
        timeline.current = gsap.timeline({ paused: true })
            .fromTo(shineRef.current, 
                { x: '-120%', skewX: -25 }, 
                { x: '120%', skewX: -25, duration: 0.75, ease: 'power1.inOut' }
            );
    }, { scope: buttonRef });

    const handleMouseEnter = () => {
        timeline.current.restart();
    };

    return (
        <motion.button
            ref={buttonRef}
            onMouseEnter={handleMouseEnter}
            whileTap={{ scale: 0.98 }}
            className="relative w-auto flex items-center justify-center gap-2 py-2.5 px-8 rounded-lg bg-blue-600 font-semibold text-white transition-colors duration-300 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            {...props}
        >
            <span
                ref={shineRef}
                className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
            <span className="relative z-10">{children}</span>
        </motion.button>
    );
};

const AnimatedBackground = () => {
    const numLines = 25;
    const lines = Array.from({ length: numLines });
    const lineVariants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: (i) => ({ pathLength: 1, opacity: 0.7, transition: { pathLength: { delay: i * 0.1, type: "spring", duration: 2, bounce: 0 }, opacity: { delay: i * 0.1, duration: 0.1 }}})
    };
    return (
        <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
            <svg width="100%" height="100%" className="absolute top-0 left-0" preserveAspectRatio="none">
                <defs><linearGradient id="line-gradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="rgba(59, 130, 246, 0.12)" /><stop offset="100%" stopColor="rgba(139, 92, 246, 0.12)" /></linearGradient></defs>
                {lines.map((_, i) => (<React.Fragment key={i}><motion.line x1="-5%" y1={`${(i / (numLines - 1)) * 100}%`} x2="105%" y2={`${(i / (numLines - 1)) * 100}%`} stroke="url(#line-gradient)" strokeWidth="0.25" variants={lineVariants} initial="hidden" animate="visible" custom={i} /><motion.line x1={`${(i / (numLines - 1)) * 100}%`} y1="-5%" x2={`${(i / (numLines - 1)) * 100}%`} y2="105%" stroke="url(#line-gradient)" strokeWidth="0.25" variants={lineVariants} initial="hidden" animate="visible" custom={i + 5} /></React.Fragment>))}
            </svg>
            <motion.div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full filter blur-3xl opacity-20" animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 1, 1.05, 1], rotate: [0, 10, -10, 0] }} transition={{ duration: 30, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }} />
            <motion.div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-gradient-to-tl from-purple-600/15 to-blue-600/15 rounded-full filter blur-3xl opacity-20" animate={{ x: [0, -30, 10, 0], y: [0, 20, -40, 0], scale: [1, 1.05, 1, 0.95, 1], rotate: [0, -15, 15, 0] }} transition={{ duration: 35, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 5 }} />
        </div>
    );
};

const ShareModal = ({ meetingLink, onClose }) => {
    const [isCopied, setIsCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(meetingLink).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2500);
        });
    };
    return (
        <motion.div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-slate-800/80 backdrop-blur-lg border border-slate-700 p-6 rounded-xl shadow-xl w-full max-w-md text-center" initial={{ scale: 0.9, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
                <div className="flex justify-end"><button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={24} /></button></div>
                <Share2 className="mx-auto text-blue-400 mb-3" size={40} />
                <h2 className="text-2xl font-bold text-white mb-2">Meeting Ready!</h2>
                <p className="text-slate-400 mb-6">Share this link with your invitees.</p>
                <div className="flex items-center bg-slate-900/50 border border-slate-700 rounded-lg p-2 mb-4">
                    <input type="text" readOnly value={meetingLink} className="flex-grow bg-transparent text-slate-300 text-sm outline-none px-2" />
                    <button onClick={handleCopy} className={`flex items-center justify-center gap-2 w-28 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${isCopied ? 'bg-emerald-500' : 'bg-blue-600 hover:bg-blue-500'}`}>{isCopied ? <><Check size={16}/> Copied!</> : <><Copy size={16}/> Copy</>}</button>
                </div>
                <div className="flex items-center justify-center gap-4"><a href={`mailto:?subject=Invitation to join meeting&body=Join my meeting with this link: ${meetingLink}`} className="flex items-center gap-2 text-sm text-slate-300 bg-slate-700/50 hover:bg-slate-700 transition-colors px-4 py-2 rounded-lg"><Mail size={18} /><span>Email</span></a></div>
            </motion.div>
        </motion.div>
    );
};

const CustomCalendar = ({ selectedDate, setSelectedDate, close }) => {
    const [date, setDate] = useState(selectedDate || new Date());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();
    const handlePrevMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
    const handleNextMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
    const handleSelectDate = (day) => {
        const newDate = new Date(date.getFullYear(), date.getMonth(), day);
        if (newDate < today) return;
        setSelectedDate(newDate);
        close();
    };

    const month = date.getMonth();
    const year = date.getFullYear();
    const numDays = daysInMonth(month, year);
    const startDay = firstDayOfMonth(month, year);

    return (
        <motion.div
            className="bg-slate-800 p-4 rounded-lg shadow-xl w-full max-w-xs border border-slate-700"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        >
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-700"><ChevronLeft size={20} /></button>
                <span className="font-semibold text-lg">{date.toLocaleString('default', { month: 'long' })} {year}</span>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-700"><ChevronRight size={20} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`}></div>)}
                {Array.from({ length: numDays }).map((_, i) => {
                    const day = i + 1;
                    const currentDate = new Date(year, month, day);
                    const isPast = currentDate < today;
                    const isToday = today.getTime() === currentDate.getTime();
                    const isSelected = selectedDate && selectedDate.getTime() === currentDate.getTime();
                    return (
                        <button
                            key={day}
                            onClick={() => handleSelectDate(day)}
                            disabled={isPast}
                            className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-colors
                                ${isSelected ? 'bg-blue-500 text-white font-bold' : ''}
                                ${!isSelected && isToday ? 'border border-blue-500 text-blue-400' : ''}
                                ${!isSelected && !isToday ? 'hover:bg-slate-700' : ''}
                                ${isPast ? 'text-slate-600 cursor-not-allowed' : ''}
                            `}
                        >
                            {day}
                        </button> )})}
            </div>
        </motion.div> );};

const CustomTimePicker = ({ selectedTime, setSelectedTime, close }) => {
    const [hour, setHour] = useState(selectedTime ? selectedTime.getHours() % 12 === 0 ? 12 : selectedTime.getHours() % 12 : 12);
    const [minute, setMinute] = useState(selectedTime ? selectedTime.getMinutes() : 0);
    const [period, setPeriod] = useState(selectedTime ? (selectedTime.getHours() >= 12 ? 'PM' : 'AM') : 'PM');

    const handleSave = () => {
        let finalHour = hour;
        if (period === 'PM' && hour < 12) finalHour += 12;
        if (period === 'AM' && hour === 12) finalHour = 0;

        const newTime = new Date();
        newTime.setHours(finalHour, minute);
        setSelectedTime(newTime);
        close();
    };

    return (
        <motion.div
            className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-xs border border-slate-700"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        >
            <h3 className="text-lg font-semibold text-center mb-4">Select Time</h3>
            <div className="flex items-center justify-center gap-2 text-4xl font-mono">
                <input type="number" min="1" max="12" value={hour} onChange={e => setHour(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))} className="w-20 bg-slate-700 text-center rounded-lg p-2 outline-none focus:ring-2 ring-blue-500" />
                <span>:</span>
                <input type="number" min="0" max="59" step="1" value={String(minute).padStart(2, '0')} onChange={e => setMinute(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))} className="w-20 bg-slate-700 text-center rounded-lg p-2 outline-none focus:ring-2 ring-blue-500" />
                <div className="flex flex-col gap-2 ml-2">
                    <button onClick={() => setPeriod('AM')} className={`px-3 py-1 text-sm rounded-md transition-colors ${period === 'AM' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`}>AM</button>
                    <button onClick={() => setPeriod('PM')} className={`px-3 py-1 text-sm rounded-md transition-colors ${period === 'PM' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`}>PM</button>
                </div>
            </div>
            <button onClick={handleSave} className="w-full mt-6 py-2 px-4 rounded-lg bg-blue-600 font-semibold text-white transition-colors hover:bg-blue-500">Set Time</button>
        </motion.div>
    );
};

const SettingsModal = ({ formValues, handleInputChange, close }) => (
    <motion.div
        className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-sm border border-slate-700"
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
    >
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Advanced Settings</h3>
            <button onClick={close} className="p-1 rounded-full hover:bg-slate-700"><X size={20} /></button>
        </div>
        <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                    <Users className="text-slate-400" size={18} />
                    <span className="text-slate-300 text-sm font-medium">Enable waiting room</span>
                </div>
                <button onClick={() => handleInputChange({ target: { name: 'waitingRoomEnabled', value: !formValues.waitingRoomEnabled } })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formValues.waitingRoomEnabled ? 'bg-blue-500' : 'bg-slate-600'}`}>
                    <motion.span animate={{ x: formValues.waitingRoomEnabled ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }} className="inline-block h-5 w-5 transform rounded-full bg-white" />
                </button>
            </div>
        </div>
    </motion.div>
);

const MeetingDetailsForm = ({
    isScheduling, onSubmit, setView, formValues,
    handleInputChange, handleDateChange, isLoading
}) => {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <motion.form
            key={isScheduling ? "schedule-form" : "start-form"}
            onSubmit={onSubmit}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex flex-col h-full"
        >
            <div className="flex justify-between items-center mb-6 shrink-0">
                <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setView('initial')} className="p-2 rounded-full hover:bg-slate-800"><ArrowLeft size={22}/></button>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{isScheduling ? 'Schedule a Meeting' : 'Start an Instant Meeting'}</h2>
                        <p className="text-slate-400 text-sm">Fill in the details to get started.</p>
                    </div>
                </div>
            </div>
            
            <div className="space-y-4 flex-grow overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50 scrollbar-thumb-rounded-full">
                <div className="relative"><UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" name="userName" placeholder="Your Name*" value={formValues.userName} onChange={handleInputChange} required className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-12 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors" /></div>
                <div className="relative"><VideoIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" name="meetingTitle" placeholder="Meeting Title*" value={formValues.meetingTitle} onChange={handleInputChange} required className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-12 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors" /></div>
                <div className="relative"><MessageSquare className="absolute left-4 top-3.5 text-slate-400" size={18} /><textarea name="meetingPurpose" placeholder="Meeting Purpose (Optional)" value={formValues.meetingPurpose} onChange={handleInputChange} rows="3" className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-12 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none transition-colors" /></div>
                <div className="relative"><KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="password" name="meetingPassword" placeholder="Set Password (Optional)" value={formValues.meetingPassword} onChange={handleInputChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-12 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors" /></div>
                {isScheduling && (
                    <div className="grid sm:grid-cols-2 gap-4">
                        <button type="button" onClick={() => setIsCalendarOpen(true)} className="w-full flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-blue-500 transition-colors">
                            <span>{formValues.scheduleDate ? formValues.scheduleDate.toLocaleDateString() : 'Select Date'}</span>
                            <Calendar className="text-slate-400" size={18} />
                        </button>
                        <button type="button" onClick={() => setIsTimePickerOpen(true)} className="w-full flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-blue-500 transition-colors">
                            <span>{formValues.scheduleTime ? formValues.scheduleTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Select Time'}</span>
                            <Clock className="text-slate-400" size={18} />
                        </button>
                    </div>
                )}
            </div>
            <div className="pt-5 mt-auto flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <p className="text-sm text-slate-400 mr-2">Options:</p>
                    <button type="button" onClick={() => handleInputChange({ target: { name: 'micEnabled', value: !formValues.micEnabled } })} className={`p-2 rounded-full transition-colors ${formValues.micEnabled ? 'bg-slate-700 text-white' : 'bg-red-500 text-white'}`} title={formValues.micEnabled ? 'Mic On' : 'Mic Off'}>
                        {formValues.micEnabled ? <Mic size={18} /> : <MicOff size={18} />}
                    </button>
                    <button type="button" onClick={() => handleInputChange({ target: { name: 'cameraEnabled', value: !formValues.cameraEnabled } })} className={`p-2 rounded-full transition-colors ${formValues.cameraEnabled ? 'bg-slate-700 text-white' : 'bg-red-500 text-white'}`} title={formValues.cameraEnabled ? 'Camera On' : 'Camera Off'}>
                        {formValues.cameraEnabled ? <Video size={18} /> : <VideoOff size={18} />}
                    </button>
                    <button type="button" onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full bg-slate-700 text-white hover:bg-slate-600" title="Advanced Settings"><SettingsIcon size={18} /></button>
                </div>
                
                <ShineButton type="submit" disabled={isLoading}>
                    {isLoading ? 'Processing...' : (isScheduling ? 'Schedule Meeting' : 'Create & Start')}
                </ShineButton>
            </div>
            <AnimatePresence>
                {(isCalendarOpen || isTimePickerOpen || isSettingsOpen) && (
                    <motion.div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsCalendarOpen(false); setIsTimePickerOpen(false); setIsSettingsOpen(false); }}>
                        {isCalendarOpen && <div onClick={(e) => e.stopPropagation()}><CustomCalendar selectedDate={formValues.scheduleDate} setSelectedDate={(date) => handleDateChange({target: {name: 'scheduleDate', value: date}})} close={() => setIsCalendarOpen(false)} /></div>}
                        {isTimePickerOpen && <div onClick={(e) => e.stopPropagation()}><CustomTimePicker selectedTime={formValues.scheduleTime} setSelectedTime={(time) => handleDateChange({target: {name: 'scheduleTime', value: time}})} close={() => setIsTimePickerOpen(false)} /></div>}
                        {isSettingsOpen && <div onClick={(e) => e.stopPropagation()}><SettingsModal formValues={formValues} handleInputChange={handleInputChange} close={() => setIsSettingsOpen(false)} /></div>}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.form>
    );
};

const CreateMeeting = ({ onSubmit, isLoading, initialUserName, navigate }) => {
    const [view, setView] = useState('initial');
    const [formValues, setFormValues] = useState({
        userName: initialUserName || '', meetingTitle: '', meetingPurpose: '', meetingPassword: '',
        scheduleDate: null, scheduleTime: null, micEnabled: true, cameraEnabled: true,
        // --- FIXED: Default waiting room is now false ---
        waitingRoomEnabled: false, 
    });
    const [joinCode, setJoinCode] = useState('');

    const handleInputChange = (e) => setFormValues(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleDateChange = (e) => setFormValues(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const isScheduling = view === 'schedule';
        const finalDateTime = (isScheduling && formValues.scheduleDate && formValues.scheduleTime) ? new Date( formValues.scheduleDate.getFullYear(), formValues.scheduleDate.getMonth(), formValues.scheduleDate.getDate(), formValues.scheduleTime.getHours(), formValues.scheduleTime.getMinutes() ) : null;
        const formData = {
            name: formValues.meetingTitle || (isScheduling ? 'Scheduled Meeting' : 'Instant Meeting'), purpose: formValues.meetingPurpose,
            password: formValues.meetingPassword, isScheduled: isScheduling, scheduledFor: finalDateTime, hostName: formValues.userName,
            startWithAudioMuted: !formValues.micEnabled, startWithVideoMuted: !formValues.cameraEnabled, 
            prejoinPageEnabled: formValues.waitingRoomEnabled,
        };
        onSubmit(formData, isScheduling ? 'later' : 'now');
    };
    
    const handleJoinWithCode = () => {
        if (!joinCode.trim()) return;
        navigate(`/meeting/${joinCode.trim()}`);
    }

    return (
        <div
            className="p-6 bg-slate-900 border border-slate-700/60 h-full flex flex-col justify-center rounded-lg"
            style={{ backgroundImage: 'radial-gradient(ellipse at top, rgba(59, 130, 246, 0.15), transparent 60%)' }}
        >
            <AnimatePresence mode="wait">
                {view === 'initial' && (
                    <motion.div
                        key="initial-view"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center h-full text-center"
                    >
                        <h2 className="text-3xl font-bold text-white">Start or Join a Meeting</h2>
                        <p className="text-slate-400 mt-2 mb-8 max-w-md mx-auto">Create a new meeting instantly, schedule one for later, or join using a code.</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
                            <motion.button onClick={() => setView('startNow')} whileTap={{ scale: 0.98 }} className="flex flex-col items-center justify-center gap-2 p-6 rounded-lg bg-blue-600 text-white font-semibold transition-colors hover:bg-blue-500">
                                <Video size={24} />
                                <span>New Meeting</span>
                            </motion.button>
                             <motion.button onClick={() => setView('schedule')} whileTap={{ scale: 0.98 }} className="flex flex-col items-center justify-center gap-2 p-6 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-semibold transition-colors hover:bg-slate-700">
                                <Calendar size={24} />
                                <span>Schedule for Later</span>
                            </motion.button>
                        </div>
                        
                        <div className="w-full max-w-md my-6"><div className="w-full h-px bg-slate-700"></div></div>

                        <div className="w-full max-w-md mx-auto">
                            <label className="text-sm font-medium text-slate-400 block text-left mb-2">Join with a code</label>
                            <div className="flex gap-2">
                                 <div className="relative flex-grow">
                                    <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
                                    <input type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="Enter code"
                                        className="w-full bg-slate-700/80 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <button onClick={handleJoinWithCode} className="px-5 py-3 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500 transition-colors disabled:opacity-50" disabled={!joinCode.trim()}>Join</button>
                            </div>
                        </div>

                    </motion.div>
                )}
                {(view === 'startNow' || view === 'schedule') && (
                    <MeetingDetailsForm
                        isScheduling={view === 'schedule'} onSubmit={handleFormSubmit} setView={setView}
                        formValues={formValues} handleInputChange={handleInputChange} handleDateChange={handleDateChange}
                        isLoading={isLoading}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="stat-card bg-gradient-to-br from-slate-800/80 to-slate-900/60 backdrop-blur-sm p-4 rounded-xl border border-slate-700/60 flex items-center gap-4 transition-all duration-300 hover:border-blue-500/50 hover:shadow-xl hover:shadow-slate-900/50 hover:-translate-y-1">
        <div className={`p-3 rounded-lg shadow-inner ${color}`}>
            <Icon size={22} className="text-white" />
        </div>
        <div>
            <p className="text-sm text-slate-400 font-medium">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const EMPTY_TOOLBAR = [];

const MeetingPage = () => {
    const { meetingId } = useParams();
    const navigate = useNavigate();

    const [isPageLoading, setIsPageLoading] = useState(!!meetingId);
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeToast, setActiveToast] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [newMeetingLink, setNewMeetingLink] = useState('');
    const [activeMeeting, setActiveMeeting] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [userName, setUserName] = useState('');
    const [jitsiApi, setJitsiApi] = useState(null);
    const [isMeetingSidebarOpen, setIsMeetingSidebarOpen] = useState(true);
    const dashboardContainerRef = useRef(null);
    const [isJitsiLoading, setIsJitsiLoading] = useState(false);
    const [whiteboardOpen, setWhiteboardOpen] = useState(false);
    const [adminIds, setAdminIds] = useState([]);
    const [adminDisplayNames, setAdminDisplayNames] = useState([]);
    const [isCurrentAdmin, setIsCurrentAdmin] = useState(false);
    const prevIsAdminRef = useRef(false);
    const [adminJwt, setAdminJwt] = useState(undefined);

    const [areControlsVisible, setAreControlsVisible] = useState(true);
    const inactivityTimer = useRef(null);
    const [hostParticipantId, setHostParticipantId] = useState(null);

    const showToast = useCallback((toastData) => {
        setActiveToast({ id: Date.now(), ...toastData });
    }, []);

    useGSAP(() => {
        if (!activeMeeting && dashboardContainerRef.current) {
            gsap.from(dashboardContainerRef.current.children, {
                y: 20, opacity: 0, duration: 0.5, ease: 'power3.out', stagger: 0.1,
            });
        }
    }, { dependencies: [activeMeeting] });

    useEffect(() => {
        let mounted = true;
        (async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!mounted) return;
            const user = session?.user || null;
            setCurrentUser(user);
            const storedUserName = localStorage.getItem('userName');
            if (user) { setUserName(storedUserName || user.user_metadata?.full_name || 'User'); } 
            else { setUserName('Guest'); }
        })();
        const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
            if (!mounted) return;
            const user = session?.user || null;
            setCurrentUser(user);
            const storedUserName = localStorage.getItem('userName');
            if (user) { setUserName(storedUserName || user.user_metadata?.full_name || 'User'); } 
            else { setUserName('Guest'); }
        });
        return () => { mounted = false; sub.subscription.unsubscribe(); };
    }, []);

    useEffect(() => {
        const initializePage = async () => {
            if (!meetingId) return;

            if (!currentUser) {
                return;
            }

            setIsPageLoading(true);
            try {
                const { data: meetingData, error } = await supabase
                    .from('meetings')
                    .select('*')
                    .eq('id', meetingId)
                    .single();
                if (!error && meetingData) {
                    
                    const banned = Array.isArray(meetingData.banned_display_names) ? meetingData.banned_display_names : [];
                    const myName = (userName || 'Guest').trim().toLowerCase();
                    const isBanned = banned.some(n => (n || '').trim().toLowerCase() === myName);
                    if (isBanned) {
                        showToast({ title: 'Access denied', message: 'You have been removed from this meeting.', type: 'error' });
                        navigate('/meeting');
                        setIsPageLoading(false);
                        return;
                    }

                    const localHostToken = localStorage.getItem(`hostToken_${meetingId}`);
                    const isUserTheHost = !!(localHostToken && localHostToken === meetingData.host_token);

                    setActiveMeeting({
                        id: meetingId,
                        displayName: userName,
                        ...meetingData,
                        isHost: isUserTheHost
                    });
                    // Generate admin JWT only if current user is host
                    if (isUserTheHost) {
                        try {
                            const token = await createAdminJwt({ name: userName, email: currentUser?.email, avatar: currentUser?.user_metadata?.avatar_url });
                            setAdminJwt(token);
                        } catch (e) {
                            console.error('Failed to create admin JWT:', e);
                        }
                    } else {
                        setAdminJwt(undefined);
                    }
                    setIsJitsiLoading(true);
                } else {
                    showToast({ title: 'Error', message: 'Meeting not found.', type: 'error' });
                    navigate('/meeting');
                }
            } catch (error) {
                console.error("Supabase fetch error:", error);
                showToast({ title: 'Error', message: 'Could not fetch meeting details.', type: 'error' });
                navigate('/meeting');
            } finally {
                setIsPageLoading(false);
            }
        };
        
        initializePage();
        // CHANGED: The dependency array now correctly re-runs when currentUser is set.
    }, [meetingId, currentUser, navigate, userName]);

// In MeetingPage -> handleApiReady
const handleApiReady = useCallback((api) => {
    setJitsiApi(api);
    // +++ STOP the Jitsi loader HERE +++
    setIsJitsiLoading(false);
    try {
        const onJoined = async (e) => {
            if (!activeMeeting?.id) return;
            // Persist the host's participant ID so everyone can badge correctly
            const localIsHost = !!activeMeeting?.isHost;
            if (localIsHost && e?.id) {
                setHostParticipantId(e.id);
                try { await supabase.from('meetings').update({ host_participant_id: e.id }).eq('id', activeMeeting.id); } catch (_) {}
            }
        };
        api.addEventListener('videoConferenceJoined', onJoined);
    } catch (_) {}
}, [activeMeeting]);

// Safety timeout for loader - if Jitsi doesn't initialize within 15 seconds, clear the loader
useEffect(() => {
    if (!activeMeeting) return;
    
    setIsJitsiLoading(true);
    const timeout = setTimeout(() => {
        if (isJitsiLoading) {
            setIsJitsiLoading(false);
            showToast({ 
                title: 'Connection Issue', 
                message: 'Meeting is taking longer than usual to load. Please check your internet connection.', 
                type: 'warning' 
            });
        }
    }, 15000);
    
    return () => clearTimeout(timeout);
}, [activeMeeting]);


    const showControlsAndResetTimer = useCallback(() => {
        setAreControlsVisible(true);
        clearTimeout(inactivityTimer.current);
        inactivityTimer.current = setTimeout(() => {
            setAreControlsVisible(false);
        }, 5000);
    }, []);

    useEffect(() => {
        if (activeMeeting) {
            showControlsAndResetTimer();
            window.addEventListener('mousemove', showControlsAndResetTimer);
            window.addEventListener('keydown', showControlsAndResetTimer);
        }
        return () => {
            window.removeEventListener('mousemove', showControlsAndResetTimer);
            window.removeEventListener('keydown', showControlsAndResetTimer);
            clearTimeout(inactivityTimer.current);
        };
    }, [activeMeeting, showControlsAndResetTimer]);

    // Synchronize whiteboard via Supabase realtime: when the row's whiteboard_open changes,
    // toggle the Jitsi whiteboard to match on every client
    useEffect(() => {
        if (!activeMeeting?.id) return;
        const channel = supabase
            .channel(`meeting-${activeMeeting.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'meetings', filter: `id=eq.${activeMeeting.id}` }, (payload) => {
            const data = payload.new || payload.old || {};
            const admins = Array.isArray(data.admin_ids) ? data.admin_ids : [];
            const normalize = (s) => {
                let v = (s || '').toString();
                v = v.replace(/\s*\([^)]*\)\s*$/g, '');
                try { v = v.normalize('NFKD').replace(/[\u0300-\u036f]/g, ''); } catch (_) {}
                v = v.replace(/\s+/g, ' ').trim().toLowerCase();
                return v;
            };
            const adminNames = Array.isArray(data.admin_display_names) ? data.admin_display_names.map(n => normalize(n)) : [];
            setAdminIds(admins);
            setAdminDisplayNames(adminNames);
            // determine if current user is admin (host always admin)
            const localId = jitsiApi?.myUserId?.() || null;
            // use same normalization as sidebar
            const localDisplay = normalize(activeMeeting?.displayName || userName || '');
            const isAdminNow = !!(activeMeeting?.isHost || (localId && admins.includes(localId)) || (localDisplay && adminNames.includes(localDisplay)));
            if (prevIsAdminRef.current !== isAdminNow) {
                if (isAdminNow) {
                    showToast({ title: 'Role updated', message: 'You are now an admin.', type: 'success' });
                } else if (prevIsAdminRef.current && !isAdminNow) {
                    showToast({ title: 'Role updated', message: 'Your admin rights were removed.', type: 'info' });
                }
                prevIsAdminRef.current = isAdminNow;
            }
            setIsCurrentAdmin(isAdminNow);
            // Ban enforcement: if my displayName is banned, end locally and block
            const banned = Array.isArray(data.banned_display_names) ? data.banned_display_names : [];
            const myName = (activeMeeting?.displayName || userName || 'Guest').trim().toLowerCase();
            const isBanned = banned.some(n => (n || '').trim().toLowerCase() === myName);
            if (isBanned) {
                try { jitsiApi?.dispose(); } catch (_) {}
                showToast({ title: 'Removed by host', message: 'You cannot rejoin this meeting.', type: 'error' });
                setActiveMeeting(null);
                setJitsiApi(null);
                navigate('/meeting');
                return;
            }

            // Whiteboard sync
            const targetOpen = !!data.whiteboard_open;
            setWhiteboardOpen((prev) => {
                if (prev !== targetOpen) {
                    if (jitsiApi) {
                        jitsiApi.executeCommand('toggleWhiteboard');
                    }
                }
                return targetOpen;
            });
        })
        .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [activeMeeting?.id, jitsiApi, navigate, showToast, userName, activeMeeting?.isHost]);

    // Host handler to flip the Firestore flag; all clients react via onSnapshot
    const handleToggleWhiteboard = useCallback(async () => {
        if (!activeMeeting?.id) return;
        try {
            await supabase.from('meetings').update({ whiteboard_open: !whiteboardOpen }).eq('id', activeMeeting.id);
        } catch (e) {
            console.error('Failed to toggle whiteboard flag:', e);
        }
    }, [activeMeeting?.id, whiteboardOpen]);

    // Host: process queued admin actions via Supabase realtime
    useEffect(() => {
        if (!activeMeeting?.id || !jitsiApi || !activeMeeting?.isHost) return;
        const chan = supabase
            .channel(`actions-${activeMeeting.id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'meeting_actions', filter: `meeting_id=eq.${activeMeeting.id}` }, async ({ new: action }) => {
                if (!action || action.status !== 'pending') return;
                try {
                    switch (action.type) {
                        case 'kick':
                            if (action.target_participant_id) {
                                jitsiApi.executeCommand('kickParticipant', action.target_participant_id);
                            }
                            break;
                        case 'mute':
                            if (action.target_participant_id) {
                                try { jitsiApi.executeCommand('muteParticipant', action.target_participant_id); } catch (_) {}
                            }
                            break;
                        case 'mute-everyone':
                            try { jitsiApi.executeCommand('muteEveryone'); } catch (_) {}
                            break;
                        case 'recording-start':
                            jitsiApi.executeCommand('startRecording', { mode: 'file' });
                            break;
                        case 'recording-stop':
                            jitsiApi.executeCommand('stopRecording', 'file');
                            break;
                        case 'stream-start':
                            if (action.platform === 'youtube' && action.stream_key) {
                                jitsiApi.executeCommand('startRecording', { mode: 'stream', youtubeStreamKey: action.stream_key });
                            } else if (action.stream_key && action.rtmp_url) {
                                jitsiApi.executeCommand('startRecording', { mode: 'stream', rtmpStreamKey: action.stream_key, rtmpStreamUrl: action.rtmp_url });
                            }
                            break;
                        case 'stream-stop':
                            jitsiApi.executeCommand('stopRecording', 'stream');
                            break;
                        default:
                            break;
                    }
                    await supabase.from('meeting_actions').update({ status: 'done', processed_at: new Date().toISOString(), requested_by: jitsiApi.myUserId && jitsiApi.myUserId() }).eq('id', action.id);
                } catch (err) {
                    await supabase.from('meeting_actions').update({ status: 'error', error: String(err), processed_at: new Date().toISOString(), requested_by: jitsiApi.myUserId && jitsiApi.myUserId() }).eq('id', action.id);
                }
            })
            .subscribe();
        return () => { supabase.removeChannel(chan); };
    }, [activeMeeting?.id, activeMeeting?.isHost, jitsiApi]);


   const handleCreateMeeting = async (formData, scheduleOption = 'now') => {
        setIsLoading(true);
        if (!currentUser) {
            showToast({ title: 'Auth Error', message: 'You must be logged in.', type: 'error' });
            setIsLoading(false); return;
        }
        if (formData.hostName) localStorage.setItem('userName', formData.hostName);
        
        try {
            const hostToken = uuidv4();

            const { data, error } = await supabase.from('meetings')
                .insert([{
                    name: formData.name,
                    purpose: formData.purpose || null,
                    password: formData.password || null,
                    is_scheduled: !!formData.isScheduled,
                    scheduled_for: formData.scheduledFor ? new Date(formData.scheduledFor).toISOString() : null,
                    host_name: formData.hostName || null,
                    start_with_audio_muted: !!formData.startWithAudioMuted,
                    start_with_video_muted: !!formData.startWithVideoMuted,
                    prejoin_page_enabled: !!formData.prejoinPageEnabled,
                    created_by: currentUser.id,
                    host_token: hostToken,
                }])
                .select('id')
                .single();
            if (error || !data?.id) throw error || new Error('Meeting creation failed');
            const link = `${window.location.origin}/meeting/${data.id}`;
            
            // ADDED: 3. Save the token in localStorage, associated with the new meeting ID
            localStorage.setItem(`hostToken_${data.id}`, hostToken);
            
            setNewMeetingLink(link);
            showToast({ title: 'Success!', message: `Meeting ${scheduleOption === 'now' ? 'created' : 'scheduled'}!`, type: 'success' });
            
            if (scheduleOption === 'now') {
                navigate(`/meeting/${data.id}`);
            } else {
                setIsShareModalOpen(true);
            }
        } catch (error) {
            console.error("Error creating meeting: ", error);
            showToast({ title: 'Error', message: 'Failed to create meeting.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleQuickStart = () => {
        if (!currentUser) {
             showToast({ title: 'Auth Error', message: 'You must be logged in to start a meeting.', type: 'error' });
             return;
        }
        const quickStartData = {
            name: `Instant Meeting - ${new Date().toLocaleDateString()}`, purpose: 'Quick call', password: '',
            isScheduled: false, scheduledFor: null, hostName: userName, startWithAudioMuted: false,
            startWithVideoMuted: false, 
            prejoinPageEnabled: false, // Ensure quick start also skips prejoin
        };
        handleCreateMeeting(quickStartData, 'now');
    };

    const handleEndMeeting = useCallback(() => {
        showToast({ title: 'Meeting Ended', message: 'You have left the meeting.', type: 'info' });
        // Clear guest flags on exit
        localStorage.removeItem('joinAsGuest');
        localStorage.removeItem('guestJoinAudio');
        localStorage.removeItem('guestJoinVideo');
        setActiveMeeting(null);
        setJitsiApi(null);
        navigate('/meeting');
    }, [navigate]);

    if (isPageLoading) {
        return <LoadingScreen />;
    }

    return (

        <div className="flex h-screen relative z-10 overflow-hidden">
            {activeMeeting ? (
                <MeetingSidebar  isOpen={isMeetingSidebarOpen} 
                    setIsOpen={setIsMeetingSidebarOpen} 
                    jitsiApi={jitsiApi} 
                    meetingLink={newMeetingLink || `${window.location.origin}/meeting/${activeMeeting.id}`}
                    isHost={activeMeeting.isHost}
                    isAdmin={isCurrentAdmin}
                    localDisplayName={activeMeeting.displayName}
                    meetingId={activeMeeting.id}
                    adminIds={adminIds}
                    adminDisplayNames={adminDisplayNames}
                    showToast={showToast}
/>

            ) : null}
            <div className="fixed top-5 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-5 w-full max-w-sm px-4 sm:px-0 z-[60]"><AnimatePresence>{activeToast && <Toast key={activeToast.id} toast={activeToast} onClose={() => setActiveToast(null)} />}</AnimatePresence></div>
            <AnimatePresence>{isShareModalOpen && <ShareModal meetingLink={newMeetingLink} onClose={() => setIsShareModalOpen(false)} />}</AnimatePresence>
            <div className="flex-1 flex flex-col h-screen relative">
                 {activeMeeting && !isMeetingSidebarOpen && (
                       <button onClick={() => setIsMeetingSidebarOpen(true)} className="absolute top-4 left-4 z-20 p-2 bg-slate-700/50 rounded-lg text-white hover:bg-slate-600" title="Open Sidebar">
                             <PanelLeftOpen size={20} />
                       </button>
                 )}
                <main className={`flex-1 flex flex-col h-full transition-all duration-300 ${activeMeeting ? 'p-0' : 'p-4 sm:p-6'}`}>
                    <AnimatePresence mode="wait">
                        {activeMeeting ? (
        <motion.div key="meeting-view" className="w-full h-full flex flex-col bg-slate-950 relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{duration: 0.4}}>
            
            {/* +++ Render LoadingScreen when Jitsi is loading +++ */}
            {isJitsiLoading && <LoadingScreen />}

            {/* Hide the Jitsi container until it's fully loaded */}
            <div className="flex-grow w-full min-h-[400px]" style={{ visibility: isJitsiLoading ? 'hidden' : 'visible' }}>
    <JitsiMeet
        domain="meet.jit.si" 
        roomName={activeMeeting.id} 
        displayName={activeMeeting.displayName || userName}
        password={activeMeeting.password} 
        onMeetingEnd={handleEndMeeting} 
        onApiReady={handleApiReady}
        startWithVideoMuted={(() => { const g = localStorage.getItem('joinAsGuest') === 'true'; if (!g) return activeMeeting.startWithVideoMuted; const videoOn = localStorage.getItem('guestJoinVideo') === 'true'; return !videoOn; })()}
        startWithAudioMuted={(() => { const g = localStorage.getItem('joinAsGuest') === 'true'; if (!g) return activeMeeting.startWithAudioMuted; const audioOn = localStorage.getItem('guestJoinAudio') === 'true'; return !audioOn; })()}
        prejoinPageEnabled={activeMeeting.prejoinPageEnabled} 
        toolbarButtons={EMPTY_TOOLBAR}
        showToast={showToast}
        noiseSuppressionEnabled={true} 
        jwt={adminJwt}
/>
</div>
                                <div 
                                    className={`absolute top-0 left-0 w-full h-full z-10 
                                        ${areControlsVisible ? 'pointer-events-none' : 'pointer-events-auto'}`
                                    }
                                />
                                

                                {jitsiApi &&  activeMeeting &&( 
    <CustomControls 
        jitsiApi={jitsiApi} 
        onHangup={handleEndMeeting} 
        areControlsVisible={areControlsVisible}
        pauseTimer={() => clearTimeout(inactivityTimer.current)}
        resumeTimer={showControlsAndResetTimer}
        isHost={activeMeeting.isHost}
        isAdmin={isCurrentAdmin}
        showToast={showToast}
        isWhiteboardOpen={whiteboardOpen}
        onToggleWhiteboard={handleToggleWhiteboard}
    /> 
)}
                            </motion.div>
                        ) : (
                            <div key="dashboard-view" ref={dashboardContainerRef} className="h-full flex flex-col gap-6">
                                <div className="dashboard-header">
                                    <h1 className="text-3xl font-bold text-white">Meeting Dashboard</h1>
                                    <p className="text-slate-400 mt-1">Welcome back, {userName}!</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                    <StatCard title="Meetings Attended" value="28" icon={Presentation} color="bg-blue-500" />
                                    <StatCard title="Total Time" value="12h 45m" icon={Timer} color="bg-purple-500" />
                                    <StatCard title="Recordings Saved" value="7" icon={HardDriveDownload} color="bg-green-500" />
                                    <StatCard title="Upcoming" value="3" icon={CalendarClock} color="bg-orange-500" />
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow min-h-0 overflow-y-auto hide-scrollbar">
                                    <div className="lg:col-span-2 min-h-[500px] lg:min-h-0">
                                        <CreateMeeting onSubmit={handleCreateMeeting} isLoading={isLoading} initialUserName={userName} navigate={navigate} />
                                    </div>
                                    <div className="lg:col-span-1 min-h-[500px] lg:min-h-0">
                                        <InfoPanel onQuickStart={handleQuickStart} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default function MeetingPageContainer() {
    return (
        <div className="relative min-h-screen bg-slate-950 text-white font-sans">
            <AnimatedBackground />
            <MeetingPage />
        </div>
    );
}