/** Stores a GXT key and its display duration for text messages. */
export class GxtTime {

    /** GXT key for the text message to display. */
    public gxt: string;

    /** Duration of the text display in milliseconds. */
    public duration: int;

    /** Indicates whether the text message should be displayed. */
    public isEnabled: boolean;

    /**
     * Initializes a new instance with a GXT key and its display duration.
     * @param gxt - GXT key for text display (default: "DUMMY").
     * @param duration - Duration in milliseconds (default: 0).
     */
    public constructor(gxt: string = "DUMMY", duration: int = 0) {
        this.gxt = gxt;
        this.duration = duration;
        this.isEnabled = true;
    }

}

/** Represents a single dialogue line. */
export class DialogueLine extends GxtTime {

    /** The character who speaks the dialogue line. */
    public speaker: Char;

    /** The name of the animation to play during the dialogue. */
    public animationName: string;

    /** The IFP file containing the animation. */
    public animationFile: string;



    /**
     * Creates a dialogue line.
     * @param speaker - The character who speaks the line.
     * @param gxt - The GXT key of the message to display.
     * @param duration - The duration of the line in milliseconds.
     * @param animationName - The name of the animation to play (default: undefined).
     * @param animationFile - The IFP file containing the animation (default: undefined).
     */
    public constructor(speaker: Char, gxt: string, duration: int, animationName: string = undefined, animationFile: string = undefined) {
        super(gxt, duration);
        this.speaker = speaker;
        this.animationName = animationName;
        this.animationFile = animationFile;
    }

}