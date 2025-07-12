import PropTypes from "prop-types"
import { createContext, useState } from "react"
import UserStatus from "@/utils/status"

const AppContext = createContext()

function AppContextProvider({ children }) {
    const [users, setUsers] = useState([])
    const [status, setStatus] = useState(UserStatus.INITIAL)

    // ✅ Add password to currentUser state
    const [currentUser, setCurrentUser] = useState({
        username: "",
        roomId: "",
        password: "", // <-- Fix: include password here
    })

    return (
        <AppContext.Provider
            value={{
                users,
                setUsers,
                currentUser,
                setCurrentUser,
                status,
                setStatus,
            }}
        >
            {children}
        </AppContext.Provider>
    )
}

AppContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
}

export { AppContextProvider }
export default AppContext
