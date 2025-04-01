/// Created by wmysterio, 29.03.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../.config/sa.d.ts" />

/** Class for the save system */
export class Save {

    /**
     * Returns a int value from the *.ini file for the specified section
     * @param section Section name in *.ini file
     * @param key Key in the specified section
     * @param defaultValue Default value if load fails
     * @param saveDefaultValue Specify true if you want to save the default value in case of a load error
     * @returns Int value
     */
    public static GetIntFromSection(section: string, key: string, defaultValue: int = 0): int {
        let result = IniFile.ReadInt(Save.savePathToIni, section, key);
        if (result === undefined)
            result = defaultValue;
        return result;
    }

    /**
     * Returns a float value from the *.ini file for the specified section
     * @param section Section name in *.ini file
     * @param key Key in the specified section
     * @param defaultValue Default value if load fails
     * @param saveDefaultValue Specify true if you want to save the default value in case of a load error
     * @returns Float value
     */
    public static GetFloatFromSection(section: string, key: string, defautValue: float = 0.0): float {
        let result = IniFile.ReadFloat(Save.savePathToIni, section, key);
        if (result === undefined)
            result = defautValue;
        return result;
    }

    /**
     * Returns a string value from the *.ini file for the specified section
     * @param section Section name in *.ini file
     * @param key Key in the specified section
     * @param defaultValue Default value if load fails
     * @param saveDefaultValue Specify true if you want to save the default value in case of a load error
     * @returns String value 
     */
    public static GetStringFromSection(section: string, key: string, defaultValue: string = ""): string {
        let result = IniFile.ReadString(Save.savePathToIni, section, key);
        if (result === undefined)
            result = defaultValue;
        return result;
    }

    /**
     * Returns a int value from the *.ini file in the current section
     * @param key Key in the current section
     * @param defaultValue Default value if load fails
     * @param saveDefaultValue Specify true if you want to save the default value in case of a load error 
     * @returns Int value
     */
    public static GetInt(key: string, defaultValue: int = 0, saveDefaultValue: boolean = false): int {
        let result = IniFile.ReadInt(Save.savePathToIni, Save.saveDefaultSectionName, key);
        if (result === undefined) {
            result = defaultValue;
            if (saveDefaultValue)
                Save.SetInt(key, result);
        }
        return result;
    }

    /**
     * Returns a float value from the *.ini file in the current section
     * @param kely Key in the current section
     * @param defaultValue Default value if load fails
     * @param saveDefaultValue Specify true if you want to save the default value in case of a load error 
     * @returns Float value
     */
    public static GetFloat(key: string, defaultValue: float = 0.0, saveDefaultValue: boolean = false): float {
        let result = IniFile.ReadFloat(Save.savePathToIni, Save.saveDefaultSectionName, key);
        if (result === undefined) {
            result = defaultValue;
            if (saveDefaultValue)
                Save.SetFloat(key, result);
        }
        return result;
    }

    /**
     * Returns a string value from the *.ini file in the current section
     * @param key Key in the current section
     * @param defaultValue Default value if load fails
     * @param saveDefaultValue Specify true if you want to save the default value in case of a load error 
     * @returns String value
     */
    public static GetString(key: string, defaultValue: string = "", saveDefaultValue: boolean = false): string {
        let result = IniFile.ReadString(Save.savePathToIni, Save.saveDefaultSectionName, key);
        if (result === undefined) {
            result = defaultValue;
            if (saveDefaultValue)
                Save.SetString(key, result);
        }
        return result;
    }

    /**
     * Saves an int value to a *.ini file in the current section
     * @param key Key in the current section
     * @param value New value
     */
    public static SetInt(key: string, value: int): void { IniFile.WriteInt(value, Save.savePathToIni, Save.saveDefaultSectionName, key); }

    /**
     * Saves an float value to a *.ini file in the current section
     * @param key Key in the current section
     * @param value New value
     */
    public static SetFloat(key: string, value: float): void { IniFile.WriteFloat(value, Save.savePathToIni, Save.saveDefaultSectionName, key); }

    /**
     * Saves an string value to a *.ini file in the current section
     * @param key Key in the current section
     * @param value New value
     */
    public static SetString(key: string, value: string): void { IniFile.WriteString(value, Save.savePathToIni, Save.saveDefaultSectionName, key); }

    /**
     * Increases the value of a saved integer by 1 in the *.ini file in the current section
     * @param key Key in the current section
     * @param defaultValue Default value if load fails
     * @param saveIfDefault Specify true if you want to save the default value in case of a load error
     * @returns Increased int value
     */
    public static IncreaseInt(key: string, defaultValue: int = 0, saveIfDefault: boolean = false): int {
        let newValue = Save.GetInt(key, defaultValue, saveIfDefault) + 1;
        Save.SetInt(key, newValue);
        return newValue;
    }



    private constructor() { }

    //----------------------------------------------------------------------------------------------------

    private static savePathToIni: string = __dirname + "\\Save.game";
    private static saveDefaultSectionName: string = "";
    private static saveIsSectionDisabled: boolean = false;

    /** The method should not do anything! Used for internal work of the framework */
    public static SetDefaultIniSectionName(iniSectionName: string): void {
        if (Save.saveIsSectionDisabled)
            return;
        Save.saveDefaultSectionName = iniSectionName;
        Save.saveIsSectionDisabled = true;
    }

    /** Returns the current section name in the *.ini file */
    public static GetCurrentIniSectionName(): string { return Save.saveDefaultSectionName; }

}