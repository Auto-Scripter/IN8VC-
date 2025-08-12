import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const JitsiMeet = React.memo(({
    roomName,
    displayName,
    password,
    domain,
    onMeetingEnd,
    onApiReady,
    onRecordingStatusChanged, 
    startWithVideoMuted,
    startWithAudioMuted,
    prejoinPageEnabled,
    toolbarButtons,
    noiseSuppressionEnabled,
    jwt,
    showToast,
}) => {
    const jitsiContainerRef = useRef(null);
    const apiRef = useRef(null);

    useEffect(() => {
        if (!jitsiContainerRef.current) return;
        
        const effectiveDomain = domain;

        const script = document.createElement('script');
        script.src = `https://${effectiveDomain}/external_api.js`;
        script.async = true;
        
        script.onerror = () => console.error(`Failed to load Jitsi script from: https://${effectiveDomain}/external_api.js`);
        
        document.head.appendChild(script);

        const failTimer = setTimeout(() => {
            showToast && showToast({
                title: 'Failed to load meeting',
                message: 'The meeting could not be embedded. Check frame-ancestors/X-Frame-Options on the Jitsi domain.',
                type: 'error',
            });
        }, 15000);

        script.onload = () => {
            if (!window.JitsiMeetExternalAPI) {
                console.error("Jitsi API script not loaded.");
                clearTimeout(failTimer);
                showToast && showToast({ title: 'Load error', message: 'external_api.js did not initialize.', type: 'error' });
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
                    disableInitialGUM: true,
                    noiseSuppression: {
                        enabled: noiseSuppressionEnabled,
                    },
                },
                interfaceConfigOverwrite: {
                    TOOLBAR_BUTTONS: toolbarButtons,
                    SHOW_JITSI_WATERMARK: false,
                },
            };
            if (jwt) {
                options.jwt = jwt;
            }
            
            try {
                apiRef.current = new window.JitsiMeetExternalAPI(effectiveDomain, options);
            } catch (e) {
                console.error('Failed to create JitsiMeetExternalAPI:', e);
                showToast && showToast({ title: 'Embed blocked', message: 'The Jitsi server refused to be embedded. Check X-Frame-Options / CSP (frame-ancestors).', type: 'error' });
                clearTimeout(failTimer);
                return;
            }

            const onIframeReady = () => {
                clearTimeout(failTimer);
                if (onApiReady && typeof onApiReady === 'function') {
                    onApiReady(apiRef.current);
                }
            };

            apiRef.current.addEventListener('iframeReady', onIframeReady);

            apiRef.current.addEventListener('videoConferenceJoined', () => {
                clearTimeout(failTimer);
                if (onApiReady && typeof onApiReady === 'function') {
                    onApiReady(apiRef.current);
                }
            });

            apiRef.current.addEventListener('videoConferenceLeft', () => {
                if (onMeetingEnd && typeof onMeetingEnd === 'function') {
                    onMeetingEnd();
                }
            });

            apiRef.current.addEventListener('recordingStatusChanged', (status) => {
                if (onRecordingStatusChanged && typeof onRecordingStatusChanged === 'function') {
                    onRecordingStatusChanged(status);
                }
            });
        };

        return () => {
            if (apiRef.current) {
                apiRef.current.dispose();
                apiRef.current = null;
            }
            clearTimeout(failTimer);
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, [
        domain, roomName, displayName, password, onMeetingEnd, onApiReady,
        onRecordingStatusChanged, startWithVideoMuted, startWithAudioMuted, 
        prejoinPageEnabled, toolbarButtons, noiseSuppressionEnabled, jwt, showToast 
    ]);

    return (
        <div
            ref={jitsiContainerRef}
            className="w-full h-full overflow-hidden"
            style={{ position: 'relative' }}
        />
    );
});

JitsiMeet.propTypes = {
    domain: PropTypes.string,
    roomName: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    password: PropTypes.string,
    onMeetingEnd: PropTypes.func.isRequired,
    onApiReady: PropTypes.func.isRequired,
    onRecordingStatusChanged: PropTypes.func,
    startWithVideoMuted: PropTypes.bool,
    startWithAudioMuted: PropTypes.bool,
    prejoinPageEnabled: PropTypes.bool,
    toolbarButtons: PropTypes.arrayOf(PropTypes.string),
    noiseSuppressionEnabled: PropTypes.bool,
    jwt: PropTypes.string,
    showToast: PropTypes.func,
};

JitsiMeet.defaultProps = {
    domain: 'meet.in8.com',
    password: '',
    onRecordingStatusChanged: () => {},
    startWithVideoMuted: false,
    startWithAudioMuted: false,
    prejoinPageEnabled: false,
    toolbarButtons: [],
     noiseSuppressionEnabled: true,
     jwt: undefined,
};

export default JitsiMeet;