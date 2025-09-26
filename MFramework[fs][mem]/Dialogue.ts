import { AudioPlayer } from "./AudioPlayer";
import { Core } from "./Core";
import { DialogueLine } from "./GxtTime";
import { Timer } from "./Timer";

/** Manages dynamic dialogue sequences with audio, text display, and optional animations. */
export class Dialogue {

    private _voiceAudio: AudioPlayer;
    private _timer: Timer;
    private _lines: DialogueLine[];
    private _lineCount: int;
    private _currentLine: DialogueLine;
    private _currentLineIndex: int;
    private _speakingCondition: () => boolean;

    /** Gets the index of the current dialogue line. */
    public get currentLine(): int {
        return this._currentLineIndex;
    }


    /** Initializes a new dialogue sequence. */
    public constructor() {
        this._voiceAudio = new AudioPlayer(Core.ActiveMissionInfo.projectIndex, true);
        this._timer = new Timer();
        this._reset();
    }



    /**
     * Adds a new dialogue line to the sequence (must exist).
     * @param speaker - The character who speaks the line.
     * @param messageGxt - The GXT key of the message to display.
     * @param durationMs - The duration of the line in milliseconds.
     * @returns This dialogue instance for method chaining.
     */
    public addLine(speaker: Char, messageGxt: string, durationMs: int): Dialogue {
        this._lines.push(new DialogueLine(speaker, messageGxt, 1 > durationMs ? 1 : durationMs));
        this._lineCount += 1;
        return this;
    }

    /**
     * Adds a new dialogue line with an optional animation to the sequence.
     * @param speaker - The character who speaks the line (must exist).
     * @param messageGxt - The GXT key of the message to display.
     * @param durationMs - The duration of the line in milliseconds.
     * @param animationName - The name of the animation to play (default: "IDLE_chat").
     * @param animationFile - The IFP file containing the animation (must be loaded, default: "PED").
     * @returns This dialogue instance for method chaining.
     */
    public addLineWithAnimationSecondary(speaker: Char, messageGxt: string, durationMs: int, animationName: string = "IDLE_chat", animationFile: string = "PED"): Dialogue {
        durationMs = 1 > durationMs ? 1 : durationMs;
        this._lines.push(new DialogueLine(speaker, messageGxt, durationMs, animationName, animationFile));
        this._lineCount += 1;
        return this;
    }

    /**
     * Loads audio files for the dialogue.
     * @param skip - Number of tracks to skip (default: 0).
     * @param relativeProjectDirectory - The directory to scan for audio files (default: "").
     * @remarks Add dialogue lines before calling!
     */
    public loadVoiceAudio(skip: int = 0, relativeProjectDirectory: string = ""): void {
        this._voiceAudio.load(this._lineCount, skip, relativeProjectDirectory);
    }

    /** Resets the dialogue state, unloads all audio files, stops facial talk and animations. */
    public unload(): void {
        this._voiceAudio.unload();
        if (this._currentLine !== undefined) {
            this._currentLine.speaker.stopFacialTalk();
            if (this._currentLine.animationName !== undefined && this._currentLine.animationFile !== undefined)
                Task.PlayAnimSecondary(this._currentLine.speaker, this._currentLine.animationName, this._currentLine.animationFile, 4.0, false, false, false, false, 0);
        }
        this._reset();
    }

    /**
     * Sets a condition to determine if a dialogue line can be spoken.
     * @param condition - Callback function that returns true if a line can be spoken.
     */
    public setSpeakingCondition(condition: () => boolean): void {
        if (condition === undefined)
            return;
        this._speakingCondition = condition;
    }

    /**
     * Plays dialogue lines in sequence, displaing text, plays audio, manages timing, and playing animations.
     * @returns False if the dialogue has ended, true if it is still active.
     * @remarks Called `in a loop` to switch lines.
     */
    public perform(): boolean {
        if (this._isEnded())
            return false;
        if (!this._speakingCondition())
            return true;
        if (0 > this._currentLineIndex)
            return this._nextLine();
        const passedMilliseconds = this._timer.millisecondsPassed;
        if (!Text.IsMessageBeingDisplayed()) {
            const newTime = this._currentLine.duration - passedMilliseconds;
            Text.PrintNow(this._currentLine.gxt, newTime, 1);
        }
        if (this._voiceAudio.isPlaying || this._currentLine.duration >= passedMilliseconds)
            return true;
        this._currentLine.speaker.stopFacialTalk();
        return this._nextLine();
    }



    private _nextLine(): boolean {
        this._currentLineIndex += 1;
        if (this._lineCount > this._currentLineIndex) {
            this._currentLine = this._lines[this._currentLineIndex];
            Text.ClearPrints();
            this._timer.reset();
            this._currentLine.duration = this._voiceAudio.playNext(this._currentLine.duration);
            this._currentLine.speaker.startFacialTalk(this._currentLine.duration);
            if (this._currentLine.animationName !== undefined && this._currentLine.animationFile !== undefined)
                Task.PlayAnimSecondary(this._currentLine.speaker, this._currentLine.animationName, this._currentLine.animationFile, 4.0, false, false, false, false, this._currentLine.duration);
            return true;
        }
        return false;
    }

    private _reset(): void {
        this._lines = new Array<DialogueLine>();
        this._lineCount = 0;
        this._currentLine = undefined;
        this._currentLineIndex = -1;
        this._speakingCondition = () => { return true; };
    }

    private _isEnded(): boolean {
        return 1 > this._lineCount || this._currentLineIndex >= this._lineCount;
    }

}