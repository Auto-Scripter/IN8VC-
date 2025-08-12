import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function GuestMeeting() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);

  const canJoin = useMemo(() => name.trim().length > 0, [name]);

  const handleJoin = () => {
    if (!canJoin) return;
    localStorage.setItem('userName', name.trim());
    // flags for Meeting page to pick up initial state
    localStorage.setItem('guestJoinAudio', String(micOn));
    localStorage.setItem('guestJoinVideo', String(camOn));
    localStorage.setItem('joinAsGuest', 'true');
    navigate(`/meeting/${meetingId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white px-4">
      <div className="w-full max-w-md bg-slate-800/70 border border-slate-700 rounded-xl p-6 shadow-2xl">
        <h1 className="text-2xl font-bold mb-1">Join as Guest</h1>
        <p className="text-slate-400 text-sm mb-6">Enter your name and choose your audio/video settings before joining.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Your name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={micOn} onChange={() => setMicOn(v => !v)} />
              <span className="text-sm">Mic on</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={camOn} onChange={() => setCamOn(v => !v)} />
              <span className="text-sm">Camera on</span>
            </label>
          </div>
          <button
            disabled={!canJoin}
            onClick={handleJoin}
            className={`w-full py-2.5 rounded-lg font-semibold ${canJoin ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-slate-700 cursor-not-allowed'}`}
          >
            Join Meeting
          </button>
          <p className="text-xs text-slate-400 mt-2">Meeting: <span className="font-mono">{meetingId}</span></p>
        </div>
      </div>
    </div>
  );
}


