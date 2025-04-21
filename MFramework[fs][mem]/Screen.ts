/// Created by wmysterio, 21.04.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path=".././.config/sa.d.ts" />

/** Class for working with drawing on the screen */
export class Screen {

    /** Draws the specified minutes and seconds. Enable "Text.UseCommands" before using */
    public static DisplayTimer(minutes: int, seconds: int, line: int = 0, gxtKey: string = "BB_19"): void {
        let timerPositionY = 128.0 + 22.0 * line;
        Screen.streenSetTextForDrawing();
        Text.Display(548.0, timerPositionY, gxtKey);
        Screen.streenSetTextForDrawing();
        if (10 > seconds) {
            Text.DisplayWith2Numbers(608.0, timerPositionY, "TIME_0", minutes, seconds);
            return;
        }
        Text.DisplayWith2Numbers(608.0, timerPositionY, "TIME", minutes, seconds);
    }



    /** Draws a counter with the specified value. Enable "Text.UseCommands" before using */
    public static DisplayCounter(value: int, line: int = 1, gxtKey: string = "NUMBER"): void {
        Screen.streenSetTextForDrawing();
        Text.DisplayWithNumber(608.0, 128.0 + (22.0 * line), gxtKey, value);
    }

    /** Draws a counter with two specified values. Enable "Text.UseCommands" before using */
    public static DisplayCounterWith2Numbers(value1: int, value2: int, gxtKey: string, line: int = 1): void {
        Screen.streenSetTextForDrawing();
        Text.DisplayWith2Numbers(608.0, 128.0 + (22.0 * line), gxtKey, value1, value2);
    }



    /** Draws a bar with the specified current and maximum values. Enable "Text.UseCommands" before using */
    public static DisplayBar(currentValue: int, maxValue: int, line: int = 1, gxtKey: string = "DUMMY"): void {
        let barPositionY = 128.0 + line * 22.0;
        Screen.streenSetTextForDrawing();
        Text.Display(496.0, barPositionY, gxtKey);
        barPositionY += 11.0;
        Hud.DrawRect(557.5, barPositionY, 103.0, 7.0, 0, 0, 0, 255);
        Hud.DrawRect(558.0, barPositionY, 100.0, 4.0, 74, 90, 107, 255);
        if (currentValue > maxValue)
            currentValue = maxValue;
        let barSize = ((0 >= maxValue || 0 >= currentValue) ? 0.0 : (currentValue * 100.0) / maxValue);
        Hud.DrawRect(558.0 - (100.0 - barSize) * 0.5, barPositionY, barSize, 4.0, 172, 203, 241, 255);
    }

    /** Draws a health bar for the specified char. Enable "Text.UseCommands" before using */
    public static DisplayBarWithCharHealth(char: Char, maxHealth: int = 100, line: int = 1, gxtKey: string = "DUMMY"): void {
        Screen.DisplayBar(char.getHealth(), maxHealth, line, gxtKey);
    }

    /** Draws a bar with the health of the specified car. Enable "Text.UseCommands" before using */
    public static DisplayBarWithCarHealth(car: Car, maxHealth: int = 1000, line: int = 0, gxtKey: string = "DUMMY"): void {
        Screen.DisplayBar(car.getHealth(), maxHealth, line, gxtKey);
    }




    private static streenSetTextForDrawing(): void {
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