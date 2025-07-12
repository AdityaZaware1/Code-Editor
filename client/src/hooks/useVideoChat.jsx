import { useEffect, useRef, useState } from "react"
import Peer from "simple-peer"
import useSocket from "./useSocket"
import useAppContext from "./useAppContext"
import ACTIONS from "@/utils/actions"

export default function useVideoChat(roomId) {
    const { socket } = useSocket()
    const { currentUser } = useAppContext()
    const [peers, setPeers] = useState([])
    const userVideo = useRef()
    const peersRef = useRef([])

    useEffect(() => {
        let stream;

        async function initVideo() {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (userVideo.current) userVideo.current.srcObject = stream

                socket.emit(ACTIONS.VIDEO_JOIN, { roomId, userId: socket.id })

                socket.on(ACTIONS.VIDEO_ALL_USERS, (users) => {
                    const peers = []
                    users.forEach((userId) => {
                        const peer = createPeer(userId, socket.id, stream)
                        peersRef.current.push({ peerID: userId, peer })
                        peers.push({ peerID: userId, peer })
                    })
                    setPeers(peers)
                })

                socket.on(ACTIONS.VIDEO_USER_JOINED, ({ signal, callerID }) => {
                    const peer = addPeer(signal, callerID, stream)
                    peersRef.current.push({ peerID: callerID, peer })
                    setPeers((prev) => [...prev, { peerID: callerID, peer }])
                })

                socket.on(ACTIONS.VIDEO_RECEIVING_RETURNED_SIGNAL, ({ signal, id }) => {
                    const item = peersRef.current.find((p) => p.peerID === id)
                    if (item) item.peer.signal(signal)
                })

                socket.on(ACTIONS.VIDEO_LEAVE, ({ userId }) => {
                    const peerObj = peersRef.current.find(p => p.peerID === userId);
                    if (peerObj) {
                        peerObj.peer.destroy();
                    }
                    peersRef.current = peersRef.current.filter(p => p.peerID !== userId);
                    setPeers(prev => prev.filter(p => p.peerID !== userId));
                })

            } catch (err) {
                console.error("Failed to get media stream:", err);
            }
        }

        initVideo()

        return () => {
            socket.emit(ACTIONS.VIDEO_LEAVE, { roomId, userId: socket.id });
            stream?.getTracks().forEach(track => track.stop());
            peersRef.current.forEach(p => p.peer.destroy());
            setPeers([]);
        }
    }, [roomId, socket.id])

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({ initiator: true, trickle: false, stream })
        peer.on("signal", (signal) => {
            socket.emit(ACTIONS.VIDEO_SENDING_SIGNAL, { userToSignal, callerID, signal })
        })
        return peer
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({ initiator: false, trickle: false, stream })
        peer.on("signal", (signal) => {
            socket.emit(ACTIONS.VIDEO_RETURNING_SIGNAL, { signal, callerID })
        })
        peer.signal(incomingSignal)
        return peer
    }

    return { peers, userVideo }
}
