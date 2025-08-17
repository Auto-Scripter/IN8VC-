import React, { useEffect, useRef, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts';
import { motion, AnimatePresence, useInView, animate } from 'framer-motion';
import { 
    Bell, Video, MessageSquare, UserPlus, FileText, ChevronLeft, ChevronRight, Search, ArrowRight, PlusCircle, Send,
    LayoutDashboard, Briefcase, Calendar as CalendarIcon, Settings, LifeBuoy, LogOut, Users, Menu, X
} from 'lucide-react';
import { gsap } from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import Sidebar from '../components/Sidebar.jsx';

// GSAP Plugin Registration
gsap.registerPlugin(DrawSVGPlugin);

// --- MOCK DATA ---
const barData = [
  { name: 'Wk 1', meetings: 15 }, { name: 'Wk 2', meetings: 60 },
  { name: 'Wk 3', meetings: 15 }, { name: 'Wk 4', meetings: 40 },
];

const lineData = [
  { name: 'Wk 1', duration: 20 }, { name: 'Wk 2', duration: 35 },
  { name: 'Wk 3', duration: 30 }, { name: 'Wk 4', duration: 45 },
];

const participants = [
  { name: 'Olivia Rhye', percent: 90 }, { name: 'Phoenix Baker', percent: 78 },
  { name: 'Lana Steiner', percent: 72 }, { name: 'Demi Wilkins', percent: 65 },
  { name: 'Candice Wu', percent: 51 },
];

const donutData = [
    { name: 'Sales Calls', value: 400 },
    { name: 'Dev Syncs', value: 300 },
    { name: 'Marketing', value: 300 },
    { name: '1-on-1s', value: 200 },
];
const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f97316'];

const upcomingMeetingsData = [
    { time: '10:00 AM', title: 'Q3 Strategy Review', attendees: 8 },
    { time: '1:00 PM', title: 'Project Phoenix Kick-off', attendees: 12 },
    { time: '3:30 PM', title: '1-on-1 with Alex', attendees: 2 },
];

const recentActivityData = [
    { icon: UserPlus, text: "New user 'Alex Doe' signed up.", time: "2m ago", color: "text-blue-400" },
    { icon: FileText, text: "Report 'Q2 Performance' was generated.", time: "1h ago", color: "text-purple-400" },
    { icon: MessageSquare, text: "New feedback received for 'Project Phoenix'.", time: "3h ago", color: "text-green-400" },
    { icon: Video, text: "Meeting 'Sales Weekly' was completed.", time: "Yesterday", color: "text-orange-400" },
];

const storageData = [{ name: 'Storage', value: 75, fill: '#3b82f6' }];


// --- Custom Hook for Window Size ---
const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
        width: undefined,
    });
    useEffect(() => {
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
            });
        }
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    return windowSize;
};


// --- REUSABLE & RESPONSIVE COMPONENTS ---

function Counter({ from, to, label }) {
    const nodeRef = useRef();
    useEffect(() => {
        const node = nodeRef.current;
        const controls = animate(from, to, {
            duration: 1.5,
            onUpdate(value) { node.textContent = value.toFixed(0) + label; }
        });
        return () => controls.stop();
    }, [from, to, label]);
    return <h3 ref={nodeRef} className="text-xl sm:text-2xl font-semibold text-white" />;
}

const MetricCard = ({ title, value, change, isPositive, label = "" }) => (
    <div className="bg-slate-800/70 p-3 sm:p-5 rounded-lg backdrop-blur-sm border border-slate-700/80 h-full">
        <p className="text-xs sm:text-sm text-slate-400 mb-2">{title}</p>
        <div className="flex items-baseline gap-2">
            {typeof value === 'number' ? <Counter from={0} to={value} label={label} /> : <h3 className="text-xl sm:text-2xl font-semibold text-white">{value}</h3>}
        </div>
        <span className={`text-xs sm:text-sm mt-2 inline-block ${isPositive ? 'text-green-400' : 'text-red-400'}`}>{change}</span>
    </div>
);

