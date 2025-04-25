/// Created by wmysterio, 19.04.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path=".././.config/sa.d.ts" />

/** Class for working with audio files */
export class AudioPlayer {

    private audioPlayerAudioStreams: AudioStream[];
    private audioPlayerNumTracks: int;
    private audioPlayerCurrentTrack: int;
    private audioPlayerVolume: float;

    constructor() {
        this.audioPlayerAudioStreams = new Array<AudioStream>();
        this.audioPlayerNumTracks = 0;
        this.audioPlayerCurrentTrack = -1;
        this.audioPlayerVolume = 1.0;
    }



    /** Loads the specified number of *.MP3 files, starting from 0. You can specify a subfolder from which to load */
    public load(trackNumber: int, subfolder: string = ""): void {
        if (0 > trackNumber || this.audioPlayerNumTracks > 0)
            return;
        this.audioPlayerNumTracks = trackNumber;
        let rootDir = __dirname + subfolder;
        for (let i = 0; i < trackNumber; ++i) {
            let nextFileName = rootDir + "\\" + i.toString() + ".mp3";
            if (Fs.DoesFileExist(nextFileName)) {
                this.audioPlayerAudioStreams.push(AudioStream.Load(nextFileName));
                continue;
            }
            this.audioPlayerAudioStreams.push(undefined);
        }
    }

    /** Returns true if the audio file is currently playing */
    public isPlaying(): boolean {
        if (this.audioPlayerHaveCurrentTrack()) {
            let audioStream = this.audioPlayerAudioStreams[this.audioPlayerCurrentTrack];
            if (audioStream !== undefined)
                return audioStream.isPlaying();
        }
        return false;
    }

    /** Sets the volume level for the current audio and each subsequent one */
    public setVolume(volume: float): void {
        this.audioPlayerVolume = volume;
        if (this.audioPlayerHaveCurrentTrack()) {
            let audioStream = this.audioPlayerAudioStreams[this.audioPlayerCurrentTrack];
            if (audioStream !== undefined)
                audioStream.setVolume(volume);
        }
    }


    /** Returns the duration in milliseconds */
    public getDurationByNumber(number: int, defaultLengthInMilliseconds: int = 1000): int {
        if (this.audioPlayerIsNumberIncorrect(number))
            return defaultLengthInMilliseconds;
        return this.audioPlayerGetDuration(number);
    }

    /** Returns the duration in milliseconds. The duration will not exceed the specified limit */
    public getDurationByNumberWithLimit(number: int, defaultLengthInMilliseconds: int = 1000): int {
        let duration = this.getDurationByNumber(number, defaultLengthInMilliseconds);
        if (duration > defaultLengthInMilliseconds)
            duration = defaultLengthInMilliseconds;
        return duration;
    }

    /**
     * Stops the current audio file and plays the audio file with the name corresponding to the number
     * @returns Returns the audio stream duration in seconds. If the file does not load, then returns the specified default value
     */
    public play(number: int, loop: boolean, defaultLengthInMilliseconds: int = 1000): int {
        if (this.audioPlayerHaveCurrentTrack())
            this.audioPlayerStopAudio(this.audioPlayerCurrentTrack);
        if (this.audioPlayerIsNumberIncorrect(number))
            return defaultLengthInMilliseconds;
        this.audioPlayerCurrentTrack = number;
        let audioStream = this.audioPlayerAudioStreams[number];
        if (audioStream === undefined)
            return defaultLengthInMilliseconds;
        if (loop)
            audioStream.setLooped(true);
        audioStream.setVolume(this.audioPlayerVolume);
        audioStream.setState(1);
        return this.audioPlayerGetDuration(number);
    }

    /**
     * Stops the current audio file and plays the audio file with the name corresponding to the number. Displays a text message on the screen
     * @returns Returns the audio stream duration in seconds. If the file does not load, then returns the specified default value
     */
    public playWithMessage(number: int, defaultLengthInMilliseconds: int = 1000, message: string = "", aGxtKey: boolean = false): int {
        let lengthInMilliseconds = this.play(number, false, defaultLengthInMilliseconds);
        if (aGxtKey && message.length > 0 && 8 > message.length) {
            Text.PrintNow(message, lengthInMilliseconds, 1);
        } else {
            Text.PrintFormattedNow(message, lengthInMilliseconds);
        }
        return lengthInMilliseconds;
    }

    /** Stops the current audio file and plays the next one. If the file does not load, then returns the specified default value */
    public playNext(defaultLengthInMilliseconds: int = 1000): int {
        return this.play(this.audioPlayerCurrentTrack + 1, false, defaultLengthInMilliseconds);
    }

    /** Stops the current audio file and plays the next one. If the file does not load, then returns the specified default value. Displays a text message on the screen */
    public playNextWithMessage(defaultLengthInMilliseconds: int = 1000, message: string = "", aGxtKey: boolean = false): int {
        let lengthInMilliseconds = this.playNext(defaultLengthInMilliseconds);
        if (aGxtKey && message.length > 0 && 8 > message.length) {
            Text.PrintNow(message, lengthInMilliseconds, 1);
        } else {
            Text.PrintFormattedNow(message, lengthInMilliseconds);
        }
        return lengthInMilliseconds;
    }

    /** Stops the current audio file and unloads all files from memory */
    public unload(): void {
        for (let i = 0; i < this.audioPlayerNumTracks; ++i)
            this.audioPlayerStopAudio(i, true);
        this.audioPlayerNumTracks = 0;
        this.audioPlayerCurrentTrack = -1;
        this.audioPlayerAudioStreams = new Array<AudioStream>();
    }



    private audioPlayerStopAudio(number: int, remove: boolean = false): void {
        let audioStream = this.audioPlayerAudioStreams[number];
        if (audioStream === undefined)
            return;
        audioStream.setState(0);
        if (remove)
            audioStream.remove()
    }

    private audioPlayerHaveCurrentTrack(): boolean {
        return !this.audioPlayerIsNumberIncorrect(this.audioPlayerCurrentTrack);
    }

    private audioPlayerIsNumberIncorrect(number: int): boolean {
        return this.audioPlayerNumTracks === 0 || 0 > number || number >= this.audioPlayerNumTracks;
    }

    private audioPlayerGetDuration(number: int): int {
        return (this.audioPlayerAudioStreams[number].getLength() + 1) * 1000;
    }

}