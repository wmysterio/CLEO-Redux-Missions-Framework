/// Created by wmysterio, 16.04.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path=".././.config/sa.d.ts" />

/** Class for working with custom timers */
export class Timer {

    private timerMilliseconds: int;

    /** Creates a new timer and sets the new timer value with the specified offset in milliseconds */
    constructor(offsetMilliseconds: int = 0) {
        this.set(offsetMilliseconds);
    }

    /** Counts how many minutes are left */
    public getMinutesLeft(): int {
        let timeDifferenceMS = this.timerMilliseconds - TIMERB;
        return Math.floor((timeDifferenceMS / 60000) % 60);
    }

    /** Counts how many seconds are left */
    public getSecondsLeft(): int {
        let timeDifferenceMS = this.timerMilliseconds - TIMERB;
        return Math.floor((timeDifferenceMS / 1000) % 60);
    }

    /** Counts how many milliseconds are left */
    public getMillisecondsLeft(): int {
        return this.timerMilliseconds - TIMERB;
    }

    /** Counts how many minutes have passed */
    public getMinutesPassed(): int {
        let timeDifferenceMS = TIMERB - this.timerMilliseconds;
        return Math.floor((timeDifferenceMS / 60000) % 60);
    }

    /** Counts how many seconds have passed */
    public getSecondsPassed(): int {
        let timeDifferenceMS = TIMERB - this.timerMilliseconds;
        return Math.floor((timeDifferenceMS / 1000) % 60);
    }

    /** Counts how many milliseconds have passed */
    public getMillisecondsPassed(): int {
        return TIMERB - this.timerMilliseconds;
    }

    /** Increments the current timer value by the specified value in milliseconds */
    public add(timeInMilliseconds: int): Timer {
        this.timerMilliseconds += timeInMilliseconds;
        return this;
    }

    /** Decrements the current timer value by the specified value in milliseconds */
    public sub(timeInMilliseconds: int): Timer {
        this.timerMilliseconds -= timeInMilliseconds;
        return this;
    }

    /** Sets a new timer value with the specified offset in milliseconds */
    public set(offsetMilliseconds: int = 0): Timer {
        this.timerMilliseconds = TIMERB + offsetMilliseconds;
        return this;
    }

    /*
    
    / ** Counts how many hours are left * /
    public getHoursLeft(): int {
        let timeDifferenceMS = this.timerMilliseconds - TIMERB;
        return Math.floor((timeDifferenceMS / 3600000) % 24);
    }

    / ** Counts how many hours have passed * /
    public getHoursPassed(): int {
        let timeDifferenceMS = TIMERB - this.timerMilliseconds;
        return Math.floor((timeDifferenceMS / 3600000) % 24);
    }

    */
}