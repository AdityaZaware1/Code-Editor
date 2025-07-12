import useAppContext from "@/hooks/useAppContext"
import useSocket from "@/hooks/useSocket"
import ACTIONS from "@/utils/actions"
import UserStatus from "@/utils/status"
import { useEffect, useRef } from "react"
import { toast } from "react-hot-toast"
import { useLocation, useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"

function FormComponent() {
    const location = useLocation()
    const { currentUser, setCurrentUser, status, setStatus } = useAppContext()
    const { socket } = useSocket()
    const usernameRef = useRef(null)
    const navigate = useNavigate()

    const createNewRoomId = () => {
        const newRoomId = uuidv4()
        setCurrentUser({ ...currentUser, roomId: newRoomId })
        toast.success("Created a new Room ID")
        usernameRef.current?.focus()
    }

    const handleInputChanges = (e) => {
        const { name, value } = e.target
        setCurrentUser((prev) => ({ ...prev, [name]: value }))
    }

    const validateForm = () => {
        if (!currentUser.username?.trim()) {
            toast.error("Enter your username")
            return false
        }
        if (!currentUser.roomId?.trim()) {
            toast.error("Enter a Project ID")
            return false
        }
        if (currentUser.username.length < 3) {
            toast.error("Username must be at least 3 characters")
            return false
        }
        return true
    }

    const joinRoom = (e) => {
        e.preventDefault()
        if (status === UserStatus.ATTEMPTING_JOIN) return
        if (!validateForm()) return
        toast.loading("Joining room...")
        setStatus(UserStatus.ATTEMPTING_JOIN)
        socket.emit(ACTIONS.JOIN_REQUEST, currentUser)
    }

    useEffect(() => {
        if (currentUser.roomId.length > 0) return
        if (location.state?.roomId) {
            setCurrentUser({ ...currentUser, roomId: location.state.roomId })
            if (!currentUser.username) {
                toast.success("Enter your username")
            }
        }
    }, [currentUser, location.state?.roomId, setCurrentUser])

    useEffect(() => {
        if (status === UserStatus.DISCONNECTED && !socket.connected) {
            socket.connect()
            return
        }
        if (status === UserStatus.JOINED) {
            navigate(`/editor/${currentUser.roomId}`, {
                state: { username: currentUser.username },
            })
        }
    }, [currentUser, navigate, socket, status])

    return (
        <div className="flex w-full max-w-lg flex-col items-center justify-center gap-6 p-6 sm:p-10 bg-darkHover rounded-lg shadow-md">
            <h1 className="text-4xl font-bold text-primary mb-2">🚀 Code Editor</h1>
            <p className="text-gray-300 text-center">Code, Chat, Collaborate in Real Time</p>

            <form onSubmit={joinRoom} className="w-full flex flex-col gap-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Your Name</label>
                    <input
                        type="text"
                        name="username"
                        placeholder="Enter your name"
                        className="w-full rounded-md border border-gray-600 bg-dark p-3 text-white focus:outline-primary"
                        onChange={handleInputChanges}
                        value={currentUser.username}
                        ref={usernameRef}
                    />
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-1">Project ID</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            name="roomId"
                            placeholder="Enter or generate a Project ID"
                            className="flex-grow rounded-md border border-gray-600 bg-dark p-3 text-white focus:outline-primary"
                            onChange={handleInputChanges}
                            value={currentUser.roomId}
                        />
                        <button
                            type="button"
                            onClick={createNewRoomId}
                            className="px-3 py-2 bg-primary text-black rounded-md font-semibold"
                        >
                            New
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-1">Project Name (Optional)</label>
                    <input
                        type="text"
                        name="projectname"
                        placeholder="E.g. Real-time Editor"
                        className="w-full rounded-md border border-gray-600 bg-dark p-3 text-white focus:outline-primary"
                    />
                </div>

                {/* <div>
                    <label className="block text-sm text-gray-400 mb-1">Add Developers (Optional)</label>
                    <input
                        type="text"
                        name="projectrights"
                        placeholder="E.g. dev1@example.com, dev2@example.com"
                        className="w-full rounded-md border border-gray-600 bg-dark p-3 text-white focus:outline-primary"
                    />
                </div> */}

                <button
                    type="submit"
                    className="w-full rounded-md bg-primary px-8 py-3 text-lg font-semibold text-black mt-2 hover:bg-opacity-90 transition-all"
                >
                    Join Room
                </button>
            </form>
        </div>
    )
}

export default FormComponent
