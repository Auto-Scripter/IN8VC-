import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bell, Video, Calendar, KeyRound, Settings,
    Users, Clock, User, LogOut, ChevronDown
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../supabase';

// --- MOCK DATA for Member View ---
const upcomingMeetingsData = [
    { time: '10:00 AM', title: 'Q3 Strategy Review', id: 'STRAT-Q3-REVIEW', attendees: 8 },
    { time: '1:00 PM', title: 'Project Phoenix Kick-off', id: 'PROJ-PHNX-KICK', attendees: 12 },
    { time: '3:30 PM', title: '1-on-1 with Alex', id: 'ONE-ALEX-330', attendees: 2 },
];

const recentRecordingsData = [
    { title: "Sales Weekly Sync", date: "July 27, 2025", duration: "45 min" },
    { title: "Project Phoenix - Standup", date: "July 26, 2025", duration: "15 min" },
    { title: "Marketing Brainstorm", date: "July 25, 2025", duration: "1 hr 20 min" },
];

// --- Reusable Components ---
const InfoCard = ({ children, className }) => (
    <div className={`group relative overflow-hidden rounded-2xl bg-slate-900/60 p-6 sm:p-8 border border-slate-700/70 backdrop-blur-xl shadow-xl shadow-black/20 ${className}`}>
        {/* subtle gradient glow on hover */}
        <div className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute -inset-16 bg-gradient-to-br from-blue-500/10 via-fuchsia-500/10 to-purple-500/10 blur-2xl" />
        </div>
        {children}
    </div>
);

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-4 flex items-center gap-4 backdrop-blur-xl shadow-lg hover:shadow-blue-900/20 transition-all duration-300 hover:-translate-y-0.5">
        <div className={`p-3 rounded-lg ${color} shadow-inner shadow-black/20`}> 
            <Icon size={20} className="text-white" />
        </div>
        <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
            <p className="text-2xl font-extrabold text-white">{value}</p>
        </div>
    </div>
);

// --- Enhanced Header with Profile Dropdown ---
const AppHeader = ({ userName, onStartInstant }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
         <motion.header 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} 
            className="flex justify-between items-center w-full h-20 px-4 md:px-8 bg-black/10 backdrop-blur-lg border-b border-slate-800 flex-shrink-0 z-20"
        >
            <div className="flex items-center gap-8">
                <h2 className="text-2xl font-bold text-white">IN8</h2>
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
                    <a href="#" className="text-white font-semibold">Home</a>
                    <Link to="/meeting" className="hover:text-white transition-colors">My Meetings</Link>
                    <a href="#" className="hover:text-white transition-colors">Recordings</a>
                    <a href="#" className="hover:text-white transition-colors">Contacts</a>
                </nav>
            </div>
            <div className="flex items-center gap-4">
                <button
                    onClick={onStartInstant}
                    className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-sm border border-blue-500/30"
                >
                    <Video size={16} /> Start instant
                </button>
                <button className="p-2 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors">
                    <Bell size={20} className="text-slate-300" />
                </button>
                <div className="relative" ref={profileRef}>
                    <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2">
                        <img src={`https://i.pravatar.cc/150?u=${userName.replace(' ', '')}`} alt="Profile" className="w-10 h-10 rounded-full border-2 border-slate-700" />
                        <ChevronDown size={16} className={`text-slate-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.15, ease: 'easeOut' }}
                                className="absolute top-full right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg border border-slate-700 origin-top-right z-50"
                            >
                                <div className="p-2">
                                    <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 rounded-md hover:bg-slate-700"><User size={16} /> Profile</a>
                                    <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 rounded-md hover:bg-slate-700"><Settings size={16} /> Settings</a>
                                    <div className="h-px bg-slate-700 my-1"></div>
                                    <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-red-400 rounded-md hover:bg-red-500/10"><LogOut size={16} /> Logout</a>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.header>
    );
};


// Custom date and time pickers (copied from Meeting page)
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
        <motion.div className="bg-slate-800 p-4 rounded-lg shadow-xl w-full max-w-xs border border-slate-700"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-700">‹</button>
                <span className="font-semibold text-lg">{date.toLocaleString('default', { month: 'long' })} {year}</span>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-700">›</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 mb-2">
                {['S','M','T','W','T','F','S'].map(d => <div key={d}>{d}</div>)}
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
                        <button key={day} onClick={() => handleSelectDate(day)} disabled={isPast}
                            className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-colors ${isSelected ? 'bg-blue-500 text-white font-bold' : ''} ${!isSelected && isToday ? 'border border-blue-500 text-blue-400' : ''} ${!isSelected && !isToday ? 'hover:bg-slate-700' : ''} ${isPast ? 'text-slate-600 cursor-not-allowed' : ''}`}>
                            {day}
                        </button>
                    );
                })}
            </div>
        </motion.div>
    );
};

