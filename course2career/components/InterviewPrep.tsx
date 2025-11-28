
import React, { useState, useRef } from 'react';
import { getInterviewQuestions, getVerbalAnswerFeedbackWithAI } from '../services/geminiService';
import { GraduationCapIcon } from './icons/GraduationCapIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { StopIcon } from './icons/StopIcon';
import { blobToBase64 } from '../utils';
import MarkdownRenderer from './MarkdownRenderer';

interface InterviewPrepProps {
  onClose: () => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center space-x-2">
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
        <span className="text-gray-600 text-sm">AI is thinking...</span>
    </div>
);


const InterviewPrep: React.FC<InterviewPrepProps> = ({ onClose }) => {
  const [jobRole, setJobRole] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<{ index: number; text: string } | null>(null);
  
  const [feedback, setFeedback] = useState('');

  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const resetPracticeState = () => {
    setFeedback('');
    setAudioBlob(null);
    setAudioUrl(null);
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
    }
  };

  const handleGetQuestions = async () => {
    if (!jobRole.trim()) {
      setError('Please enter a job role.');
      return;
    }
    setError(null);
    setIsLoadingQuestions(true);
    setQuestions([]);
    setSelectedQuestion(null);
    resetPracticeState();
    try {
      const fetchedQuestions = await getInterviewQuestions(jobRole);
      setQuestions(fetchedQuestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleSelectQuestion = (index: number) => {
    setSelectedQuestion({ index, text: questions[index] });
    resetPracticeState();
  };

  const handleStartRecording = async () => {
    if (isRecording) return;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            setAudioBlob(blob);
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
            stream.getTracks().forEach(track => track.stop()); // Stop microphone access
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        setAudioBlob(null);
        setAudioUrl(null);
        setFeedback('');

    } catch (err) {
        console.error("Error accessing microphone:", err);
        setError("Could not access microphone. Please ensure you have given permission in your browser settings.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
    }
  };

  const handleAnalyzeAnswer = async () => {
    if (!selectedQuestion || !audioBlob) {
      setError('Please record your answer before analyzing.');
      return;
    }
    setError(null);
    setIsLoadingFeedback(true);
    setFeedback('');
    try {
      const audioBase64 = await blobToBase64(audioBlob);
      const fetchedFeedback = await getVerbalAnswerFeedbackWithAI(selectedQuestion.text, jobRole, audioBase64, audioBlob.type);
      setFeedback(fetchedFeedback);
    } catch (err) {
       setError(err instanceof Error ? err.message : 'An unknown error occurred analyzing your answer.');
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] m-4 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-secondary rounded-t-lg">
          <div className="flex items-center">
            <GraduationCapIcon className="h-7 w-7 text-primary" />
            <h3 className="ml-3 text-xl font-bold text-gray-900">AI Mock Interview</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="text"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="Enter a job role (e.g., 'Software Engineer')"
              className="flex-grow w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              disabled={isLoadingQuestions}
            />
            <button
              onClick={handleGetQuestions}
              disabled={isLoadingQuestions || !jobRole.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-focus disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoadingQuestions ? 'Generating...' : 'Get Questions'}
            </button>
          </div>
          {error && <p className="mt-2 text-center text-red-600">{error}</p>}
        </div>

        <div className="flex-grow flex overflow-hidden">
          {/* Questions List */}
          <div className="w-1/3 border-r overflow-y-auto p-4 space-y-2 bg-gray-50">
            {isLoadingQuestions && <div className="text-center p-4"> <LoadingSpinner/> </div>}
            {questions.length > 0 ? (
                questions.map((q, i) => (
                <button
                    key={i}
                    onClick={() => handleSelectQuestion(i)}
                    className={`w-full text-left p-3 rounded-md transition-colors text-sm ${selectedQuestion?.index === i ? 'bg-primary text-white shadow' : 'hover:bg-gray-200'}`}
                >
                    {i + 1}. {q}
                </button>
                ))
            ) : (
                !isLoadingQuestions && <p className="text-sm text-gray-500 text-center p-4">Enter a job role to generate interview questions.</p>
            )}
          </div>

          {/* Details Pane */}
          <div className="w-2/3 overflow-y-auto p-6 space-y-6">
            {!selectedQuestion ? (
              <div className="text-center text-gray-500 pt-10">
                <p>Select a question from the left to start your mock interview.</p>
              </div>
            ) : (
              <div>
                <h4 className="font-bold text-lg text-gray-800">{selectedQuestion.text}</h4>
                <div className="mt-4 space-y-6">
                  {/* Practice Section */}
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <h5 className="font-semibold text-gray-700 mb-3">Practice Your Answer Verbally:</h5>
                    <div className="flex flex-col items-center gap-4">
                      {!isRecording ? (
                         <button onClick={handleStartRecording} className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition-colors">
                            <MicrophoneIcon className="w-6 h-6" />
                            Start Recording
                        </button>
                      ) : (
                        <button onClick={handleStopRecording} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition-colors animate-pulse">
                            <StopIcon className="w-6 h-6" />
                            Stop Recording
                        </button>
                      )}
                      {audioUrl && (
                        <div className="w-full text-center">
                            <p className="text-sm font-medium text-gray-600 mb-2">Listen to your answer:</p>
                            <audio src={audioUrl} controls className="w-full max-w-sm mx-auto" />
                        </div>
                      )}
                    </div>
                    
                     <button
                      onClick={handleAnalyzeAnswer}
                      disabled={isLoadingFeedback || !audioBlob || isRecording}
                      className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-focus disabled:bg-gray-400"
                    >
                      <SparklesIcon className="mr-2 h-4 w-4" />
                      {isLoadingFeedback ? 'Analyzing...' : 'Get AI Feedback on My Answer'}
                    </button>
                  </div>
                  
                  {/* Feedback Section */}
                  {isLoadingFeedback && <LoadingSpinner />}
                  {feedback && !isLoadingFeedback && (
                    <div>
                      <h5 className="font-semibold text-gray-700">AI Feedback:</h5>
                      <div className="mt-2 p-4 bg-blue-50 border-l-4 border-primary text-gray-800 rounded-r-lg">
                        <MarkdownRenderer text={feedback} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPrep;
