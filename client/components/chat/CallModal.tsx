import { useEffect, useRef, useState } from "react";
import { socket } from "../../lib/socket";
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from "lucide-react";

interface CallModalProps {
  currentUser: any;
  callData: any; // { isReceivingCall, from, name, signal, isVideo }
  contactToCall?: any; // The user we are calling
  isVideoCall: boolean;
  onClose: () => void;
}

export default function CallModal({ currentUser, callData, contactToCall, isVideoCall, onClose }: CallModalProps) {
  const [stream, setStream] = useState<MediaStream>();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(!isVideoCall && !callData?.isVideo);

  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<any>();
  const streamRef = useRef<MediaStream>();
  const isCancelled = useRef(false);
  const callIdRef = useRef(callData?.callId || crypto.randomUUID());

  useEffect(() => {
    isCancelled.current = false;
    // Get user media
    navigator.mediaDevices
      .getUserMedia({ video: isVideoCall || callData?.isVideo, audio: true })
      .then((currentStream) => {
        if (isCancelled.current) {
          // If modal was closed before we got the stream, stop it immediately
          currentStream.getTracks().forEach(track => track.stop());
          return;
        }
        setStream(currentStream);
        streamRef.current = currentStream;
      })
      .catch((err) => {
        console.error("Failed to get media permissions", err);
        alert("Please allow camera and microphone permissions.");
        if (!isCancelled.current) {
           onClose();
        }
      });

    const handleCallAccepted = (data: any) => {
      // Validate callId
      if (data.callId && data.callId !== callIdRef.current) return;
      setCallAccepted(true);
      if (connectionRef.current) {
        connectionRef.current.signal(data.signal || data);
      }
    };

    const handleCallRejected = (data: any) => {
      if (data && data.callId && data.callId !== callIdRef.current) return;
      setCallEnded(true);
      endCall();
    };

    const handleCallEnded = (data: any) => {
      if (data && data.callId && data.callId !== callIdRef.current) return;
      setCallEnded(true);
      if (connectionRef.current) connectionRef.current.destroy();
      onClose();
    };

    socket.on("call_accepted", handleCallAccepted);
    socket.on("call_rejected", handleCallRejected);
    socket.on("call_ended", handleCallEnded);

    return () => {
      isCancelled.current = true;
      socket.off("call_accepted", handleCallAccepted);
      socket.off("call_rejected", handleCallRejected);
      socket.off("call_ended", handleCallEnded);
      
      // Stop tracks on cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Sync stream to video element
  useEffect(() => {
    if (stream && myVideo.current) {
      myVideo.current.srcObject = stream;
    }
  }, [stream]);

  // Initiate a call
  useEffect(() => {
    if (stream && contactToCall && !callData?.isReceivingCall) {
      import("simple-peer").then(({ default: Peer }) => {
        if (isCancelled.current) return; // Do not leave peer active or emit call_user if cancelled
        
        const peer = new Peer({
          initiator: true,
          trickle: false,
          stream,
        });

        peer.on("signal", (data) => {
          if (isCancelled.current) return;
          socket.emit("call_user", {
            userToCall: contactToCall.id,
            signalData: data,
            from: currentUser.id,
            name: currentUser.name,
            isVideo: isVideoCall,
            callId: callIdRef.current
          });
        });

        peer.on("stream", (currentStream) => {
          if (userVideo.current) {
            userVideo.current.srcObject = currentStream;
          }
        });

        peer.on("error", (err) => {
          console.error("Peer error:", err);
          endCall();
        });

        connectionRef.current = peer;
      });
    }
  }, [stream, contactToCall]);

  const answerCall = () => {
    if (!stream) return; // Prevent creating Peer before local media is ready
    setCallAccepted(true);
    
    import("simple-peer").then(({ default: Peer }) => {
      if (isCancelled.current) return;
      
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream,
      });

      peer.on("signal", (data) => {
        if (isCancelled.current) return;
        socket.emit("answer_call", { signal: data, to: callData.from, callId: callIdRef.current });
      });

      peer.on("stream", (currentStream) => {
        if (userVideo.current) {
          userVideo.current.srcObject = currentStream;
        }
      });
      
      peer.on("error", (err) => {
        console.error("Peer error:", err);
        endCall();
      });

      peer.signal(callData.signal);
      connectionRef.current = peer;
    });
  };

  const endCall = () => {
    setCallEnded(true);
    isCancelled.current = true;
    if (connectionRef.current) connectionRef.current.destroy();
    
    // Stop tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (callData?.isReceivingCall) {
      socket.emit("reject_call", { to: callData.from, callId: callIdRef.current });
    } else if (contactToCall) {
      socket.emit("end_call", { to: contactToCall.id, callId: callIdRef.current });
    }
    
    onClose();
  };

  const toggleMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 w-full max-w-4xl p-6">
        {/* Videos Container */}
        <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center shadow-2xl border border-white/10">
          
          {callAccepted && !callEnded ? (
            <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-4 animate-pulse">
              <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center">
                <Phone className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-semibold text-white">
                {callData?.isReceivingCall ? `${callData.name} is calling...` : `Calling ${contactToCall?.name}...`}
              </h2>
            </div>
          )}

          {/* My Video (Picture in Picture) */}
          {stream && (isVideoCall || callData?.isVideo) && (
            <div className="absolute bottom-6 right-6 w-48 aspect-video bg-black rounded-xl overflow-hidden shadow-xl border border-white/20">
              <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 bg-white/10 p-4 rounded-full border border-white/5 backdrop-blur-md">
          {callData?.isReceivingCall && !callAccepted ? (
            <>
              <button onClick={answerCall} className="p-4 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all hover:scale-110 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                <Phone className="w-6 h-6" />
              </button>
              <button onClick={endCall} className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all hover:scale-110 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                <PhoneOff className="w-6 h-6" />
              </button>
            </>
          ) : (
            <>
              <button onClick={toggleMute} className={`p-4 rounded-full transition-all hover:scale-110 ${isMuted ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              {(isVideoCall || callData?.isVideo) && (
                <button onClick={toggleVideo} className={`p-4 rounded-full transition-all hover:scale-110 ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                  {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                </button>
              )}
              <button onClick={endCall} className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all hover:scale-110 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                <PhoneOff className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
