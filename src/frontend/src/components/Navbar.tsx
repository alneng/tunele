import React from "react";
import {
  ChartNoAxesColumnIcon,
  CircleHelpIcon,
  GithubIcon,
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
  const navbarItems = {
    left: [
      {
        icon: PenLineIcon,
        title: "Custom Playlist",
        onClick: () => (window.location.href = "/custom"),
      },
      {
        icon: GithubIcon,
        title: "GitHub",
        onClick: () =>
          window.open("https://github.com/alneng/tunele", "_blank"),
      },
    ],
    right: [
      {
        icon: UserIcon,
        title: "Account",
        onClick: () => setUAModel(true),
      },
      {
        icon: ChartNoAxesColumnIcon,
        title: "Stats",
        onClick: () => setStatsModal(true),
      },
      {
        icon: CircleHelpIcon,
        title: "Help",
        onClick: () => setHelpModal(true),
      },
    ],
  };

  return (
    <div className="absolute top-0 left-0 right-0 bg-[#131213] h-16 flex items-center justify-between border-b-2 border-white text-white">
      <div className="ml-4">
        {navbarItems.left.map((item, index) => (
          <button
            key={index}
            className="p-2 focus:outline-none"
            onClick={item.onClick}
            title={item.title}
          >
            <item.icon size={24} />
          </button>
        ))}
        <button
          className="p-2 focus:outline-none invisible"
          onClick={() => (window.location.href = "/privacy")}
          title="Privacy Policy"
        >
          <LockIcon size={24} />
        </button>
      </div>
      <a href="/">
        <img
          src="/tunele-transparent-bg.png"
          alt="Tunele"
          className="max-h-5"
        />
      </a>
      <div className="mr-4">
        {navbarItems.right.map((item, index) => (
          <button
            key={index}
            className="p-2 focus:outline-none"
            onClick={item.onClick}
            title={item.title}
          >
            <item.icon size={24} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Navbar;
