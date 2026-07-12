import { AudioPlayer } from "./AudioPlayer";
import { Core } from "./Core";
import { Dialogue } from "./Dialogue";
import { GxtTime } from "./GxtTime";
import { CELLPHONE } from "./Models";

/** */
export class Phone {

}

class PhoneOldBad {

    public static RINGTONE_ID: int = 23000;

    //@ts-ignore
    private _lines: GxtTime[];
    //@ts-ignore
    private _currentLine: int;
    //@ts-ignore
    private _audioPlayer: AudioPlayer;
    //@ts-ignore
    private _stage: int;

    /**  */
    public get currentLine(): int {
        return this._currentLine;
    }



    /**  */
    public constructor() {
        this._reset();
    }



    /**
     * 
     * @param messageGxt 
     * @param durationMs 
     * @param facialTalk 
     * @returns 
     */
    public addLine(messageGxt: string, durationMs: int, facialTalk: boolean): Phone {
        const gxtTime = new GxtTime(messageGxt, durationMs);
        gxtTime.isEnabled = facialTalk;
        this._lines.push(gxtTime);
        return this;
    }


    public call(abonent: Char): void {
        if (Core.IsCharInactive(abonent)) {
            this._stage = 0;
            return;
        }
        switch (this._stage) {
            case 0:


                return;
            default:
                this._stage = 0;
                break;
        }
    }




    /**
     * Loads audio files for.
     * @param abonent -
     * @param skip - Number of tracks to skip (default: 0).
     * @param relativeProjectDirectory - The directory to scan for audio files (default: "").
     * @remarks Add dialogue lines before calling!
     */
    //public loadVoiceAudio(skip: int = 0, relativeProjectDirectory: string = ""): void {
    //    this._audioPlayer.load(this._lines.length, skip, relativeProjectDirectory);
    //}

    /** */
    public unload(): void {
        this._reset();
    }



    private _reset(): void {
        this._audioPlayer.unload();
        this._lines = [];
        this._currentLine = -1;
        this._stage = 0;
    }

}