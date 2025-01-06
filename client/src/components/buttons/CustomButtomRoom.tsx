import React from "react";

interface IProps {
  onClick: () => void;
  icon: any;
  info?: string;
}

const CustomButtomRoom = ({ onClick, icon, info }: IProps) => {
  return (
    <>
      <button
        onClick={onClick}
        type='button'
        data-tooltip-target="tooltip-default"
        className="bg-rose-400 p-4 rounded-lg text-xl hover:bg-rose-600 text-white"
      >
        {icon}
      </button>
      <div
        id="tooltip-default"
        role="tooltip"
        className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
      >
        {info}
        <div className="tooltip-arrow" data-popper-arrow></div>
      </div>
    </>
  );
};

export default CustomButtomRoom;
