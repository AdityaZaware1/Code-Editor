import useVideoChat from "@/hooks/useVideoChat"
import { useParams } from "react-router-dom"
import { useRef, useEffect } from "react"

function VideoTab() {
    const { roomId } = useParams()
    const { peers, userVideo } = useVideoChat(roomId)

    return (
        <div className="grid grid-cols-2 gap-4 p-4">
            <div>
                <p className="text-center text-white">You</p>
                <video ref={userVideo} autoPlay playsInline muted className="rounded-lg w-full" />
            </div>
            {peers.map(({ peerID, peer }) => (
                <Video key={peerID} peer={peer} />
            ))}
        </div>
    )
}

function Video({ peer }) {
    const ref = useRef()

    useEffect(() => {
        peer.on("stream", (stream) => {
            if (ref.current) ref.current.srcObject = stream
        })
    }, [peer])

    return (
        <div>
            <video playsInline autoPlay ref={ref} className="rounded-lg w-full" />
        </div>
    )
}

export default VideoTab
