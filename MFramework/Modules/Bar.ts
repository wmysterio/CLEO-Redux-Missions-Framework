/// Created by wmysterio, 18.04.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../.././.config/sa.d.ts" />

/** Class for working with custom bars */
export class Bar {

    /** Draws a bar with the specified current and maximum values. Enable "Text.UseCommands" before using */
    public static Display(currentValue: int, maxValue: int, line: int = 1, gxtKey: string = "DUMMY"): void {
        let barPositionY = 128.0 + line * 22.0;
        Bar.barSetTextForDrawing();
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
    public static DisplayCharHeadlth(char: Char, line: int = 1, gxtKey: string = "DUMMY"): void {
        Bar.Display(char.getHealth(), char.getMaxHealth(), line, gxtKey);
    }

    /** Draws a bar with the health of the specified car. Enable "Text.UseCommands" before using */
    public static DisplayCarHeadlth(car: Car, maxValue: int = 1000, line: int = 0, gxtKey: string = "DUMMY"): void {
        Bar.Display(car.getHealth(), maxValue, line, gxtKey);
    }



    private static barSetTextForDrawing(): void {
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