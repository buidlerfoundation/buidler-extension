import React from 'react';

const IconMenuCloseCircle = ({ style }) => {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
    >
      <circle cx="12.5" cy="12.5" r="12.5" fill="var(--color-background-4)" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.4498 7.55036C17.0396 7.14023 16.3746 7.14028 15.9644 7.55048L12.5003 11.0146L9.10213 7.61648C8.692 7.20635 8.027 7.2064 7.6168 7.6166C7.2066 8.0268 7.20655 8.6918 7.61668 9.10193L11.0148 12.5001L7.5504 15.9645C7.1402 16.3747 7.14015 17.0397 7.55028 17.4499C7.96041 17.86 8.62542 17.8599 9.03561 17.4497L12.5 13.9853L15.8979 17.3831C16.308 17.7933 16.973 17.7932 17.3832 17.383C17.7934 16.9728 17.7935 16.3078 17.3833 15.8977L13.9855 12.4998L17.4497 9.03569C17.8598 8.62549 17.8599 7.96049 17.4498 7.55036Z"
        fill="#ffffff"
      />
    </svg>
  );
};

export default IconMenuCloseCircle;
