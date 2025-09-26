import { NativePed } from "./Native";
import { Timer } from "./Timer";

/** Screen width in GTA San Andreas internal coordinates (640.0). */
export const SCREEN_WIDTH: float = 640.0;

/** Screen height in GTA San Andreas internal coordinates (448.0). */
export const SCREEN_HEIGHT: float = 448.0;

/** Screen center X coordinate in GTA San Andreas (320.0). */
export const SCREEN_CENTER_X: float = 320.0;

/** Screen center Y coordinate in GTA San Andreas (224.0). */
export const SCREEN_CENTER_Y: float = 224.0;

/** Text alignment options. */
export enum TextAlign {
    Left = 0,
    Center = 1,
    Right = 2,
    Justify = 3
}

/** Font options. */
export enum TextFont {
    Gothic = 0,
    Subtitles = 1,
    Menu = 2,
    Pricedown = 3
}

/** Base class for visual elements, providing color and visibility properties. */
export abstract class VisualElement {

    /** Determines whether the element is visible. */
    public visible: boolean;

    /** Red component of the element's color (0-255). */
    public r: int;

    /** Green component of the element's color (0-255). */
    public g: int;

    /** Blue component of the element's color (0-255). */
    public b: int;

    /** Alpha component of the element's color (0-255). */
    public a: int;



    /**
     * Creates a visual element with the specified color.
     * @param r - Red component of the color (0-255).
     * @param g - Green component of the color (0-255).
     * @param b - Blue component of the color (0-255).
     * @param a - Alpha component of the color (0-255).
     */
    public constructor(r: int, g: int, b: int, a: int) {
        this.changeColor(r, g, b, a);
        this.visible = true;
    }

    /**
     * Changes the color of the visual element.
     * @param r - Red component of the new color (0-255).
     * @param g - Green component of the new color (0-255).
     * @param b - Blue component of the new color (0-255).
     * @param a - Alpha component of the new color (default: 255).
     */
    public changeColor(r: int, g: int, b: int, a: int = 255): void {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    /**
     * Draws the visual element on the screen.
     * @remarks Enable {@link Text.UseCommands} before calling!
     * @remarks Called `in a loop` to draw.
     */
    public abstract draw();

}

/** Represents a 2D sprite element for rendering on the screen. */
export class Sprite extends VisualElement {

    /** The memory slot used for rendering. */
    public memorySlot: int;

    /** The rotation angle of the sprite in degrees. */
    public angle: float;

    /** The X-coordinate of the rectangle's center in screen units. */
    public centerX: float;

    /** The Y-coordinate of the rectangle's center in screen units. */
    public centerY: float;

    /** The width of the rectangle in screen units. */
    public width: float;

    /** The height of the rectangle in screen units. */
    public height: float;



    /**
     * Creates a new sprite with the specified memory slot, position, and size.
     * @param memorySlot - The memory slot ID.
     * @param centerX - The X-coordinate of the sprite's center in screen units.
     * @param centerY - The Y-coordinate of the sprite's center in screen units.
     * @param width - The width of the sprite in screen units.
     * @param height - The height of the sprite in screen units.
     * @remarks The memory slot ID must be greater 0.
     */
    public constructor(memorySlot: int, centerX: float, centerY: float, width: float, height: float) {
        super(255, 255, 255, 255);
        this.memorySlot = memorySlot; // 1 > memorySlot ? 1 : 
        this.centerX = centerX;
        this.centerY = centerY;
        this.width = width;
        this.height = height;
        this.angle = 0.0;
    }



    public draw() {
        Hud.DrawSpriteWithRotation(this.memorySlot, this.centerX, this.centerY, this.width, this.height, this.angle, this.r, this.g, this.b, this.a);
    }

}

/** Represents a rectangular HUD element. */
export class Rect extends VisualElement {

    /** The X-coordinate of the rectangle's center in screen units. */
    public centerX: float;

    /** The Y-coordinate of the rectangle's center in screen units. */
    public centerY: float;

    /** The width of the rectangle in screen units. */
    public width: float;

    /** The height of the rectangle in screen units. */
    public height: float;

