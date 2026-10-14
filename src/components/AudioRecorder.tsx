import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Volume2, AlertCircle } from 'lucide-react';
import { AttachedFile } from '../types/forensics';

interface AudioRecorderProps {
  onAudioReady: (file: AttachedFile) => void;
  onRemove: () => void;
  existingAudio?: AttachedFile | null;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onAudioReady,
  onRemove,
  existingAudio,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = (reader.result as string).split(',')[1];
          const previewUrl = URL.createObjectURL(audioBlob);
          const attached: AttachedFile = {
            id: `audio-rec-${Date.now()}`,
            name: `Recorded_HR_Call_${new Date().toLocaleTimeString().replace(/:/g, '-')}.webm`,
            type: 'audio',
            mimeType: 'audio/webm',
            base64: base64Data,
            previewUrl,
            sizeBytes: audioBlob.size,
          };
          onAudioReady(attached);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordDuration(0);

      timerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setErrorMsg('Microphone permission denied or device not found.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
          <Volume2 className="w-4 h-4 text-cyan-400" />
          <span>HR Call &amp; Voice Note Forensic Audio</span>
        </div>
        <span className="text-[11px] text-slate-400">English / Hindi / Hinglish</span>
      </div>

      {errorMsg && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 p-2 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {existingAudio ? (
        <div className="flex items-center justify-between rounded-lg bg-slate-800/80 border border-slate-700 p-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlayback}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors shadow-md"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <div className="text-left">
              <div className="text-xs font-medium text-slate-200 truncate max-w-[200px]">
                {existingAudio.name}
              </div>
              <div className="text-[10px] text-slate-400">
                Ready for AI Voice Transcription &amp; Psychological Analysis
              </div>
            </div>
            {existingAudio.previewUrl && (
              <audio
                ref={audioPlayerRef}
                src={existingAudio.previewUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            )}
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-rose-400 transition-colors"
            title="Remove audio"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {isRecording ? (
            <div className="flex items-center justify-between w-full rounded-lg bg-rose-950/40 border border-rose-500/40 p-3 animate-pulse">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                <span className="text-sm font-mono font-bold text-rose-200">
                  Recording Call... {formatTime(recordDuration)}
                </span>
              </div>
              <button
                type="button"
                onClick={stopRecording}
                className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-500 transition-colors shadow-lg"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Finish &amp; Attach</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center justify-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-950/30 px-4 py-2.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-400 transition-all w-full sm:w-auto shadow-sm"
            >
              <Mic className="w-4 h-4 text-cyan-400" />
              <span>Record Suspicious HR Call / Voice Note</span>
            </button>
          )}

          <span className="text-xs text-slate-400 hidden sm:inline">or</span>

          {/* Direct File input for audio */}
          <label className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-700/60 hover:text-white transition-all cursor-pointer w-full sm:w-auto">
            <span>Upload Call Audio (.mp3, .wav, .m4a)</span>
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onloadend = () => {
                  const base64Data = (reader.result as string).split(',')[1];
                  const previewUrl = URL.createObjectURL(file);
                  onAudioReady({
                    id: `audio-${Date.now()}`,
                    name: file.name,
                    type: 'audio',
                    mimeType: file.type || 'audio/mp3',
                    base64: base64Data,
                    previewUrl,
                    sizeBytes: file.size,
                  });
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>
        </div>
      )}
    </div>
  );
};
