import { Core } from "./Core";

/** Manages loading and playback of audio streams from .mp3 files. */
export class AudioPlayer {

    private _projectIndex: int;
    private _audioStreams: AudioStream[];
    private _trackCount: int;
    private _currentTrackIndex: int;
    private _preserveAudioStreamType: boolean;
    private _volume: float;

    /** Gets whether the current audio stream is playing. */
    public get isPlaying(): boolean {
        if (this._hasCurrentTrack()) {
            const audioStream = this._audioStreams[this._currentTrackIndex];
            if (audioStream !== undefined)
                return audioStream.isPlaying();
        }
        return false;
    }



    /**
     * Initializes a new instance of the AudioPlayer.
     * @param projectIndex - The index of the project.
     * @param preserveAudioStreamType - If true, preserves the default audio stream type by setting it to 0 (default: false).
     */
    public constructor(projectIndex: int, preserveAudioStreamType: boolean = false) {
        this._projectIndex = projectIndex;
        this._audioStreams = new Array<AudioStream>();
        this._trackCount = 0;
        this._currentTrackIndex = -1;
        this._volume = preserveAudioStreamType ? 1.0 : 0.2;
        this._preserveAudioStreamType = preserveAudioStreamType;
    }



    /**
     * Loads the specified number of .mp3 files from a project directory.
     * @param trackCount - Number of tracks to load.
     * @param skip - Number of tracks to skip before loading (default: 0).
     * @param relativeProjectDirectory - The directory containing .mp3 files (default: "").
     */
    public load(trackCount: int, skip: int = 0, relativeProjectDirectory: string = ""): void {
        if (0 > trackCount || 0 > skip || this._trackCount > 0)
            return;
        this._trackCount = trackCount;
        const rootDir = `${Core.GetProjectInfoAt(this._projectIndex).rootDirectory}${relativeProjectDirectory}`;
        const end = trackCount + skip;
        for (let i = skip; i < end; ++i) {
            let nextFileName = `${rootDir}${i}.mp3`;
            if (Fs.DoesFileExist(nextFileName)) {
                const audioStream = AudioStream.Load(nextFileName);
                if (audioStream !== undefined && this._preserveAudioStreamType)
                    audioStream.setType(0);
                this._audioStreams.push(audioStream);
                continue;
            }
            this._audioStreams.push(undefined);
        }
    }

    /**
     * Sets the volume level for the current track and future tracks.
     * @param volume - The volume level.
     */
    public setVolume(volume: float): void {
        this._volume = volume;
        if (this._hasCurrentTrack()) {
            const audioStream = this._audioStreams[this._currentTrackIndex];
            if (audioStream !== undefined)
                audioStream.setVolume(volume);
        }
    }

    /**
     * Stops the current audio and plays the track at the specified index.
     * @param trackIndex - Index of the track to play.
     * @param loop - If true, the track will loop (default: false).
     * @param defaultDurationMs - Default duration in milliseconds if the track fails to load (default: 1000).
     * @returns Duration of the audio stream in milliseconds, or defaultDurationMs if the track is invalid.
     */
    public play(trackIndex: int, loop: boolean = false, defaultDurationMs: int = 1000): int {
        if (this._hasCurrentTrack())
            this._stopAudio(this._currentTrackIndex);
        if (this._isTrackIndexInvalid(trackIndex))
            return defaultDurationMs;
        this._currentTrackIndex = trackIndex;
        const duration = this._getDuration(trackIndex, defaultDurationMs);
        if (this._audioStreams[trackIndex] === undefined)
            return duration;
        const audioStream = this._audioStreams[trackIndex];
        if (loop)
            audioStream.setLooped(true);
        audioStream.setVolume(this._volume);
        audioStream.setState(1);
        return duration;
    }

