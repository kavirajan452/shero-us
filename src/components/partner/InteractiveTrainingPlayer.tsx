import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Play, Pause, CheckCircle2, XCircle, AlertTriangle,
  ChevronRight, RotateCcw, Award, BookOpen, ArrowLeft
} from "lucide-react";
import TrainingCertificate from "./TrainingCertificate";

/* ─── Types ─── */
export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface Checkpoint {
  /** Time in seconds when the video pauses */
  timeSeconds: number;
  /** Label for the segment leading up to this checkpoint */
  segmentLabel: string;
  quiz: QuizQuestion;
}

export interface InteractiveTrainingConfig {
  title: string;
  videoSrc: string;
  /** Sorted by timeSeconds ascending */
  checkpoints: Checkpoint[];
}

interface Props {
  config: InteractiveTrainingConfig;
  onComplete?: () => void;
  onBack?: () => void;
}

/* ─── Component ─── */
export default function InteractiveTrainingPlayer({ config, onComplete, onBack }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Checkpoint gating
  const [currentCheckpointIdx, setCurrentCheckpointIdx] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerResult, setAnswerResult] = useState<"correct" | "wrong" | null>(null);
  const [passedCheckpoints, setPassedCheckpoints] = useState<Set<number>>(new Set());
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const checkpoints = config.checkpoints;
  const totalCheckpoints = checkpoints.length;

  // ── Time update handler: pause at next checkpoint ──
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);

    // Find the next un-passed checkpoint
    const nextIdx = checkpoints.findIndex((_, i) => !passedCheckpoints.has(i));
    if (nextIdx === -1) return; // all passed

    const cp = checkpoints[nextIdx];
    if (video.currentTime >= cp.timeSeconds && !showQuiz) {
      video.pause();
      setIsPlaying(false);
      setCurrentCheckpointIdx(nextIdx);
      setShowQuiz(true);
      setSelectedAnswer(null);
      setAnswerResult(null);
      setWrongAttempts(0);
    }
  }, [checkpoints, passedCheckpoints, showQuiz]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [handleTimeUpdate]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    if (passedCheckpoints.size === totalCheckpoints) {
      setCompleted(true);
      onComplete?.();
    }
  };

  // ── Controls ──
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || showQuiz) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const startTraining = () => {
    setShowIntro(false);
    const video = videoRef.current;
    if (video) {
      video.play();
      setIsPlaying(true);
    }
  };

  // ── Quiz submission ──
  const submitAnswer = () => {
    if (selectedAnswer === null) return;
    const cp = checkpoints[currentCheckpointIdx];
    const correct = parseInt(selectedAnswer) === cp.quiz.correctIndex;

    if (correct) {
      setAnswerResult("correct");
      setTimeout(() => {
        setPassedCheckpoints((prev) => new Set([...prev, currentCheckpointIdx]));
        setShowQuiz(false);
        setAnswerResult(null);
        // Auto-play to next segment
        const video = videoRef.current;
        if (video) {
          video.play();
          setIsPlaying(true);
        }
      }, 1800);
    } else {
      setAnswerResult("wrong");
      setWrongAttempts((p) => p + 1);
    }
  };

  const retryQuestion = () => {
    setSelectedAnswer(null);
    setAnswerResult(null);
  };

  const rewindAndRewatch = () => {
    const video = videoRef.current;
    if (!video) return;
    // Rewind to start of the current segment
    const prevCpTime = currentCheckpointIdx > 0 ? checkpoints[currentCheckpointIdx - 1].timeSeconds : 0;
    video.currentTime = prevCpTime;
    setShowQuiz(false);
    setAnswerResult(null);
    setSelectedAnswer(null);
    video.play();
    setIsPlaying(true);
  };

  const progressPct = totalCheckpoints > 0 ? (passedCheckpoints.size / totalCheckpoints) * 100 : 0;

  // ── Intro screen ──
  if (showIntro) {
    return (
      <div className="space-y-4">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-xs">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Training
          </Button>
        )}
        <Card className="border-primary/30 overflow-hidden">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{config.title}</h2>
                <p className="text-xs text-muted-foreground">Interactive Training Module</p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                How This Training Works
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="shrink-0 mt-0.5 text-[10px] font-mono w-5 h-5 flex items-center justify-center p-0 rounded-full">1</Badge>
                  <span>The video will play in <strong>{totalCheckpoints} segments</strong>. Watch each segment carefully.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="shrink-0 mt-0.5 text-[10px] font-mono w-5 h-5 flex items-center justify-center p-0 rounded-full">2</Badge>
                  <span>After each segment, the video <strong>pauses automatically</strong> and a quiz question appears.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="shrink-0 mt-0.5 text-[10px] font-mono w-5 h-5 flex items-center justify-center p-0 rounded-full">3</Badge>
                  <span>You must <strong>answer correctly</strong> to proceed to the next segment. Wrong answers let you rewatch & retry.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="shrink-0 mt-0.5 text-[10px] font-mono w-5 h-5 flex items-center justify-center p-0 rounded-full">4</Badge>
                  <span>Complete all {totalCheckpoints} checkpoints to <strong>earn your completion badge</strong>.</span>
                </li>
              </ul>
            </div>

            {/* Checkpoint preview */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Checkpoint Roadmap</p>
              <div className="flex items-center gap-1 flex-wrap">
                {checkpoints.map((cp, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="text-[10px] px-2 py-1 rounded-full bg-muted text-muted-foreground border">
                      {cp.segmentLabel}
                    </div>
                    {i < checkpoints.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground/50" />}
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={startTraining} className="w-full gap-2">
              <Play className="w-4 h-4" />
              Start Interactive Training
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Completion screen with certificate ──
  if (completed) {
    const certId = `SH-${Date.now().toString(36).toUpperCase()}`;
    return (
      <div className="space-y-4">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-xs">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Training
          </Button>
        )}
        <div className="text-center space-y-1 pt-2">
          <h2 className="text-xl font-bold text-foreground">Training Complete! 🎉</h2>
          <p className="text-sm text-muted-foreground">
            You've passed all {totalCheckpoints} checkpoints. Here's your certificate!
          </p>
        </div>
        <TrainingCertificate
          partnerName="Shero Partner"
          trainingTitle={config.title}
          completionDate={new Date()}
          checkpointsPassed={totalCheckpoints}
          certificateId={certId}
        />
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={onBack} className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back to Training
          </Button>
        </div>
      </div>
    );
  }

  // ── Main player ──
  return (
    <div className="space-y-4">
      {onBack && (
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-xs">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Training
        </Button>
      )}

      {/* Progress bar */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-foreground">{config.title}</span>
            <Badge variant="secondary" className="text-[10px]">
              {passedCheckpoints.size} / {totalCheckpoints} checkpoints passed
            </Badge>
          </div>
          <Progress value={progressPct} className="h-2" />
          {/* Checkpoint dots */}
          <div className="flex items-center gap-1 mt-2">
            {checkpoints.map((cp, i) => (
              <div key={i} className="flex items-center gap-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                    passedCheckpoints.has(i)
                      ? "bg-green-100 border-green-500 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-400"
                      : currentCheckpointIdx === i && showQuiz
                      ? "bg-amber-100 border-amber-500 text-amber-700 dark:bg-amber-900/30 dark:border-amber-600 dark:text-amber-400 animate-pulse"
                      : "bg-muted border-border text-muted-foreground"
                  }`}
                >
                  {passedCheckpoints.has(i) ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                </div>
                {i < checkpoints.length - 1 && (
                  <div className={`w-4 h-0.5 ${passedCheckpoints.has(i) ? "bg-green-400" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Video */}
      <Card className="overflow-hidden">
        <div className="relative bg-black">
          <video
            ref={videoRef}
            src={config.videoSrc}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleVideoEnd}
            className="w-full aspect-video"
            playsInline
          />
          {/* Play/Pause overlay */}
          {!showQuiz && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors group"
            >
              {!isPlaying && (
                <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 text-primary-foreground ml-1" />
                </div>
              )}
            </button>
          )}

          {/* Quiz overlay */}
          {showQuiz && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <Card className="w-full max-w-lg mx-auto shadow-2xl border-primary/30">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-0 text-[10px]">
                      Checkpoint {currentCheckpointIdx + 1} of {totalCheckpoints}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {checkpoints[currentCheckpointIdx].segmentLabel}
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm text-foreground">
                    {checkpoints[currentCheckpointIdx].quiz.question}
                  </h3>

                  {answerResult === "correct" ? (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                      <CheckCircle2 className="w-8 h-8 text-green-600 shrink-0" />
                      <div>
                        <p className="font-semibold text-green-800 dark:text-green-300 text-sm">Correct! ✨</p>
                        {checkpoints[currentCheckpointIdx].quiz.explanation && (
                          <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
                            {checkpoints[currentCheckpointIdx].quiz.explanation}
                          </p>
                        )}
                        <p className="text-[10px] text-green-600 dark:text-green-500 mt-1">Proceeding to next segment…</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <RadioGroup value={selectedAnswer ?? ""} onValueChange={setSelectedAnswer}>
                        {checkpoints[currentCheckpointIdx].quiz.options.map((opt, oi) => (
                          <div
                            key={oi}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                              answerResult === "wrong" && selectedAnswer === String(oi)
                                ? "border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20"
                                : selectedAnswer === String(oi)
                                ? "border-primary bg-primary/5"
                                : "hover:bg-muted/50"
                            }`}
                          >
                            <RadioGroupItem value={String(oi)} id={`opt-${oi}`} disabled={answerResult === "wrong"} />
                            <Label htmlFor={`opt-${oi}`} className="text-sm cursor-pointer flex-1">
                              {opt}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>

                      {answerResult === "wrong" && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                          <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                          <div className="text-xs text-red-700 dark:text-red-400">
                            <p className="font-medium">Incorrect answer. {wrongAttempts >= 2 ? "Try rewatching the segment for clarity." : "Think carefully and try again."}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {answerResult === "wrong" ? (
                          <>
                            <Button size="sm" variant="outline" onClick={retryQuestion} className="gap-1.5 text-xs flex-1">
                              <RotateCcw className="w-3 h-3" /> Try Again
                            </Button>
                            {wrongAttempts >= 2 && (
                              <Button size="sm" variant="secondary" onClick={rewindAndRewatch} className="gap-1.5 text-xs flex-1">
                                <Play className="w-3 h-3" /> Rewatch Segment
                              </Button>
                            )}
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={submitAnswer}
                            disabled={selectedAnswer === null}
                            className="gap-1.5 text-xs w-full"
                          >
                            Submit Answer <ChevronRight className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Video controls bar */}
        <div className="px-4 py-2 bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
          <button onClick={togglePlay} disabled={showQuiz} className="flex items-center gap-1.5 hover:text-foreground disabled:opacity-50">
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? "Pause" : "Play"}
          </button>
          <span>
            {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, "0")} / {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, "0")}
          </span>
        </div>
      </Card>
    </div>
  );
}
