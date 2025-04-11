/// Created by wmysterio, 30.03.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../.config/sa.d.ts" />

/** A base script class with commonly used commands */
export abstract class BaseScript {

    private baseScriptPlayer: Player;
    private baseScriptPlayerChar: Char;

    constructor() {
        this.baseScriptPlayer = new Player(0);
        this.baseScriptPlayerChar = this.baseScriptPlayer.getChar();
    }

    /** The player character */
    protected get player(): Player {
        return this.baseScriptPlayer;
    }

    /** The player character */
    protected get playerChar(): Char {
        return this.baseScriptPlayerChar;
    }

    /** Returns true if the player is not found, not playing, dead, or arrested */
    protected isPlayerNotPlaying(): boolean {
        return !this.baseScriptPlayer.isPlaying() || !Char.DoesExist(+this.baseScriptPlayerChar) || Char.IsDead(+this.baseScriptPlayerChar) || this.baseScriptPlayerChar.hasBeenArrested();
    }

    /** Returns true if the current hour of the game clock is within the specified range */
    protected isClockHourInRange(left: int, right: int): boolean {
        let hour = Clock.GetTimeOfDay().hours;
        if (right > left)
            return hour >= left && right > hour;
        return hour >= left || right > hour;
    }

}