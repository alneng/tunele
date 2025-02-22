import React from "react";
import {
  ChartNoAxesColumnIcon,
  CircleHelpIcon,
  LockIcon,
  PenLineIcon,
  UserIcon,
} from "lucide-react";

interface NavbarProps {
  setHelpModal: (state: boolean) => void;
  setStatsModal: (state: boolean) => void;
  setUAModel: (state: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  setHelpModal,
  setStatsModal,
  setUAModel,
}) => {
  const redirectCustomPlaylist = () => {
    window.location.href = "./custom";
  };

  const redirectToGithub = () => {
    window.open("https://github.com/alneng/tunele", "_blank");
  };

  const redirectPrivacyPolicy = () => {
    window.location.href = "./privacy";
  };

  const handleShowUA = () => {
    setUAModel(true);
  };

  const handleShowStats = () => {
    setStatsModal(true);
  };

  const handleShowHelp = () => {
    setHelpModal(true);
  };

  return (
    <div className="absolute top-0 left-0 right-0 bg-[#131213] h-16 flex items-center justify-between border-b-2 border-white">
      <div className="ml-4">
        <button
          className="text-white p-2 focus:outline-none"
          onClick={redirectCustomPlaylist}
          title="Custom Playlist"
        >
          <PenLineIcon size={24} />
        </button>
        <button
          className="text-white p-2 focus:outline-none"
          onClick={redirectToGithub}
          title="GitHub"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-github"
          >
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
          </svg>
        </button>
        <button
          className="text-white p-2 focus:outline-none invisible"
          onClick={redirectPrivacyPolicy}
          title="Privacy Policy"
        >
          <LockIcon size={24} />
        </button>
      </div>
      <div className="text-white">
        <a href="/">
          <img
            src="/tunele-transparent-bg.png"
            alt="Tunele (logo)"
            className="max-h-5"
          />
        </a>
      </div>
      <div className="mr-4">
        <button
          className="text-white p-2 focus:outline-none"
          onClick={handleShowUA}
          title="Account"
        >
          <UserIcon size={24} />
        </button>
        <button
          className="text-white p-2 focus:outline-none"
          onClick={handleShowStats}
          title="Stats"
        >
          <ChartNoAxesColumnIcon size={24} />
        </button>
        <button
          className="text-white p-2 focus:outline-none"
          onClick={handleShowHelp}
          title="Help"
        >
          <CircleHelpIcon size={24} />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
