import React from "react";

interface HelpModalProps {
    onRequestCloseHelpModal: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onRequestCloseHelpModal }) => {
    return (
        <div>
            <div className="flex flex-col items-center mb-4">
                <h1 className="text-2xl font-bold">How to Play</h1>
            </div>
            <div>
                <div className="direction flex text-left items-center py-3">
                    <div className="icon pr-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="5.5" cy="17.5" r="2.5" />
                            <circle cx="17.5" cy="15.5" r="2.5" />
                            <path d="M8 17V5l12-2v12" />
                        </svg>
                    </div>
                    <span className="direction-text">
                        Listen to the audio segment, then find the correct
                        artist & title in the list.
                    </span>
                </div>
                <div className="direction flex text-left items-center py-3">
                    <div className="icon pr-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                        </svg>
                    </div>
                    <span className="direction-text">
                        Skipped or incorrect attempts unlock more of the audio
                        segment
                    </span>
                </div>
                <div className="direction flex text-left items-center py-3">
                    <div className="icon pr-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="28"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                        </svg>
                    </div>
                    <span className="direction-text">
                        Answer in as few tries as possible and share your score!
                    </span>
                </div>
                <div className="direction flex text-left items-center py-3">
                    <div className="icon pr-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="28"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="feather feather-user-check"
                        >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="8.5" cy="7" r="4"></circle>
                            <polyline points="17 11 19 13 23 9"></polyline>
                        </svg>
                    </div>
                    <span className="direction-text">
                        Create an account to sync your game data to the cloud
                        and across multiple devices
                    </span>
                </div>
            </div>
            <div>
                <button
                    onClick={onRequestCloseHelpModal}
                    className="mt-4 px-7 py-3 rounded-full bg-[#1fd660] text-black hover:bg-[#18b853] focus:outline-none font-semibold"
                >
                    Play
                </button>
            </div>
        </div>
    );
};

export default HelpModal;
