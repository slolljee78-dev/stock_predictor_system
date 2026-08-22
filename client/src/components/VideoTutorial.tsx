import React from 'react';
import { Play } from 'lucide-react';

interface VideoTutorialProps {
  title: string;
  description: string;
  videoId: string; // YouTube video ID
  duration?: string; // e.g., "5:32"
}

export function VideoTutorial({
  title,
  description,
  videoId,
  duration,
}: VideoTutorialProps) {
  return (
    <div className="space-y-3">
      <div className="relative w-full bg-black rounded-lg overflow-hidden aspect-video">
        {/* Placeholder for video - in production would use YouTube embed */}
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
          <div className="text-center space-y-2">
            <Play className="h-12 w-12 text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">
              YouTube Video: {videoId}
            </p>
            {duration && (
              <p className="text-xs text-muted-foreground">Duration: {duration}</p>
            )}
          </div>
        </div>

        {/* Duration badge */}
        {duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-medium text-white">
            {duration}
          </div>
        )}
      </div>

      <div>
        <h4 className="font-semibold text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}

interface VideoPlaylistProps {
  title: string;
  description?: string;
  videos: VideoTutorialProps[];
}

export function VideoPlaylist({
  title,
  description,
  videos,
}: VideoPlaylistProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {videos.map((video, index) => (
          <VideoTutorial key={index} {...video} />
        ))}
      </div>
    </div>
  );
}
