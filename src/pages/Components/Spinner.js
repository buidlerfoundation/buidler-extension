import React from 'react';

const Spinner = ({ width = 30, height = 30 }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ width, height }} className="buidler-progress-root">
        <svg viewBox="22 22 44 44">
          <circle
            cx="44"
            cy="44"
            r="20.2"
            fill="none"
            strokeWidth="3.6"
            className="buidler-progress"
          />
        </svg>
      </span>
    </div>
  );
};

export default Spinner;
