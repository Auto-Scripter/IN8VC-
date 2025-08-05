import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const JitsiMeet = React.memo(({
    roomName,
    displayName,
    password,
    domain,
    onMeetingEnd,
    onApiReady,
    // highlight-start
    // New prop to notify parent about recording status changes
    onRecordingStatusChanged, 
    // highlight-end
    startWithVideoMuted,
    startWithAudioMuted,
    prejoinPageEnabled,
    toolbarButtons,
    jwt,
}) => {
    const jitsiContainerRef = useRef(null);
    const apiRef = useRef(null);

    useEffect(() => {
        if (!jitsiContainerRef.current) return;
        
        // This should ideally use the domain prop, but keeping your structure
        const effectiveDomain = "meet.in8.com";

        const script = document.createElement('script');
        script.src = `https://${effectiveDomain}/external_api.js`;
        script.async = true;
        
        script.onerror = () => console.error(`Failed to load Jitsi script from: https://${effectiveDomain}/external_api.js`);
        
        document.head.appendChild(script);

        script.onload = () => {
            if (!window.JitsiMeetExternalAPI) {
                console.error("Jitsi API script not loaded.");
                return;
            }

            const options = {
                roomName,
                width: '100%',
                height: '100%',
                parentNode: jitsiContainerRef.current,
                userInfo: { displayName },
                password: password || undefined,
                configOverwrite: {
                    startWithVideoMuted,
                    startWithAudioMuted,
                    prejoinPageEnabled,
                },
                interfaceConfigOverwrite: {
                    TOOLBAR_BUTTONS: toolbarButtons,
                    SHOW_JITSI_WATERMARK: false,
                },
            };
            
            apiRef.current = new window.JitsiMeetExternalAPI(effectiveDomain, options, jwt);

            // Notify parent that the API is ready
            apiRef.current.addEventListener('videoConferenceJoined', () => {
                if (onApiReady && typeof onApiReady === 'function') {
                    onApiReady(apiRef.current);
                }
            });

            // Notify parent when the meeting ends
            apiRef.current.addEventListener('videoConferenceLeft', () => {
                if (onMeetingEnd && typeof onMeetingEnd === 'function') {
                    onMeetingEnd();
                }
            });

            // highlight-start
            // Notify parent about recording status changes
            apiRef.current.addEventListener('recordingStatusChanged', (status) => {
                if (onRecordingStatusChanged && typeof onRecordingStatusChanged === 'function') {
                    onRecordingStatusChanged(status); // Pass the whole status object
                }
            });
            // highlight-end
        };

        return () => {
            if (apiRef.current) {
                apiRef.current.dispose();
                apiRef.current = null;
            }
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, [
        domain, roomName, displayName, password, onMeetingEnd, onApiReady,
        onRecordingStatusChanged, // Add new prop to dependency array
        startWithVideoMuted, startWithAudioMuted, prejoinPageEnabled, toolbarButtons,
        jwt
    ]);

    return (
        <div
            ref={jitsiContainerRef}
            className="w-full h-full overflow-hidden"
            style={{ position: 'relative' }}
        />
    );
});

// Add the new prop to propTypes for validation and clarity
JitsiMeet.propTypes = {
    domain: PropTypes.string,
    roomName: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    password: PropTypes.string,
    onMeetingEnd: PropTypes.func.isRequired,
    onApiReady: PropTypes.func.isRequired,
    onRecordingStatusChanged: PropTypes.func, // New propType
    startWithVideoMuted: PropTypes.bool,
    startWithAudioMuted: PropTypes.bool,
    prejoinPageEnabled: PropTypes.bool,
    toolbarButtons: PropTypes.arrayOf(PropTypes.string),
    jwt: PropTypes.string,
};

// Add a default for the new prop
JitsiMeet.defaultProps = {
    domain: 'meet.in8.com',
    password: '',
    onRecordingStatusChanged: () => {}, // Default empty function
    startWithVideoMuted: false,
    startWithAudioMuted: false,
    prejoinPageEnabled: false,
    toolbarButtons: [],
    jwt: undefined,
};

export default JitsiMeet;