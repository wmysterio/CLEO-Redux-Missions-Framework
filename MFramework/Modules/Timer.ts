/// Created by wmysterio, 16.04.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../.././.config/sa.d.ts" />

/** Class for working with a custom timer */
export class Timer {

    /** Just draws minutes and seconds. Turn on "Text.UseCommands" before using */
    public static JustDisplayTime(offsetLeft: float, offsetTop: float, minutes: int, seconds: int): void {
        if (10 > seconds) {
            Text.DisplayWith2Numbers(offsetLeft, offsetTop, "TIME_0", minutes, seconds);
            return;
        }
        Text.DisplayWith2Numbers(offsetLeft, offsetTop, "TIME", minutes, seconds);
    }

    private milliseconds: int;

    /** Creates a new timer and sets the new timer value with the specified offset in milliseconds */
    constructor(offsetMilliseconds: int = 0) {
        this.set(offsetMilliseconds);
    }

    /** Counts how many hours are left */
    public getHoursLeft(): int {
        let timeDifferenceMS = this.milliseconds - Date.now();
        return Math.floor((timeDifferenceMS / 3600000) % 24);
    }

    /** Counts how many minutes are left */
    public getMinutesLeft(): int {
        let timeDifferenceMS = this.milliseconds - Date.now();
        return Math.floor((timeDifferenceMS / 60000) % 60);
    }

    /** Counts how many seconds are left */
    public getSecondsLeft(): int {
        let timeDifferenceMS = this.milliseconds - Date.now();
        return Math.floor((timeDifferenceMS / 1000) % 60);
    }

    /** Counts how many milliseconds are left */
    public getMillisecondsLeft(): int {
        return this.milliseconds - Date.now();
    }

    /** Counts how many hours have passed */
    public getHoursPassed(): int {
        let timeDifferenceMS = Date.now() - this.milliseconds;
        return Math.floor((timeDifferenceMS / 3600000) % 24);
    }

    /** Counts how many minutes have passed */
    public getMinutesPassed(): int {
        let timeDifferenceMS = Date.now() - this.milliseconds;
        return Math.floor((timeDifferenceMS / 60000) % 60);
    }

    /** Counts how many seconds have passed */
    public getSecondsPassed(): int {
        let timeDifferenceMS = Date.now() - this.milliseconds;
        return Math.floor((timeDifferenceMS / 1000) % 60);
    }

    /** Counts how many milliseconds have passed */
    public getMillisecondsPassed(): int {
        return Date.now() - this.milliseconds;
    }

    /** Increments the current timer value by the specified value in milliseconds */
    public add(timeInMilliseconds: int): Timer {
        this.milliseconds += timeInMilliseconds;
        return this;
    }

    /** Decrements the current timer value by the specified value in milliseconds */
    public sub(timeInMilliseconds: int): Timer {
        this.milliseconds -= timeInMilliseconds;
        return this;
    }

    /** Sets a new timer value with the specified offset in milliseconds */
    public set(offsetMilliseconds: int = 0): Timer {
        this.milliseconds = Date.now() + offsetMilliseconds;
        return this;
    }

    /** Draws the remaining minutes and seconds of the timer. Enable "Text.UseCommands" before using */
    public displayTimeLeft(offsetLeft: float, offsetTop: float): void {
        let minutes = this.getMinutesLeft();
        let seconds = this.getSecondsLeft();
        if (10 > seconds) {
            Text.DisplayWith2Numbers(offsetLeft, offsetTop, "TIME_0", minutes, seconds);
            return;
        }
        Text.DisplayWith2Numbers(offsetLeft, offsetTop, "TIME", minutes, seconds);
    }

}