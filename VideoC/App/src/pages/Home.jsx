import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bell, Video, Plus, Calendar, KeyRound, Settings, Film,
    Users, Clock, User, LogOut, ChevronDown, Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';

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
     <div className={`bg-slate-800/70 p-6 sm:p-8 rounded-lg backdrop-blur-sm border border-slate-700/80 flex flex-col ${className}`}>
        {children}
    </div>
);

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-slate-800/70 p-4 rounded-lg border border-slate-700/80 flex items-center gap-4 backdrop-blur-sm">
        <div className={`p-3 rounded-md ${color}`}>
            <Icon size={20} className="text-white" />
        </div>
        <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="text-xl font-bold text-white">{value}</p>
        </div>
    </div>
);

// --- Enhanced Header with Profile Dropdown ---
const AppHeader = ({ userName }) => {
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
                    <Link to="/dashboard" className="hover:text-white transition-colors">My Meetings</Link>
                    <a href="#" className="hover:text-white transition-colors">Recordings</a>
                    <a href="#" className="hover:text-white transition-colors">Contacts</a>
                </nav>
            </div>
            <div className="flex items-center gap-4">
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


const HomePage = () => {
    const [userName, setUserName] = useState('Member');
    const [meetingId, setMeetingId] = useState('');
    const [activeTab, setActiveTab] = useState('upcoming');

    useEffect(() => {
        const storedUserName = localStorage.getItem('userName');
        if (storedUserName) {
            setUserName(storedUserName);
        }
    }, []);

    const cardAnimation = {
        initial: { opacity: 0, y: 50, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-gray-900 text-white font-sans">
            <div className="flex flex-col h-screen">
                <AppHeader userName={userName} />

                <main className="flex-1 w-full p-4 md:p-8">
                    <div className="space-y-8">
                        <motion.section variants={cardAnimation} initial="initial" animate="animate">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <StatCard title="Meetings Attended" value="28" icon={Users} color="bg-blue-500" />
                                <StatCard title="Total Time" value="12h 45m" icon={Clock} color="bg-purple-500" />
                                <StatCard title="Recordings Saved" value="7" icon={Film} color="bg-green-500" />
                                <StatCard title="Upcoming" value="3" icon={Calendar} color="bg-orange-500" />
                            </div>
                        </motion.section>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <motion.div 
                                variants={cardAnimation} initial="initial" animate="animate" transition={{ delay: 0.1 }}
                            >
                                <InfoCard>
                                    <h2 className="text-2xl font-bold text-white">Start or Join a Meeting</h2>
                                    <p className="text-sm text-slate-400 mt-2">Create an instant meeting or join using a code.</p>
                                    <div className="grid sm:grid-cols-2 gap-4 mt-6">
                                        <button className="w-full flex items-center justify-center gap-3 p-4 rounded-lg bg-blue-600 hover:bg-blue-500 transition-all duration-300 font-semibold text-lg text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-1">
                                            <Video size={22} /> New Meeting
                                        </button>
                                        <button className="w-full flex items-center justify-center gap-3 p-4 rounded-lg bg-slate-700 hover:bg-slate-600 transition-all duration-300 font-semibold text-lg text-white">
                                            <Calendar size={22} /> Schedule
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3 pt-4 mt-4 border-t border-slate-700">
                                        <div className="relative flex-grow">
                                            <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input 
                                                type="text" placeholder="Enter a code to join" value={meetingId}
                                                onChange={(e) => setMeetingId(e.target.value.toUpperCase())}
                                                className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-md py-3 pl-12 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                        <button className="py-3 px-6 rounded-md bg-slate-600 font-semibold text-white transition-colors hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!meetingId}>
                                            Join
                                        </button>
                                    </div>
                                </InfoCard>
                            </motion.div>
                            
                            <motion.div variants={cardAnimation} initial="initial" animate="animate" transition={{ delay: 0.2 }}>
                                <InfoCard>
                                    <div className="flex border-b border-slate-700">
                                        <button onClick={() => setActiveTab('upcoming')} className={`py-2 px-4 text-sm font-semibold transition-colors relative ${activeTab === 'upcoming' ? 'text-blue-500' : 'text-slate-400 hover:text-white'}`}>
                                            Upcoming
                                            {activeTab === 'upcoming' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
                                        </button>
                                        <button onClick={() => setActiveTab('recordings')} className={`py-2 px-4 text-sm font-semibold transition-colors relative ${activeTab === 'recordings' ? 'text-blue-500' : 'text-slate-400 hover:text-white'}`}>
                                            Recordings
                                            {activeTab === 'recordings' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
                                        </button>
                                    </div>
                                    <div className="mt-4">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={activeTab}
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                                            >
                                                {activeTab === 'upcoming' && (
                                                    <div className="space-y-1">
                                                        {upcomingMeetingsData.map(m => (
                                                            <div key={m.id} className="flex items-center p-3 rounded-md hover:bg-slate-700/50 transition-colors group">
                                                                <div className="p-2 bg-blue-500/10 rounded-md mr-4"><Calendar size={18} className="text-blue-400" /></div>
                                                                <div className="flex-grow">
                                                                    <p className="font-semibold text-sm text-slate-200">{m.title}</p>
                                                                    <p className="text-xs text-slate-400">{m.time} • {m.attendees} attendees</p>
                                                                </div>
                                                                <button className="opacity-0 group-hover:opacity-100 transition-opacity py-2 px-4 text-sm font-semibold rounded-md bg-blue-600 hover:bg-blue-500">Start</button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {activeTab === 'recordings' && (
                                                     <div className="space-y-1">
                                                        {recentRecordingsData.map(r => (
                                                            <div key={r.title} className="flex items-center p-3 rounded-md hover:bg-slate-700/50 transition-colors group">
                                                                <div className="p-2 bg-purple-500/10 rounded-md mr-4"><Film size={18} className="text-purple-400" /></div>
                                                                <div className="flex-grow">
                                                                    <p className="font-semibold text-sm text-slate-200">{r.title}</p>
                                                                    <p className="text-xs text-slate-400">{r.date} &middot; {r.duration}</p>
                                                                </div>
                                                                 <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-slate-700 hover:bg-slate-600"><Video size={16} /></button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>
                                </InfoCard>
                            </motion.div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default HomePage;
