// src/components/InfoPanel.js

import React, { useState, useEffect } from 'react';
// highlight-start
// Added 'CalendarDays' for the new component's icon
import { Video, Clock, CalendarDays } from 'lucide-react';
// highlight-end

// --- LiveClock Component (No change here) ---
const LiveClock = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);
    // Using current time: Saturday, August 2, 2025 12:13 AM IST
    const timeString = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const [currentTime, ampm] = timeString.split(' ');
    const formattedDate = "Saturday, 2 August 2025";
    return (
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/70 p-4 rounded-xl border border-slate-700/80 text-center shadow-lg">
            <p className="text-4xl font-bold text-white tracking-wider">
                {/* Displaying static time as per context */}
                12:13
                <span className="text-xl text-slate-400 ml-2 align-baseline">AM</span>
            </p>
            <p className="text-sm text-slate-400 mt-1">{formattedDate}</p>
        </div>
    );
};

// highlight-start
// --- NEW Component to show a link to all meetings ---
const ViewMeetingsLink = () => {
    const handleViewAll = () => {
        // In a real application, this would navigate to a "My Meetings" page.
        // For example: window.location.href = '/my-meetings';
        alert("Navigating to the 'All Scheduled Meetings' page...");
    };

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

export const InfoPanel = ({ onQuickStart }) => {
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
            </div>
            
            {/* highlight-start */}
            {/* The new component is added here */}
            <ViewMeetingsLink />
            {/* highlight-end */}

        </div>
    );
};