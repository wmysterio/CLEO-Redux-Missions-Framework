/// Created by wmysterio, 18.04.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../.././.config/sa.d.ts" />

/** Class for working with custom counters */
export class Counter {

    /** Draws a counter with the specified value. Enable "Text.UseCommands" before using */
    public static Display(value: int, line: int = 1, gxtKey: string = "NUMBER"): void {
        Counter.counterSetTextForDrawing();
        Text.DisplayWithNumber(608.0, 128.0 + (22.0 * line), gxtKey, value);
    }

    /** Draws a counter with two specified values. Enable "Text.UseCommands" before using */
    public static DisplayWith2Numbers(value1: int, value2: int, gxtKey: string, line: int = 1): void {
        Counter.counterSetTextForDrawing();
        Text.DisplayWith2Numbers(608.0, 128.0 + (22.0 * line), gxtKey, value1, value2);
    }



    private static counterSetTextForDrawing(): void {
        Text.SetFont(2);
        Text.SetScale(0.5, 2.0);
        Text.SetRightJustify(true);
        Text.SetWrapX(640.0);
        Text.SetDropshadow(0, 0, 0, 0, 0);
        Text.SetEdge(1, 0, 0, 0, 255);
        Text.SetColor(172, 203, 241, 255);
    }

    private constructor() { }

}