    /**
     * Stops the current audio, plays the track at the specified index, and displays a message.
     * @param trackIndex - Index of the track to play.
     * @param defaultDurationMs - Default duration in milliseconds if the track fails to load (default: 1000).
     * @param gxtKey - GXT key of the message to display (default: "DUMMY").
     * @returns Duration of the audio stream in milliseconds, or defaultDurationMs if the track is invalid.
     */
    public playWithMessage(trackIndex: int, defaultDurationMs: int = 1000, gxtKey: string = "DUMMY"): int {
        const lengthInMilliseconds = this.play(trackIndex, false, defaultDurationMs);
        Text.PrintNow(gxtKey, lengthInMilliseconds, 1);
        return lengthInMilliseconds;
    }

    /**
     * Stops the current audio and plays the next track.
     * @param defaultDurationMs - Default duration in milliseconds if the track fails to load (default: 1000).
     * @returns Duration of the audio stream in milliseconds, or the default duration if the track fails to load.
     */
    public playNext(defaultDurationMs: int = 1000): int {
        return this.play(this._currentTrackIndex + 1, false, defaultDurationMs);
    }

    /**
     * Stops the current audio, plays the next track, and displays a message.
     * @param defaultDurationMs - Default duration in milliseconds if the track fails to load  (default: 1000).
     * @param gxtKey - GXT key of the message to display (default: "DUMMY").
     * @returns Duration of the audio stream in milliseconds, or the default duration if the track fails to load.
     */
    public playNextWithMessage(defaultDurationMs: int = 1000, gxtKey: string = "DUMMY"): int {
        const lengthInMilliseconds = this.playNext(defaultDurationMs);
        Text.PrintNow(gxtKey, lengthInMilliseconds, 1);
        return lengthInMilliseconds;
    }

    /** Stops the current audio and unloads all tracks from memory, resetting the player state. */
    public unload(): void {
        for (let i = 0; i < this._trackCount; ++i)
            this._stopAudio(i, true);
        this._trackCount = 0;
        this._currentTrackIndex = -1;
        this._audioStreams = new Array<AudioStream>();
    }

    /**
     * Gets the duration of the track at the specified index.
     * @param trackIndex - Index of the track.
     * @param defaultDurationMs - Default duration in milliseconds if the track is invalid (default: 1000).
     * @returns Duration of the track in milliseconds, or the default duration if the track is invalid.
     */
    public getTrackDuration(trackIndex: int, defaultDurationMs: int = 1000): int {
        if (this._isTrackIndexInvalid(trackIndex))
            return defaultDurationMs;
        return this._getDuration(trackIndex, defaultDurationMs);
    }

    /**
     * Gets the duration of the track at the specified index, limited to a maximum value.
     * @param trackIndex - Index of the track.
     * @param defaultDurationMs - Default and maximum duration in milliseconds (default: 1000).
     * @returns Duration of the track in milliseconds, or the default duration if the track is invalid or exceeds the limit.
     */
    public getTrackDurationWithLimit(trackIndex: int, defaultDurationMs: int = 1000): int {
        let duration = this.getTrackDuration(trackIndex, defaultDurationMs);
        if (duration > defaultDurationMs)
            duration = defaultDurationMs;
        return duration;
    }



    private _stopAudio(trackIndex: int, remove: boolean = false): void {
        const audioStream = this._audioStreams[trackIndex];
        if (audioStream === undefined)
            return;
        audioStream.setState(0);
        if (remove)
            audioStream.remove()
    }

    private _hasCurrentTrack(): boolean {
        return !this._isTrackIndexInvalid(this._currentTrackIndex);
    }

    private _isTrackIndexInvalid(trackIndex: int): boolean {
        return this._trackCount === 0 || 0 > trackIndex || trackIndex >= this._trackCount;
    }

    private _getDuration(trackIndex: int, defaultDurationMs: int = 1000): int {
        if (this._audioStreams[trackIndex] === undefined)
            return defaultDurationMs;
        return (this._audioStreams[trackIndex].getLength() + 1) * 1000;
    }

}