const CustomTimePicker = ({ selectedTime, setSelectedTime, close }) => {
    const [hour, setHour] = useState(selectedTime ? (selectedTime.getHours() % 12 === 0 ? 12 : selectedTime.getHours() % 12) : 12);
    const [minute, setMinute] = useState(selectedTime ? selectedTime.getMinutes() : 0);
    const [period, setPeriod] = useState(selectedTime ? (selectedTime.getHours() >= 12 ? 'PM' : 'AM') : 'PM');
    const handleSave = () => {
        let finalHour = hour;
        if (period === 'PM' && hour < 12) finalHour += 12;
        if (period === 'AM' && hour === 12) finalHour = 0;
        const newTime = new Date();
        newTime.setHours(finalHour, minute, 0, 0);
        setSelectedTime(newTime);
        close();
    };
    return (
        <motion.div className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-xs border border-slate-700"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
            <h3 className="text-lg font-semibold text-center mb-4">Select Time</h3>
            <div className="flex items-center justify-center gap-2 text-4xl font-mono">
                <input type="number" min="1" max="12" value={hour}
                    onChange={e => setHour(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
                    className="w-20 bg-slate-700 text-center rounded-lg p-2 outline-none focus:ring-2 ring-blue-500" />
                <span>:</span>
                <input type="number" min="0" max="59" step="1" value={String(minute).padStart(2,'0')}
                    onChange={e => setMinute(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    className="w-20 bg-slate-700 text-center rounded-lg p-2 outline-none focus:ring-2 ring-blue-500" />
                <div className="flex flex-col gap-2 ml-2">
                    <button onClick={() => setPeriod('AM')} className={`px-3 py-1 text-sm rounded-md ${period === 'AM' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`}>AM</button>
                    <button onClick={() => setPeriod('PM')} className={`px-3 py-1 text-sm rounded-md ${period === 'PM' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`}>PM</button>
                </div>
            </div>
            <button onClick={handleSave} className="w-full mt-6 py-2 px-4 rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-500">Set Time</button>
        </motion.div>
    );
};

const HomePage = () => {
    const [userName, setUserName] = useState('Member');
    const [meetingId, setMeetingId] = useState('');
    const [activeTab, setActiveTab] = useState('upcoming');
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);
    const [scheduleForm, setScheduleForm] = useState({
        meetingTitle: '',
        meetingPurpose: '',
        meetingPassword: '',
        scheduleDate: '', // yyyy-mm-dd
        scheduleTime: '', // HH:MM
        micEnabled: true,
        cameraEnabled: true,
    });
    const [showCalendar, setShowCalendar] = useState(false);
    const [showTime, setShowTime] = useState(false);

    useEffect(() => {
        const storedUserName = localStorage.getItem('userName');
        if (storedUserName) {
            setUserName(storedUserName);
        }
        let mounted = true;
        (async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (mounted) setCurrentUser(session?.user || null);
        })();
        const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
            if (!mounted) return;
            setCurrentUser(session?.user || null);
        });
        return () => { mounted = false; sub.subscription.unsubscribe(); };
    }, []);

    const createInstantMeeting = async () => {
        if (!currentUser) { alert('You must be logged in to start a meeting.'); return; }
        try {
            const hostToken = uuidv4();
            const { data, error } = await supabase.from('meetings')
                .insert([{
                    name: `Instant Meeting - ${new Date().toLocaleDateString()}`,
                    purpose: 'Quick call',
                    password: null,
                    is_scheduled: false,
                    scheduled_for: null,
                    host_name: userName,
                    start_with_audio_muted: false,
                    start_with_video_muted: false,
                    prejoin_page_enabled: false,
                    created_by: currentUser.id,
                    host_token: hostToken,
                }])
                .select('id')
                .single();
            if (error) throw error;
            localStorage.setItem(`hostToken_${data.id}`, hostToken);
            navigate(`/meeting/${data.id}`);
        } catch (e) {
            console.error('Failed to create meeting', e);
            alert('Failed to create meeting');
        }
    };

    const cardAnimation = {
        initial: { opacity: 0, y: 50, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-gray-900 text-white font-sans">
            <div className="flex flex-col h-screen">
                <AppHeader userName={userName} onStartInstant={createInstantMeeting} />

                <main className="flex-1 w-full p-4 md:p-8 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08),transparent_60%)]">
                    <div className="space-y-8">
                        <motion.section variants={cardAnimation} initial="initial" animate="animate">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <StatCard title="Meetings Attended" value="28" icon={Users} color="bg-blue-500" />
                                <StatCard title="Total Time" value="12h 45m" icon={Clock} color="bg-purple-500" />
                                <StatCard title="Recordings Saved" value="7" icon={Video} color="bg-green-500" />
                                <StatCard title="Upcoming" value="3" icon={Calendar} color="bg-orange-500" />
                            </div>
                        </motion.section>

                        <div className="w-full flex justify-center">
                            <motion.div variants={cardAnimation} initial="initial" animate="animate" transition={{ delay: 0.1 }} className="w-full max-w-2xl">
                                <InfoCard>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-2xl font-extrabold tracking-tight">Start or Join a Meeting</h2>
                                            <p className="text-sm text-slate-400 mt-1">Create an instant meeting, schedule one, or join using a code or link.</p>
                                        </div>
                                        <div className="hidden sm:flex gap-2">
                                            <span className="px-2 py-1 rounded-md text-xs bg-blue-500/10 text-blue-300 border border-blue-600/30">Secure</span>
                                            <span className="px-2 py-1 rounded-md text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-600/30">Realtime</span>
                                        </div>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-4 mt-6">
                                        <button
                                            onClick={createInstantMeeting}
                                            className="w-full flex items-center justify-center gap-3 p-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 font-semibold text-lg text-white shadow-lg hover:shadow-blue-900/30 transform hover:-translate-y-0.5">
                                            <Video size={22} /> New Meeting
                                        </button>
                                        <button
                                            onClick={() => setIsScheduleOpen(true)}
                                            className="w-full flex items-center justify-center gap-3 p-4 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition-all duration-300 font-semibold text-lg text-white border border-slate-600 hover:border-slate-500">
                                            <Calendar size={22} /> Schedule
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3 pt-4 mt-6 border-t border-slate-700">
                                        <div className="relative flex-grow">
                                            <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input 
                                                type="text" placeholder="Enter a code to join" value={meetingId}
                                                onChange={(e) => setMeetingId(e.target.value)}
                                                className="w-full bg-slate-900/50 border-2 border-slate-700 rounded-md py-3 pl-12 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                            <p className="mt-2 text-xs text-slate-400">Paste a code like <span className="font-mono">ABCD1234xyz...</span> or a full link like <span className="font-mono">https://app/meeting/ABCD123...</span></p>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                const raw = meetingId.trim();
                                                if (!raw) return;
                                                // Extract meeting ID from either a plain code or a full URL
                                                let code = raw;
                                                // Try to parse URL
                                                try {
                                                    const maybeUrl = new URL(raw);
                                                    const match = maybeUrl.pathname.match(/\/meeting\/([^\/?#]+)/i);
                                                    if (match && match[1]) code = match[1];
                                                } catch (_) {
                                                    // Not a valid absolute URL; attempt regex directly
                                                    const m = raw.match(/(?:^|\/)meeting\/([^\/?#]+)/i);
                                                    if (m && m[1]) code = m[1];
                                                }
                                                // Final sanitize
                                                code = code.replace(/\s+/g, '');
                                                if (!code) { alert('Please enter a valid meeting code or link.'); return; }
                                                try {
                                                    const { data, error } = await supabase.from('meetings').select('id').eq('id', code).single();
                                                    if (!error && data) {
                                                        navigate(`/meeting/${code}`);
                                                        setMeetingId('');
                                                    } else {
                                                        alert('Meeting not found. Please check the code.');
                                                    }
                                                } catch (e) {
                                                    console.error('Join failed', e);
                                                    alert('Could not join meeting. Please check your input and try again.');
                                                }
                                            }}
                                            className="py-3 px-6 rounded-md bg-blue-600/90 hover:bg-blue-500 font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={!meetingId}>
                                            Join
                                        </button>
                                    </div>
                                </InfoCard>
                            </motion.div>
                        </div>
                    </div>
                </main>
                <AnimatePresence>
                    {isScheduleOpen && (
                        <motion.div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <motion.div className="bg-slate-800/90 backdrop-blur-lg border border-slate-700 p-6 rounded-xl shadow-xl w-full max-w-lg" initial={{ scale: 0.95, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-white">Schedule a Meeting</h2>
                                    <button onClick={() => setIsScheduleOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                                </div>
                                <div className="space-y-4">
                                    <input value={scheduleForm.meetingTitle} onChange={(e)=>setScheduleForm(v=>({...v, meetingTitle:e.target.value}))} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 px-3 text-white" placeholder="Meeting title" />
                                    <input value={scheduleForm.meetingPurpose} onChange={(e)=>setScheduleForm(v=>({...v, meetingPurpose:e.target.value}))} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 px-3 text-white" placeholder="Purpose (optional)" />
                                    <div className="flex gap-3">
                                        <button onClick={(e)=>{e.preventDefault(); setShowCalendar(true);}} className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg py-2 px-3 text-left text-slate-300">{scheduleForm.scheduleDate ? new Date(scheduleForm.scheduleDate).toLocaleDateString() : 'Pick a date'}</button>
                                        <button onClick={(e)=>{e.preventDefault(); setShowTime(true);}} className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg py-2 px-3 text-left text-slate-300">{scheduleForm.scheduleTime ? scheduleForm.scheduleTime : 'Pick a time'}</button>
                                    </div>
                                    <div className="flex items-center gap-3"><label className="text-slate-300 text-sm">Mic on</label><input type="checkbox" checked={scheduleForm.micEnabled} onChange={(e)=>setScheduleForm(v=>({...v, micEnabled:e.target.checked}))} /></div>
                                    <div className="flex items-center gap-3"><label className="text-slate-300 text-sm">Camera on</label><input type="checkbox" checked={scheduleForm.cameraEnabled} onChange={(e)=>setScheduleForm(v=>({...v, cameraEnabled:e.target.checked}))} /></div>
                                    <div className="flex justify-end gap-3 pt-2">
                                        <button onClick={()=>setIsScheduleOpen(false)} className="px-4 py-2 rounded-md bg-slate-700 text-slate-200">Cancel</button>
                                        <button onClick={async ()=>{
                                            if(!currentUser){ alert('You must be logged in.'); return; }
                                            if(!scheduleForm.meetingTitle || !scheduleForm.scheduleDate || !scheduleForm.scheduleTime){ alert('Please complete the form.'); return; }
                                            try{
                                                const date = scheduleForm.scheduleDate; // yyyy-mm-dd
                                                const time = scheduleForm.scheduleTime; // HH:MM
                                                const [year,month,day] = date.split('-').map(n=>parseInt(n,10));
                                                const [hour,minute] = time.split(':').map(n=>parseInt(n,10));
                                                const scheduledFor = new Date(year, month-1, day, hour, minute);
                                                const { data, error } = await supabase.from('meetings')
                                                    .insert([{
                                                        name: scheduleForm.meetingTitle,
                                                        purpose: scheduleForm.meetingPurpose || null,
                                                        password: null,
                                                        is_scheduled: true,
                                                        scheduled_for: scheduledFor.toISOString(),
                                                        host_name: userName,
                                                        start_with_audio_muted: !scheduleForm.micEnabled,
                                                        start_with_video_muted: !scheduleForm.cameraEnabled,
                                                        prejoin_page_enabled: false,
                                                        created_by: currentUser.id,
                                                    }])
                                                    .select('id')
                                                    .single();
                                                if (error) throw error;
                                                setIsScheduleOpen(false);
                                                alert('Meeting scheduled. Share this code: '+data.id);
                                            }catch(e){ console.error(e); alert('Failed to schedule'); }
                                        }} className="px-4 py-2 rounded-md bg-blue-600 text-white">Save</button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {isScheduleOpen && showCalendar && (
                        <motion.div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setShowCalendar(false)}>
                            <div onClick={(e)=>e.stopPropagation()}>
                                <CustomCalendar
                                    selectedDate={scheduleForm.scheduleDate ? new Date(scheduleForm.scheduleDate) : null}
                                    setSelectedDate={(d)=> setScheduleForm(v=>({...v, scheduleDate: d.toISOString()}))}
                                    close={()=> setShowCalendar(false)}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {isScheduleOpen && showTime && (
                        <motion.div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setShowTime(false)}>
                            <div onClick={(e)=>e.stopPropagation()}>
                                <CustomTimePicker
                                    selectedTime={scheduleForm.scheduleTime ? new Date(`1970-01-01T${scheduleForm.scheduleTime}:00`) : null}
                                    setSelectedTime={(t)=>{
                                        const hh = String(t.getHours()).padStart(2,'0');
                                        const mm = String(t.getMinutes()).padStart(2,'0');
                                        setScheduleForm(v=>({...v, scheduleTime: `${hh}:${mm}`}));
                                    }}
                                    close={()=> setShowTime(false)}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default HomePage;
