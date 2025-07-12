import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import illustration from "@/assets/illustration.svg";

function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center">
            <div className="relative w-full max-w-sm bg-gray-900 text-white rounded-lg shadow-lg p-6 animate-fadeIn">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-400 transition"
                >
                    ✖
                </button>
                {children}
            </div>
        </div>
    );
}

function WebPage() {
    const navigate = useNavigate();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isSignupOpen, setIsSignupOpen] = useState(false);
    const [visibleText, setVisibleText] = useState("");
    const [isTextComplete, setIsTextComplete] = useState(false);

    const words = [
        "Welcome to Ben Code, your collaborative coding platform",
        "",
        "designed for developers, team leads, and project managers.",
        "Empowering teams to efficiently achieve coding goals.",
        "Whether you're coding solo or managing teams—",
        "Ben Code is your complete solution."
    ];

    useEffect(() => {
        let wordIndex = 0;
        const interval = setInterval(() => {
            setVisibleText(prev =>
                prev ? `${prev} ${words[wordIndex]}` : words[wordIndex]
            );
            wordIndex++;
            if (wordIndex === words.length) {
                clearInterval(interval);
                setIsTextComplete(true);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const toggleLogin = () => setIsLoginOpen(!isLoginOpen);
    const toggleSignup = () => setIsSignupOpen(!isSignupOpen);
    const handleLogin = (e) => {
        e.preventDefault();
        navigate("/join");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] text-white font-sans">
            {/* Header */}
            <div className="fixed top-0 right-0 p-4">
                <button
                    onClick={toggleLogin}
                    className="text-white font-semibold hover:text-primary transition"
                >
                    Login / Signup
                </button>
            </div>

            {/* Main Section */}
            <div className="flex flex-col md:flex-row justify-center items-center gap-10 pt-20 px-4 md:px-16">
                {/* Illustration */}
                <div className="w-full md:w-1/2 flex justify-center animate-float">
                    <img
                        src={illustration}
                        alt="CodeHub Illustration"
                        className="max-w-[400px] md:max-w-[600px]"
                    />
                </div>

                {/* Text Content */}
                <div className="w-full md:w-1/2 flex flex-col items-center text-center gap-6">
                    <h1 className="text-5xl font-bold text-primary">Ben Code</h1>
                    <p className="text-lg text-gray-300 px-2 leading-relaxed">
                        {isTextComplete
                            ? "Welcome to Ben Code, your collaborative coding platform designed for developers, team leads, and project managers. Empowering teams to efficiently achieve their goals, whether solo or in collaboration."
                            : visibleText}
                    </p>
                </div>
            </div>

            {/* Login Modal */}
            <Modal isOpen={isLoginOpen} onClose={toggleLogin}>
                <h2 className="text-2xl font-semibold mb-4 text-center text-primary">Login to Ben Code</h2>
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Username"
                        className="w-full p-3 rounded bg-gray-800 text-white focus:outline-primary border border-gray-600"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-3 rounded bg-gray-800 text-white focus:outline-primary border border-gray-600"
                    />
                    <button
                        type="submit"
                        className="bg-primary hover:bg-red-600 text-white font-semibold py-2 rounded transition"
                    >
                        Login
                    </button>
                    <p className="text-sm text-center mt-2">
                        Don’t have an account?{" "}
                        <span
                            onClick={() => {
                                toggleLogin();
                                toggleSignup();
                            }}
                            className="text-blue-400 hover:underline cursor-pointer"
                        >
                            Sign Up
                        </span>
                    </p>
                </form>
            </Modal>

            {/* Sign-Up Modal */}
            <Modal isOpen={isSignupOpen} onClose={toggleSignup}>
                <h2 className="text-2xl font-semibold mb-4 text-center text-green-400">Create your account</h2>
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-3 rounded bg-gray-800 text-white focus:outline-primary border border-gray-600"
                    />
                    <input
                        type="text"
                        placeholder="Username"
                        className="w-full p-3 rounded bg-gray-800 text-white focus:outline-primary border border-gray-600"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-3 rounded bg-gray-800 text-white focus:outline-primary border border-gray-600"
                    />
                    <button
                        type="submit"
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded transition"
                    >
                        Sign Up
                    </button>
                </form>
            </Modal>
        </div>
    );
}

export default WebPage;
