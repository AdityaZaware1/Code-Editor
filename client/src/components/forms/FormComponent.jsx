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
        const newId = uuidv4()
        setCurrentUser({ ...currentUser, roomId: newId })
        toast.success("Generated a new Room ID")
        usernameRef.current?.focus()
    }

    const CreateProject = () => {
        navigate('/create')
    }

    const handleInputChanges = (e) => {
        const { name, value } = e.target
        setCurrentUser(prev => ({ ...prev, [name]: value }))
    }

    const validateForm = () => {
        if (!currentUser.username || currentUser.username.trim().length < 3) {
            toast.error("Username must be at least 3 characters long")
            return false
        }
        if (!currentUser.roomId || currentUser.roomId.trim().length < 5) {
            toast.error("Project ID must be at least 5 characters")
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
        if (!currentUser.roomId && location.state?.roomId) {
            setCurrentUser(prev => ({
                ...prev,
                roomId: location.state.roomId,
            }))
            if (!currentUser.username) {
                toast.success("Enter your username")
            }
        }
    }, [location.state?.roomId])

    useEffect(() => {
        if (status === UserStatus.DISCONNECTED && !socket.connected) {
            socket.connect()
        }
        if (status === UserStatus.JOINED) {
            const { username, roomId } = currentUser
            navigate(`/editor/${roomId}`, { state: { username } })
        }
    }, [status])

    return (
        <div className="flex w-full max-w-md flex-col items-center justify-center gap-6 p-6 sm:p-10 bg-darkHover rounded-lg shadow-md">
            <h1 className="text-4xl font-bold text-primary">Code Editor</h1>
            <p className="text-gray-300 text-center">Code, Chat, Collaborate!</p>

            <form onSubmit={joinRoom} className="w-full flex flex-col gap-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Your Name</label>
                    <input
                        type="text"
                        name="username"
                        placeholder="Enter your name"
                        className="w-full rounded-md border border-gray-600 bg-dark p-3 text-white focus:outline-primary"
                        onChange={handleInputChanges}
                        value={currentUser.username || ""}
                        ref={usernameRef}
                    />
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-1">Project ID</label>
                    <input
                        type="text"
                        name="roomId"
                        placeholder="Enter or generate Project ID"
                        className="w-full rounded-md border border-gray-600 bg-dark p-3 text-white focus:outline-primary"
                        onChange={handleInputChanges}
                        value={currentUser.roomId || ""}
                    />
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-1">Password (Optional)</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        className="w-full rounded-md border border-gray-600 bg-dark p-3 text-white focus:outline-primary"
                        onChange={handleInputChanges}
                        value={currentUser.password || ""}
                    />
                </div>

                <button
                    type="submit"
                    className="mt-2 w-full rounded-md bg-primary px-8 py-3 text-lg font-semibold text-black hover:bg-opacity-90 transition-all"
                >
                    Join Room
                </button>
            </form>

            <div className="flex flex-col items-center gap-2 mt-4 text-sm">
                {/* <button onClick={createNewRoomId} className="text-blue-400 hover:underline">
                    🔄 Generate Random Room ID
                </button> */}
                <button onClick={CreateProject} className="text-blue-400 hover:underline">
                    ✨ Create New Project
                </button>
            </div>
        </div>
    )
}

export default FormComponent