    /**
     * Creates a rectangular HUD element.
     * @param centerX - The X-coordinate of the rectangle's center in screen units.
     * @param centerY - The Y-coordinate of the rectangle's center in screen units.
     * @param width - The width of the rectangle in screen units.
     * @param height - The height of the rectangle in screen units.
     * @param r - The red color component (0-255).
     * @param g - The green color component (0-255).
     * @param b - The blue color component (0-255).
     * @param a - The alpha (transparency) component (0-255, default: 255).
     */
    public constructor(centerX: float, centerY: float, width: float, height: float, r: int, g: int, b: int, a: int = 255) {
        super(r, g, b, a);
        this.changePosition(centerX, centerY);
        this.changeSize(width, height);
    }



    /**
     * Changes the position of the rectangle.
     * @param centerX - The new X-coordinate of the rectangle's center in screen units.
     * @param centerY - The new Y-coordinate of the rectangle's center in screen units.
     */
    public changePosition(centerX: float, centerY: float): void {
        this.centerX = centerX;
        this.centerY = centerY;
    }

    /**
     * Changes the size of the rectangle.
     * @param width - The new width of the rectangle in screen units.
     * @param height - The new height of the rectangle in screen units.
     */
    public changeSize(width: float, height: float): void {
        this.width = width;
        this.height = height;
    }

    public draw(): void {
        if (this.visible && this.a > 0)
            Hud.DrawRect(this.centerX, this.centerY, this.width, this.height, this.r, this.g, this.b, this.a);
    }

}

/** A visual element for displaying customizable text labels. */
export class Label extends VisualElement {

    /**
     * Calculates the height of a text row based on scale and padding.
     * @param scaleY - The Y-axis scale of the text.
     * @param padding - The padding around the text in screen units (default: 0.0).
     * @returns The calculated height in screen units.
     */
    public static CalculateRowHeight(scaleY: float, padding: float = 0.0): float {
        return scaleY * 5.2 + padding * 2.0;
    }

    /**
     * Calculates the Y-coordinate to center an element within a rectangle in screen units.
     * @param rectCenterY - The Y-coordinate of the rectangle's center.
     * @param height - The height of the element in screen units.
     * @param padding - The padding around the element in screen units (default: 0.0).
     * @returns The adjusted Y-coordinate for the element's center in screen units.
     */
    public static CalculateYCenterForRect(rectCenterY: float, height: float, padding: float = 0.0): float {
        return rectCenterY + height * 0.5 + padding * -0.4;
    }



    private _args: number[];
    private _height: float;
    private _padding: float;
    private _isFormatted: boolean;

    /** The X-coordinate offset for the label position. */
    public offsetLeft: float;

    /** The Y-coordinate offset for the label position. */
    public offsetTop: float;

    /** The GXT key or text string to display. */
    public text: string;

    /** The text alignment. */
    public align: TextAlign;

    /** The font used for the text. */
    public font: TextFont;

    /** The wrap width for text in pixels. */
    public wrapX: float;

    /** The X-axis scale of the text. */
    public scaleX: float;

    /** The Y-axis scale of the text. */
    public scaleY: float;

    /** The intensity of the text shadow. */
    public shadowIntensity: int;

    /** The red component of the shadow color (0-255). */
    public shadowR: int;

    /** The green component of the shadow color (0-255). */
    public shadowG: int;

    /** The blue component of the shadow color (0-255). */
    public shadowB: int;

    /** The alpha component of the shadow color (0-255). */
    public shadowA: int;

    /** The intensity of the text edge (outline). */
    public edgeIntensity: int;

    /** The red component of the edge color (0-255). */
    public edgeR: int;

    /** The green component of the edge color (0-255). */
    public edgeG: int;

    /** The blue component of the edge color (0-255). */
    public edgeB: int;

    /** The alpha component of the edge color (0-255). */
    public edgeA: int;


    /** Gets whether the text is formatted with arguments. */
    public get isFormatted(): boolean {
        return this._isFormatted;
    }

    /** Gets the padding around the text in screen units. */
    public get padding(): float {
        return this._padding;
    }

    /** Gets the height of the text row in screen units. */
    public get height(): float {
        return this._height;
    }



