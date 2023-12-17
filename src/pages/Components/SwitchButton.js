import React, { useCallback, useEffect, useState } from "react";

const SwitchButton = ({ active, onChange, readonly }) => {
  const [isActive, setActive] = useState(false);
  useEffect(() => {
    setActive(active);
  }, [active]);
  const handleClick = useCallback(() => {
    if (readonly) return;
    onChange(!active);
  }, [active, onChange, readonly]);
  return (
    <div
      className={`switch-button__container ${
        isActive ? "switch-button-on" : ""
      }`}
      onClick={handleClick}
    >
      <div className="knob" />
    </div>
  );
};

export default SwitchButton;
