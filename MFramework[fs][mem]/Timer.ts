/**
 * Manages a custom timer for tracking time intervals, relying on the global TIMERB.
 * Supports countdown (Left) and elapsed time (Passed) modes.
 */
export class Timer {

    private _timerMilliseconds: int;

    /** Gets the number of milliseconds remaining. */
    public get millisecondsLeft(): int {
        return this._getCountdownDifference();
    }

    /** Gets the number of seconds remaining. */
    public get secondsLeft(): int {
        return Math.floor((this._getCountdownDifference() / 1000) % 60);
    }

    /** Gets the number of minutes remaining. */
    public get minutesLeft(): int {
        return Math.floor((this._getCountdownDifference() / 60000) % 60);
    }

    /** Gets the number of milliseconds that have passed. */
    public get millisecondsPassed(): int {
        return this._getElapsedDifference();
    }

    /** Gets the number of seconds that have passed. */
    public get secondsPassed(): int {
        return Math.floor((this._getElapsedDifference() / 1000) % 60);
    }

    /** Gets the number of minutes that have passed. */
    public get minutesPassed(): int {
        return Math.floor((this._getElapsedDifference() / 60000) % 60);
    }



    /**
     * Creates a new timer with the specified reference time in milliseconds relative to TIMERB.
     * @param offsetInMilliseconds - The reference time offset in milliseconds (default: 0).
     */
    public constructor(offsetInMilliseconds: int = 0) {
        this.reset(offsetInMilliseconds);
    }



    /**
     * Adds the specified number of seconds to the timer's reference time.
     * @param seconds The number of seconds to add.
     * @returns This timer instance for chaining.
     */
    public addSeconds(seconds: int): Timer {
        return this.addMilliseconds(seconds * 1000);
    }

    /**
     * Adds the specified number of milliseconds to the timer's reference time.
     * @param milliseconds - The number of milliseconds to add.
     * @returns This timer instance for chaining.
     */
    public addMilliseconds(milliseconds: int): Timer {
        this._timerMilliseconds += milliseconds;
        return this;
    }

    /**
     * Subtracts the specified number of milliseconds from the timer's reference time.
     * @param milliseconds - The number of milliseconds to subtract.
     * @returns This timer instance for chaining.
     */
    public subtractMilliseconds(milliseconds: int): Timer {
        this._timerMilliseconds -= milliseconds;
        return this;
    }

    /**
     * Resets the timer with a new reference time in milliseconds relative to TIMERB.
     * @param offsetInMilliseconds - The reference time offset in milliseconds (default: 0).
     * @returns This timer instance for chaining.
     */
    public reset(offsetInMilliseconds: int = 0): Timer {
        this._timerMilliseconds = TIMERB + offsetInMilliseconds;
        return this;
    }



    private _getCountdownDifference(): int {
        return this._timerMilliseconds - TIMERB;
    }

    private _getElapsedDifference(): int {
        return TIMERB - this._timerMilliseconds;
    }

    /**
        Gets the number of hours remaining. 
        public get hoursLeft(): int {
            return Math.floor((this._getCountdownDifference() / 3600000) % 24);
        }
            
        Gets the number of hours that have passed. 
        public get hoursPassed(): int {
            return Math.floor((this._getElapsedDifference() / 3600000) % 24);
        }
    */

}