    /**
     * Creates a new text label with specified position and color.
     * @param offsetLeft - The X-coordinate offset for the label position.
     * @param offsetTop - The Y-coordinate offset for the label position.
     * @param r - The red component of the text color (0-255).
     * @param g - The green component of the text color (0-255).
     * @param b - The blue component of the text color (0-255).
     * @param a - The alpha component of the text color (0-255, default: 255).
     */
    public constructor(offsetLeft: float, offsetTop: float, r: int, g: int, b: int, a: int = 255) {
        super(r, g, b, a);
        this.changePosition(offsetLeft, offsetTop);
        this.changeEdge(0, 0, 0, 0, 0);
        this.changeShadow(1, 0, 0, 0, 255);
        this.changeScale(1.0, 1.0, 0.0);
        this.changeText("DUMMY");
        this._args = new Array<number>();
        this.align = TextAlign.Left;
        this.font = TextFont.Subtitles;
        this.wrapX = 640.0;
    }



    public draw(): void {
        if (this.visible && this.a > 0) {
            Text.SetProportional(true);
            Text.SetFont(this.font);
            Text.SetWrapX(this.wrapX);
            Text.SetScale(this.scaleX, this.scaleY);
            Text.SetColor(this.r, this.g, this.b, this.a);
            Text.SetDropshadow(this.shadowIntensity, this.shadowR, this.shadowG, this.shadowB, this.shadowA);
            Text.SetEdge(this.edgeIntensity, this.edgeR, this.edgeG, this.edgeB, this.edgeA);
            switch (this.align) {
                case TextAlign.Center:
                    Text.SetCenter(true);
                    Text.SetRightJustify(false);
                    Text.SetJustify(false);
                    break;
                case TextAlign.Right:
                    Text.SetCenter(false);
                    Text.SetRightJustify(true);
                    Text.SetJustify(false);
                    break;
                case TextAlign.Justify:
                    Text.SetCenter(false);
                    Text.SetRightJustify(false);
                    Text.SetJustify(true);
                    break;
                default:
                    Text.SetCenter(false);
                    Text.SetRightJustify(false);
                    Text.SetJustify(false);
                    break;
            }
            if (this._isFormatted) {
                Text.DisplayFormatted(this.offsetLeft, this.offsetTop, this.text, ...this._args);
            } else {
                Text.Display(this.offsetLeft, this.offsetTop, this.text);
            }
        }
    }



    /**
     * Changes the shadow properties of the text label.
     * @param intensity - The intensity of the shadow.
     * @param r - The red component of the shadow color (0-255).
     * @param g - The green component of the shadow color (0-255).
     * @param b - The blue component of the shadow color (0-255).
     * @param a - The alpha component of the shadow color (0-255).
     */
    public changeShadow(intensity: int, r: int, g: int, b: int, a: int): void {
        this.shadowIntensity = intensity;
        this.shadowR = r;
        this.shadowG = g;
        this.shadowB = b;
        this.shadowA = a;
    }

    /**
     * Changes the edge (outline) properties of the text label.
     * @param intensity - The intensity of the edge.
     * @param r - The red component of the edge color (0-255).
     * @param g - The green component of the edge color (0-255).
     * @param b - The blue component of the edge color (0-255).
     * @param a - The alpha component of the edge color (0-255).
     */
    public changeEdge(intensity: int, r: int, g: int, b: int, a: int): void {
        this.edgeIntensity = intensity;
        this.edgeR = r;
        this.edgeG = g;
        this.edgeB = b;
        this.edgeA = a;
    }

    /**
     * Changes the position of the text label.
     * @param offsetLeft - The new X-coordinate offset.
     * @param offsetTop - The new Y-coordinate offset.
     */
    public changePosition(offsetLeft: float, offsetTop: float): void {
        this.offsetLeft = offsetLeft;
        this.offsetTop = offsetTop;
    }

    /**
     * Changes the scale of the text label.
     * @param scaleX - The new X-axis scale.
     * @param scaleY - The new Y-axis scale.
     * @param padding - The padding around the text in screen units (default: 0.0).
     */
    public changeScale(scaleX: float, scaleY: float, padding: float = 0.0): void {
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        this._padding = padding;
        this._height = Label.CalculateRowHeight(scaleY, padding);
    }

