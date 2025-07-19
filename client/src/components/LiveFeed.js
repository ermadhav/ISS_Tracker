import React from "react";

const LiveFeed = () => {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <iframe
        width="100%"
        height="100%"
        src="https://www.youtube.com/embed/86YLFOog4GM?autoplay=1&mute=1"
        title="Live ISS Earth View"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default LiveFeed;
