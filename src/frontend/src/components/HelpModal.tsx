import React from "react";
import { MusicIcon, PenLineIcon, ThumbsUpIcon, Volume2Icon } from "lucide-react";

interface HelpModalProps {
  close: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ close }) => {
  const helpItems = [
    {
      icon: MusicIcon,
      text: "Listen to the audio segment, then find the correct artist & title in the list",
    },
    {
      icon: Volume2Icon,
      text: "Skipped or incorrect attempts unlock more of the audio segment",
    },
    {
      icon: ThumbsUpIcon,
      text: "Answer in as few tries as possible and share your score!",
    },
    {
      icon: PenLineIcon,
      text: "Bring a custom playlist to play with your own music",
    },
  ];

  return (
    <div>
      <div className="flex flex-col items-center mb-4">
        <h1 className="text-2xl font-bold">How to Play</h1>
      </div>
      <div>
        {helpItems.map((item, index) => (
          <div key={index} className="direction flex text-left items-center py-3">
            <div className="pr-4">
              <item.icon size={28} strokeWidth={1.8} />
            </div>
            <span className="direction-text">{item.text}</span>
          </div>
        ))}
      </div>
      <div>
        <button
          onClick={close}
          className="mt-4 px-7 py-3 rounded-full bg-[#1fd660] text-black hover:bg-[#18b853] focus:outline-none font-semibold"
        >
          Play
        </button>
      </div>
    </div>
  );
};

export default HelpModal;