    /**
     * Calculates the Y-coordinate to center the text within a rectangle.
     * @param rectCenterY - The Y-coordinate of the rectangle's center in screen units.
     * @returns The adjusted Y-coordinate for the text center.
     */
    public calculateYCenterForRect(rectCenterY: float): float {
        return Label.CalculateYCenterForRect(rectCenterY, this.height, this.padding);
    }

    /**
     * Changes the text of the label to a plain GXT string.
     * @param gxt - The GXT key or text string to display.
     * @remarks Resets formatted text arguments.
     */
    public changeText(gxt: string): void {
        this.text = gxt;
        this._args = new Array<number>();
        this._isFormatted = false;
    }

    /**
     * Changes the text of the label to a formatted string with arguments.
     * @param format - The GXT key or format string to display.
     * @param args - The numeric arguments for the formatted text.
     * @remarks Sets formatted text arguments.
     */
    public changeFormattedText(format: string, ...args: number[]): void {
        this.text = format;
        this._args = args;
        this._isFormatted = true;
    }

}

/** Represents a canvas for rendering visual elements. */
export class Canvas extends VisualElement {

    private _elements: VisualElement[];
    private _elementsCount: int;

    /** Gets the number of visual elements in the canvas. */
    public get elementsCount(): int {
        return this._elementsCount;
    }



    /**
     * Initializes a new canvas with a specified background color and transparency.
     * @param r - The red component of the background color (0-255).
     * @param g - The green component of the background color (0-255).
     * @param b - The blue component of the background color (0-255).
     * @param a - The alpha (transparency) component of the background (default: 255, fully opaque).
     */
    public constructor(r: int, g: int, b: int, a: int = 255) {
        super(r, g, b, a);
        this._elements = new Array<VisualElement>();
        this._elementsCount = 0;
    }



    /**
     * Inserts a visual element at the start of the canvas's element list.
     * @param visualElement - The visual element to insert.
     */
    public insertAtStart(visualElement: VisualElement): void {
        this._elementsCount = this._elements.unshift(visualElement);
    }

    /**
     * Retrieves a visual element at the specified index.
     * @param index - The index of the element in the canvas.
     * @returns The visual element at the specified index.
     */
    public getElementAt(index: int): VisualElement {
        return this._elements[index];
    }

    /**
     * Adds a rectangle to the canvas.
     * @param centerX - The X coordinate of the rectangle's center (screen space).
     * @param centerY - The Y coordinate of the rectangle's center (screen space).
     * @param width - The width of the rectangle (screen space).
     * @param height - The height of the rectangle (screen space).
     * @param r - The red component of the rectangle's color (0-255).
     * @param g - The green component of the rectangle's color (0-255).
     * @param b - The blue component of the rectangle's color (0-255).
     * @param a - The alpha (transparency) component of the rectangle (default: 255, fully opaque).
     * @returns The created rectangle instance.
     */
    public addRect(centerX: float, centerY: float, width: float, height: float, r: int, g: int, b: int, a: int = 255): Rect {
        const result = new Rect(centerX, centerY, width, height, r, g, b, a);
        this._elements.push(result);
        this._elementsCount += 1;
        return result;
    }

    /**
     * Adds a text label to the canvas.
     * @param offsetLeft - The left offset of the label (screen space).
     * @param offsetTop - The top offset of the label (screen space).
     * @param r - The red component of the label's color (0-255).
     * @param g - The green component of the label's color (0-255).
     * @param b - The blue component of the label's color (0-255).
     * @param a - The alpha (transparency) component of the label (default: 255, fully opaque).
     * @returns The created text label instance.
     */
    public addLabel(offsetLeft: float, offsetTop: float, r: int, g: int, b: int, a: int = 255): Label {
        const result = new Label(offsetLeft, offsetTop, r, g, b, a);
        this._elements.push(result);
        this._elementsCount += 1;
        return result;
    }