const InfoCard = ({ title, description, children, className }) => (
     <div className={`bg-slate-800/70 p-4 sm:p-5 rounded-lg backdrop-blur-sm border border-slate-700/80 flex flex-col ${className}`}>
        <h4 className="font-semibold text-slate-200">{title}</h4>
        {description && <p className="text-xs sm:text-sm text-slate-400 mt-1 mb-4">{description}</p>}
        <div className="flex-grow flex flex-col">
            {children}
        </div>
    </div>
);

const CalendarView = () => {
    const [date, setDate] = useState(new Date(2025, 6, 17));
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

    const changeMonth = (offset) => {
        setDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + offset, 1));};

    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    
    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-3">
                <button onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-slate-700"><ChevronLeft size={18} /></button>
                <h5 className="font-bold text-sm sm:text-base">{monthNames[date.getMonth()]} {date.getFullYear()}</h5>
                <button onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-slate-700"><ChevronRight size={18} /></button>
            </div>
            <div className="grid grid-cols-7 gap-x-2 gap-y-2 text-center text-xs text-slate-400 flex-grow">
                {daysOfWeek.map(day => <div key={day} className="font-semibold text-xs">{day}</div>)}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`}></div>)}
                {Array.from({ length: daysInMonth }).map((_, day) => {
                    const dayNumber = day + 1;
                    const isToday = dayNumber === 17;
                    return (
                        <div key={dayNumber} className={`w-full aspect-square flex items-center justify-center rounded-full cursor-pointer text-xs sm:text-sm ${isToday ? 'bg-blue-500 text-white font-bold' : 'hover:bg-slate-700'}`}>
                            {dayNumber}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ResourceStatCard = ({ title, value, color, data }) => {
    return (
        <InfoCard title={title} className="h-full">
            <div className="flex-grow flex flex-col justify-between text-center sm:text-left">
                <p className="text-lg sm:text-xl font-bold" style={{ color }}>{value.toFixed(1)}%</p>
                <p className="text-xs text-slate-400 mb-2 hidden sm:block">Live Usage</p>
                <ResponsiveContainer width="100%" height={40}>
                    <BarChart data={data}>
                        <Bar dataKey="v" fill={color} radius={2}/>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </InfoCard>
    );
};

// --- MAIN DASHBOARD COMPONENT ---
export default function App() {
  const lineChartRef = useRef(null);
  const isInView = useInView(lineChartRef, { once: true, margin: "-100px" });
  const [userName, setUserName] = useState('User'); 
  const totalMeetings = donutData.reduce((acc, entry) => acc + entry.value, 0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { width } = useWindowSize();
  const isMobile = width < 640;


  const generateResourceData = () => Array.from({ length: 20 }, () => ({ v: Math.random() * 100 }));
  const [cpuData, setCpuData] = useState(generateResourceData());
  const [memoryData, setMemoryData] = useState(generateResourceData());
  const [diskData, setDiskData] = useState(generateResourceData());

  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
        setUserName(storedUserName);
    }

    const interval = setInterval(() => {
        setCpuData(d => [...d.slice(1), { v: Math.random() * 100 }]);
        setMemoryData(d => [...d.slice(1), { v: Math.random() * 100 }]);
        setDiskData(d => [...d.slice(1), { v: Math.random() * 100 }]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isInView && lineChartRef.current) {
        const linePath = lineChartRef.current.querySelector('.recharts-line-path');
        if (linePath) {
            gsap.fromTo(linePath, { drawSVG: 0 }, { drawSVG: "100%", duration: 2, ease: "power2.inOut" });
        }
    }
  }, [isInView]);

  const listContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
  };

  const listItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };
  
  const cardAnimation = {
      initial: { opacity: 0, y: 30 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, amount: 0.3 },
      transition: { type: 'spring', stiffness: 100, damping: 15, duration: 0.5 },
      whileHover: { scale: 1.02, transition: { type: 'spring', stiffness: 300 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-gray-900 text-white font-sans">
      <div className="flex h-screen">
        <div className="flex-1 flex flex-col h-screen">
            <motion.header 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6 }} 
                className="flex justify-between items-center w-full h-20 px-4 md:px-8 border-b border-slate-800 bg-black/10 backdrop-blur-lg flex-shrink-0 z-20"
            >
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 rounded-full hover:bg-slate-700/50">
                        <Menu size={24} />
                    </button>
                    <div>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Hello, {userName.split(' ')[0]}!</h2>
                        <p className="text-slate-400 text-sm hidden md:block">Welcome to IN8.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative hidden sm:block">
                        <input type="text" placeholder="Search..." className="bg-slate-800 border border-slate-700 rounded-full py-2 pl-10 pr-4 w-32 md:w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    <button className="p-2 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700">
                        <Bell size={20} className="text-slate-300" />
                    </button>
                    <img src={`https://i.pravatar.cc/150?u=${userName.replace(' ', '')}`} alt="Profile" className="w-10 h-10 rounded-full border-2 border-slate-700" />
                </div>
            </motion.header>

            <main className="flex-1 p-4 md:p-8 overflow-y-auto hide-scrollbar">
                <div className="space-y-6">
                    
                    <motion.section variants={listContainerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        <motion.div variants={listItemVariants} whileHover={cardAnimation.whileHover}><MetricCard title="Total Meetings" value={135} change="+10%" isPositive={true} /></motion.div>
                        <motion.div variants={listItemVariants} whileHover={cardAnimation.whileHover}><MetricCard title="Avg. Duration" value={42} change="-5%" isPositive={false} label="m" /></motion.div>
                        <motion.div variants={listItemVariants} whileHover={cardAnimation.whileHover}><MetricCard title="Engagement" value={82} change="+15%" isPositive={true} label="%" /></motion.div>
                        <motion.div variants={listItemVariants} whileHover={cardAnimation.whileHover}><MetricCard title="Feedback" value="4.6/5" change="+8%" isPositive={true} /></motion.div>
                    </motion.section>
                    
                    <section className="grid grid-cols-3 gap-4 sm:gap-6">
                        <motion.div {...cardAnimation}><ResourceStatCard title="CPU" value={cpuData[cpuData.length - 1]?.v || 0} color="#3b82d6" data={cpuData} /></motion.div>
                        <motion.div {...cardAnimation}><ResourceStatCard title="Memory" value={memoryData[memoryData.length - 1]?.v || 0} color="#22c55e" data={memoryData} /></motion.div>
                        <motion.div {...cardAnimation}><ResourceStatCard title="Disk" value={diskData[diskData.length - 1]?.v || 0} color="#f97316" data={diskData} /></motion.div>
                    </section>

                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        <motion.div {...cardAnimation} className="h-full"><InfoCard title="Calendar" className="h-full"><CalendarView /></InfoCard></motion.div>
                        <motion.div {...cardAnimation} className="h-full"><InfoCard title="Meeting Breakdown" className="h-full">
                           <div className="relative w-full h-full flex items-center justify-center min-h-[220px] p-2">
                               <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={isMobile ? 40 : 70} outerRadius={isMobile ? 65 : 100} fill="#8884d8" paddingAngle={5}>{donutData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie>
                                        <Tooltip contentStyle={{backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem'}}/>
                                    </PieChart>
                               </ResponsiveContainer>
                               <div className="absolute text-center">
                                   <p className="text-xl sm:text-3xl font-bold">{totalMeetings}</p>
                                   <p className="text-xs sm:text-sm text-slate-400">Total Meetings</p>
                               </div>
                           </div>
                           {!isMobile && <Legend iconType="circle" wrapperStyle={{fontSize: "12px", color: '#94a3b8', paddingTop: '1rem'}}/>}
                        </InfoCard></motion.div>
                        
                        <motion.div {...cardAnimation} className="h-full"><InfoCard title="Storage Status" className="h-full">
                            <div className="flex-grow flex items-center justify-center min-h-[220px] p-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="100%" barSize={isMobile ? 12 : 20} data={storageData} startAngle={90} endAngle={-270}>
                                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                        <RadialBar background clockWise dataKey='value' cornerRadius={10} fill="#3b82f6" />
                                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-xl sm:text-3xl font-bold fill-white">{storageData[0].value}%</text>
                                        <text x="50%" y="50%" dy="20" textAnchor="middle" className="text-xs sm:text-sm fill-slate-400">Used</text>
                                    </RadialBarChart>
                                </ResponsiveContainer>
                            </div>
                        </InfoCard></motion.div>

                        <motion.div {...cardAnimation} className="h-full"><InfoCard title="Top Participants" className="h-full">
                           <motion.div variants={listContainerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-2 sm:space-y-3 flex flex-col h-full justify-center">
                               {participants.slice(0, 4).map((p) => (
                                   <motion.div key={p.name} variants={listItemVariants}>
                                       <div className="flex justify-between text-xs sm:text-sm text-slate-300 mb-1">
                                           <span>{p.name}</span>
                                           <span>{p.percent}%</span>
                                       </div>
                                       <div className="w-full h-2 bg-slate-600 rounded-full">
                                           <motion.div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" initial={{ width: 0 }} whileInView={{ width: `${p.percent}%` }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} viewport={{ once: true }} />
                                       </div>
                                   </motion.div>
                               ))}
                           </motion.div>
                        </InfoCard></motion.div>
                    </section>
                    
                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <motion.div {...cardAnimation} className="lg:col-span-2 h-full">
                            <InfoCard title="Recent Activity" className="h-full">
                                <motion.div variants={listContainerVariants} initial="hidden" animate="visible" className="space-y-4">
                                    {recentActivityData.map((item, index) => (
                                        <motion.div key={index} variants={listItemVariants} className="flex items-center gap-4">
                                            <div className={`p-2 rounded-full bg-slate-700/50 ${item.color}`}><item.icon size={18} /></div>
                                            <div className="flex-1"><p className="text-sm text-slate-200">{item.text}</p></div>
                                            <p className="text-xs text-slate-500">{item.time}</p>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </InfoCard>
                        </motion.div>
                        <motion.div {...cardAnimation} ref={lineChartRef} className="lg:col-span-1 h-full">
                            <InfoCard title="Avg. Duration Trend" className="h-full">
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={lineData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                                        <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem'}}/>
                                        <Line type="monotone" dataKey="duration" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5, fill: '#8b5cf6' }} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </InfoCard>
                        </motion.div>
                    </section>

                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <motion.div {...cardAnimation}>
                            <InfoCard title="Meetings Over Time" description="Weekly overview of scheduled meetings.">
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={barData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip cursor={{fill: 'rgba(148, 163, 184, 0.1)'}} contentStyle={{backgroundColor: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', borderRadius: '0.75rem'}}/>
                                        <Bar dataKey="meetings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </InfoCard>
                        </motion.div>
                        <motion.div {...cardAnimation}>
                            <InfoCard title="Today's Upcoming Meetings" description="Your schedule for the rest of the day.">
                               <motion.div variants={listContainerVariants} initial="hidden" animate="visible" className="flex flex-col h-full">
                                    {upcomingMeetingsData.map((meeting) => (
                                        <motion.div key={meeting.title} variants={listItemVariants} className="flex items-center gap-4 py-3 border-b border-slate-700/80 last:border-none">
                                            <div className="text-sm font-bold text-blue-400 w-20">{meeting.time}</div>
                                            <div>
                                                <p className="font-medium text-slate-200">{meeting.title}</p>
                                                <p className="text-xs text-slate-400">{meeting.attendees} attendees</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                    <button className="text-sm text-blue-400 hover:text-blue-300 mt-auto pt-4 flex items-center justify-center gap-2 w-full">View all meetings <ArrowRight size={16} /></button>
                               </motion.div>
                            </InfoCard>
                        </motion.div>
                        <motion.div {...cardAnimation}>
                            <InfoCard title="Quick Actions" description="Shortcuts for common tasks.">
                                <div className="space-y-3 flex flex-col justify-center flex-grow">
                                    <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"><PlusCircle size={18} className="text-blue-400" /> New Meeting</button>
                                    <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"><UserPlus size={18} className="text-purple-400" /> Add User</button>
                                    <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"><Send size={18} className="text-green-400" /> Send Invite</button>
                                </div>
                            </InfoCard>
                        </motion.div>
                    </section>

                </div>
            </main>
        </div>
      </div>
    </div>
  );
}
