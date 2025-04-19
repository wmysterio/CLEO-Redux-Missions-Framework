/// Created by wmysterio, 29.03.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../.config/sa.d.ts" />

/** Class for the save system */
export class Save {

    private static savePathToIni: string = __dirname + "\\Save.game";
    private static saveDefaultSectionName: string = "";
    private static saveIsSectionDisabled: boolean = false;

    private constructor() { }

    /** Sets the difficulty level of the game. The complexity of the game is only formal. You can use it for different purposes */
    public static SetDifficultyGameLevel(difficulty: int): void {
        IniFile.WriteInt(difficulty, Save.savePathToIni, "<GAME_CONFIG>", "Difficulty");
    }

    /**  */
    public static SetCellphoneCallPlayer(state: boolean): void {
        IniFile.WriteInt(state ? 1 : 0, Save.savePathToIni, "<CELLPHONE>", "Calling");
    }

    /** Returns a int value from the *.ini file for the specified section */
    public static GetIntFromSection(section: string, key: string, defaultValue: int = 0): int {
        let result = IniFile.ReadInt(Save.savePathToIni, section, key);
        if (result === undefined)
            result = defaultValue;
        return result;
    }

    /** Returns a float value from the *.ini file for the specified section */
    public static GetFloatFromSection(section: string, key: string, defautValue: float = 0.0): float {
        let result = IniFile.ReadFloat(Save.savePathToIni, section, key);
        if (result === undefined)
            result = defautValue;
        return result;
    }

    /** Returns a string value from the *.ini file for the specified section */
    public static GetStringFromSection(section: string, key: string, defaultValue: string = ""): string {
        let result = IniFile.ReadString(Save.savePathToIni, section, key);
        if (result === undefined)
            result = defaultValue;
        return result;
    }

    /** Returns a int value from the *.ini file in the current section */
    public static GetInt(key: string, defaultValue: int = 0, saveDefaultValue: boolean = false): int {
        let result = IniFile.ReadInt(Save.savePathToIni, Save.saveDefaultSectionName, key);
        if (result === undefined) {
            result = defaultValue;
            if (saveDefaultValue)
                Save.SetInt(key, result);
        }
        return result;
    }

    /** Returns a float value from the *.ini file in the current section */
    public static GetFloat(key: string, defaultValue: float = 0.0, saveDefaultValue: boolean = false): float {
        let result = IniFile.ReadFloat(Save.savePathToIni, Save.saveDefaultSectionName, key);
        if (result === undefined) {
            result = defaultValue;
            if (saveDefaultValue)
                Save.SetFloat(key, result);
        }
        return result;
    }

    /** Returns a string value from the *.ini file in the current section */
    public static GetString(key: string, defaultValue: string = "", saveDefaultValue: boolean = false): string {
        let result = IniFile.ReadString(Save.savePathToIni, Save.saveDefaultSectionName, key);
        if (result === undefined) {
            result = defaultValue;
            if (saveDefaultValue)
                Save.SetString(key, result);
        }
        return result;
    }

    /** Saves an int value to a *.ini file in the current section */
    public static SetInt(key: string, value: int): void {
        IniFile.WriteInt(value, Save.savePathToIni, Save.saveDefaultSectionName, key);
    }

    /** Saves an float value to a *.ini file in the current section */
    public static SetFloat(key: string, value: float): void {
        IniFile.WriteFloat(value, Save.savePathToIni, Save.saveDefaultSectionName, key);
    }

    /** Saves an string value to a *.ini file in the current section */
    public static SetString(key: string, value: string): void {
        IniFile.WriteString(value, Save.savePathToIni, Save.saveDefaultSectionName, key);
    }

    /** Increases the value of a saved integer by 1 in the *.ini file in the current section */
    public static IncreaseInt(key: string, defaultValue: int = 0, saveIfDefault: boolean = false): int {
        let newValue = Save.GetInt(key, defaultValue, saveIfDefault) + 1;
        Save.SetInt(key, newValue);
        return newValue;
    }

    /** The method should not do anything! Used for internal work of the framework */
    public static SetDefaultIniSectionName(iniSectionName: string): void {
        if (Save.saveIsSectionDisabled)
            return;
        Save.saveDefaultSectionName = iniSectionName;
        Save.saveIsSectionDisabled = true;
    }

    /** Returns the current section name in the *.ini file */
    public static GetCurrentIniSectionName(): string {
        return Save.saveDefaultSectionName;
    }

}

Save.SetCellphoneCallPlayer(false);