    /**
     * Adds a new sprite to the canvas with the specified memory slot, position, and size.
     * @param memorySlot - The memory slot ID.
     * @param centerX - The X-coordinate of the sprite's center in screen units.
     * @param centerY - The Y-coordinate of the sprite's center in screen units.
     * @param width - The width of the sprite in screen units.
     * @param height - The height of the sprite in screen units.
     * @returns The created sprite instance.
     * @remarks The memory slot ID must be greater 0.
     */
    public addSprite(memorySlot: int, centerX: float, centerY: float, width: float, height: float): Sprite {
        const result = new Sprite(memorySlot, centerX, centerY, width, height);
        this._elements.push(result);
        this._elementsCount += 1;
        return result;
    }

    /** 
     * Draws the canvas and all its visual elements.
     * @remarks Called 'in a loop' to draw.
     * @remarks Enables {@link Text.UseCommands} before drawing and disables it afterward.
     */
    public draw(): void {
        Text.UseCommands(true);
        if (this.visible && this.a > 0)
            Hud.DrawRect(SCREEN_CENTER_X, SCREEN_CENTER_Y, SCREEN_WIDTH, SCREEN_HEIGHT, this.r, this.g, this.b, this.a);
        for (let i = 0; i < this._elementsCount; ++i)
            this._elements[i].draw();
        Text.UseCommands(false);
    }

}

/**
 * Manages drawing HUD elements on the screen.
 * @remarks Called 'in a loop' to draw.
 * @remarks Enables {@link Text.UseCommands} before drawing and disables it afterward.
 */
export class Screen {

    private static readonly BAR_PADDING_HALF: float = 1.6;
    private static readonly BAR_PADDING: float = this.BAR_PADDING_HALF * 2.0;
    private static readonly BAR_HEIGHT: float = 4.0;
    private static readonly BAR_WIDTH: float = 100.0;
    private static readonly BAR_MAX_HEIGHT: float = this.BAR_HEIGHT + this.BAR_PADDING_HALF * this.BAR_PADDING;
    private static readonly BAR_MAX_WIDTH: float = this.BAR_WIDTH + this.BAR_PADDING_HALF * this.BAR_PADDING;
    private static readonly LINE_PADDING_HALF: float = 2.0;
    private static readonly LINE_PADDING: float = this.LINE_PADDING_HALF * 2.0;
    private static readonly LINE_HEIGHT: float = Label.CalculateRowHeight(2.0, this.LINE_PADDING);



    private constructor() { }



    /**
     * Draws the specified minutes and seconds.
     * @param minutes - The number of minutes to display.
     * @param seconds - The number of seconds to display.
     * @param line - The line number for positioning (default: 0).
     * @param gxtKey - The GXT key for the timer label (default: "BB_19").
     */
    public static DisplayTimeValues(minutes: int, seconds: int, line: int = 0, gxtKey: string = "BB_19"): void {
        const yPosition = this._calculateLineTopOffset(line);
        this._setupDisplayText();
        Text.Display(548.0, yPosition, gxtKey);
        this._setupDisplayText();
        Text.DisplayWith2Numbers(608.0, yPosition, 10 > seconds ? "TIME_0" : "TIME", minutes, seconds);
    }

    /**
     * Draws the remaining minutes and seconds of a timer on the screen.
     * @param timer - The timer to display.
     * @param line - The line number for positioning (default: 0).
     * @param gxtKey - The GXT key for the timer label (default: "BB_19").
     */
    public static DisplayTimeLeft(timer: Timer, line: int = 0, gxtKey: string = "BB_19"): void {
        this.DisplayTimeValues(timer.minutesLeft, timer.secondsLeft, line, gxtKey);
    }

    /**
     * Draws the elapsed minutes and seconds of a timer on the screen.
     * @param timer - The timer to display.
     * @param line - The line number for positioning (default: 0).
     * @param gxtKey - The GXT key for the timer label (default: "BB_19").
     */
    public static DisplayTimePassed(timer: Timer, line: int = 0, gxtKey: string = "BB_19"): void {
        this.DisplayTimeValues(timer.minutesPassed, timer.secondsPassed, line, gxtKey);
    }

