import {
  MusicIcon,
  ThumbsUpIcon,
  UserCheckIcon,
  Volume2Icon,
} from "lucide-react";
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
          <div className="pr-4">
            <MusicIcon size={28} strokeWidth={1.8} />
          </div>
          <span className="direction-text">
            Listen to the audio segment, then find the correct artist & title in
            the list.
          </span>
        </div>
        <div className="direction flex text-left items-center py-3">
          <div className="pr-4">
            <Volume2Icon size={28} strokeWidth={1.8} />
          </div>
          <span className="direction-text">
            Skipped or incorrect attempts unlock more of the audio segment
          </span>
        </div>
        <div className="direction flex text-left items-center py-3">
          <div className="pr-4">
            <ThumbsUpIcon size={28} strokeWidth={1.8} />
          </div>
          <span className="direction-text">
            Answer in as few tries as possible and share your score!
          </span>
        </div>
        <div className="direction flex text-left items-center py-3">
          <div className="pr-4">
            <UserCheckIcon size={28} strokeWidth={1.8} />
          </div>
          <span className="direction-text">
            Create an account to sync your game data to the cloud and across
            multiple devices
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
