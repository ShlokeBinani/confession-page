import React, { useRef, useState } from 'react';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete }) => {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    chunks.current = [];

    mediaRecorder.current.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.current.push(e.data);
    };

    mediaRecorder.current.onstop = () => {
      const blob = new Blob(chunks.current, { type: 'audio/webm' });
      setAudioUrl(URL.createObjectURL(blob));
      onRecordingComplete(blob);
      stream.getTracks().forEach((track) => track.stop());
    };

    mediaRecorder.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setRecording(false);
  };

  const deleteAudio = () => {
    setAudioUrl(null);
    onRecordingComplete(null as any); // Clear in parent
  };

  return (
    <div>
      <div className="flex items-center space-x-4">
        {!recording && !audioUrl && (
          <button type="button" onClick={startRecording} className="btn-primary">
            Start Recording
          </button>
        )}
        {recording && (
          <button type="button" onClick={stopRecording} className="btn-secondary">
            Stop Recording
          </button>
        )}
        {audioUrl && (
          <>
            <audio controls src={audioUrl} />
            <button type="button" onClick={deleteAudio} className="btn-secondary">
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