    /** 
     * Draws a counter with the specified value formatted using the given GXT key.
     * @param value - The value to display.
     * @param line - The line number for positioning (default: 1).
     * @param gxtKey - The GXT key for the counter label (default: "NUMBER").
     */
    public static DisplayCounter(value: int, line: int = 1, gxtKey: string = "NUMBER"): void {
        this._setupDisplayText();
        Text.DisplayWithNumber(608.0, this._calculateLineTopOffset(line), gxtKey, value);
    }

    /**
     * Draws a counter with two specified values formatted using the given GXT key.
     * @param value1 - The first value to display.
     * @param value2 - The second value to display.
     * @param line - The line number for positioning (default: 1).
     * @param gxtKey - The GXT key for the counter label (default: "TEXTW2N").
     */
    public static DisplayCounterWith2Numbers(value1: int, value2: int, line: int = 1, gxtKey: string = "TEXTW2N"): void {
        this._setupDisplayText();
        Text.DisplayWith2Numbers(608.0, this._calculateLineTopOffset(line), gxtKey, value1, value2);
    }

    /** 
     * Draws a bar with the specified current and maximum values formatted using the given GXT key.
     * @param currentValue - The current value of the bar.
     * @param maxValue - The maximum value of the bar.
     * @param line - The line number for positioning (default: 1).
     * @param gxtKey - The GXT key for the bar label (default: "DUMMY").
     */
    public static DisplayBar(currentValue: int, maxValue: int, line: int = 1, gxtKey: string = "DUMMY"): void {
        let yPosition = this._calculateLineTopOffset(line);
        const barWidth = this._calculateBarWidth(currentValue, maxValue);
        if (gxtKey !== "DUMMY") {
            this._setupDisplayText();
            Text.Display(496.0, yPosition, gxtKey);
        }
        yPosition = Label.CalculateYCenterForRect(yPosition, this.LINE_HEIGHT, this.LINE_PADDING) + this.LINE_PADDING_HALF + 1.3;
        Hud.DrawRect(558.0, yPosition, this.BAR_MAX_WIDTH, this.BAR_MAX_HEIGHT, 0, 0, 0, 255);
        Hud.DrawRect(558.0, yPosition, this.BAR_WIDTH, this.BAR_HEIGHT, 74, 90, 107, 255);
        Hud.DrawRect(558.0 - this._calculateBarOffset(barWidth), yPosition, barWidth, this.BAR_HEIGHT, 172, 203, 241, 255);
    }

    /**
     * Draws a health bar for the specified character formatted using the given GXT key.
     * @param char - The character whose health is displayed.
     * @param line - The line number for positioning (default: 1).
     * @param gxtKey - The GXT key for the bar label (default: "DUMMY").
     */
    public static DisplayCharHealthBar(char: Char, line: int = 1, gxtKey: string = "DUMMY"): void {
        this.DisplayBar(char.getHealth(), NativePed.GetMaxHealth(char), line, gxtKey);
    }

    /** 
     * Draws a health bar for the specified vehicle formatted using the given GXT key.
     * @param vehicle - The vehicle whose health is displayed.
     * @param maxHealth - The maximum health value (default: 1000).
     * @param line - The line number for positioning (default: 1).
     * @param gxtKey - The GXT key for the bar label (default: "DUMMY").
     */
    public static DisplayVehicleHealthBar(vehicle: Car, maxHealth: int = 1000, line: int = 1, gxtKey: string = "DUMMY"): void {
        this.DisplayBar(vehicle.getHealth(), maxHealth, line, gxtKey);
    }



    private static _calculateLineTopOffset(line: int): float {
        return 128.0 + this.LINE_HEIGHT * line;
    }

    private static _calculateBarWidth(currentValue: int, maxValue: int): float {
        return (currentValue * 100.0) / maxValue;
    }

    private static _calculateBarOffset(barWidth: float): float {
        return (this.BAR_WIDTH - barWidth) * 0.5;
    }

    private static _setupDisplayText(r: int = 172, g: int = 203, b: int = 241, a: int = 255): void {
        Text.SetProportional(true);
        Text.SetFont(TextFont.Menu);
        Text.SetScale(0.48, 2.0);
        Text.SetRightJustify(true);
        Text.SetWrapX(640.0);
        Text.SetEdge(2, 0, 0, 0, 255);
        Text.SetColor(r, g, b, a);
    }

}