// src/components/InfoPanel.js

import React, { useState, useEffect } from 'react';
// highlight-start
// Added 'CalendarDays' for the new component's icon
import { Video, Clock, CalendarDays } from 'lucide-react';
// highlight-end

// --- LiveClock Component (dynamic) ---
const LiveClock = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);
    const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const [currentTime, ampm] = timeString.split(' ');
    const formattedDate = time.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return (
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/70 p-4 rounded-xl border border-slate-700/80 text-center shadow-lg">
            <p className="text-4xl font-bold text-white tracking-wider">
                {currentTime}
                <span className="text-xl text-slate-400 ml-2 align-baseline">{ampm}</span>
            </p>
            <p className="text-sm text-slate-400 mt-1">{formattedDate}</p>
        </div>
    );
};

// highlight-start
// --- Link to view all scheduled meetings ---
const ViewMeetingsLink = ({ onView }) => {
    const handleViewAll = () => { if (typeof onView === 'function') onView(); };

    return (
        <div className="space-y-3 flex flex-col">
            <h3 className="text-lg font-semibold text-white px-2">My Schedule</h3>
            <button
                onClick={handleViewAll}
                className="group w-full flex items-center gap-4 p-4 bg-slate-800/60 rounded-xl border border-slate-700/80 backdrop-blur-sm text-left transition-all duration-200 hover:bg-slate-700/60 hover:border-slate-600"
            >
                <div className="p-2 bg-slate-700 rounded-lg">
                    <CalendarDays size={20} className="text-slate-300" />
                </div>
                <div className="flex-grow">
                    <p className="font-semibold text-white">View All Scheduled Meetings</p>
                    <p className="text-sm text-slate-400">Review, edit, or join your meetings.</p>
                </div>
            </button>
        </div>
    );
};
// highlight-end

// --- Link to view all past meetings ---
const ViewPastMeetingsLink = ({ onView }) => {
    const handleViewAll = () => { if (typeof onView === 'function') onView(); };
    return (
        <div className="space-y-3 flex flex-col">
            <button
                onClick={handleViewAll}
                className="group w-full flex items-center gap-4 p-4 bg-slate-800/60 rounded-xl border border-slate-700/80 backdrop-blur-sm text-left transition-all duration-200 hover:bg-slate-700/60 hover:border-slate-600"
            >
                <div className="p-2 bg-slate-700 rounded-lg">
                    <CalendarDays size={20} className="text-slate-300" />
                </div>
                <div className="flex-grow">
                    <p className="font-semibold text-white">View All Past Meetings</p>
                    <p className="text-sm text-slate-400">Browse your recent calls and re-open details.</p>
                </div>
            </button>
        </div>
    );
};

export const InfoPanel = ({ onQuickStart, onSchedule, onViewScheduled, onViewPast }) => {
    return (
        <div className="flex flex-col space-y-6 h-full p-1">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white px-2">Dashboard</h3>
                <LiveClock />
            </div>
            
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white px-2">Quick Actions</h3>
                <button
                    onClick={onQuickStart}
                    className="w-full group flex items-center justify-center gap-3 py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98]"
                >
                    <Video size={20} className="transition-transform duration-300 group-hover:scale-110" />
                    <span>Start Instant Meeting</span>
                </button>
                <button
                    onClick={onSchedule}
                    className="w-full group flex items-center justify-center gap-3 py-3 px-6 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-100 transition-all"
                >
                    <Clock size={18} />
                    <span>Schedule Meeting</span>
                </button>
            </div>
            
            {/* highlight-start */}
            {/* The new component is added here */}
            <ViewMeetingsLink onView={onViewScheduled} />
            <ViewPastMeetingsLink onView={onViewPast} />
            {/* highlight-end */}

        </div>
    );
};