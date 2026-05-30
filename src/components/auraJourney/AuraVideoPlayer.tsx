import React, { useRef, useEffect } from 'react';

interface AuraVideoPlayerProps {
  src: string;
  playing: boolean;
  onPlayPause: () => void;
  onEnded: () => void;
  onNext: () => void;
  onPrev: () => void;
  onProgress: (current: number, duration: number) => void;
}

export const AuraVideoPlayer: React.FC<AuraVideoPlayerProps> = ({
  src,
  playing,
  onPlayPause,
  onEnded,
  onNext,
  onPrev,
  onProgress,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [playing, src]);

  return (
    <div className="cinema fixed inset-0 flex items-center justify-center z-20 bg-transparent">
      <div className="video-container relative w-full h-full flex items-center justify-center">
        <video
          ref={videoRef}
          className="main-video w-full h-full object-cover"
          src={src}
          onEnded={onEnded}
          onTimeUpdate={e => {
            const v = e.currentTarget;
            onProgress(v.currentTime, v.duration);
          }}
          playsInline
        />
        {/* Controls Overlay */}
        <div className="controls-overlay absolute bottom-12 left-0 right-0 flex items-center justify-center gap-8 z-30">
          <button className="control-btn" onClick={onPrev} title="Previous Scene">⏮</button>
          <button className="control-btn play-pause" onClick={onPlayPause} title="Play/Pause">{playing ? '⏸' : '▶'}</button>
          <button className="control-btn" onClick={onNext} title="Next Scene">⏭</button>
        </div>
      </div>
    </div>
  );
};
