/// Created by wmysterio, 26.03.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../.config/sa.d.ts" />

/** Base class for the save system */
export abstract class BaseSave {

    /**
     * Returns a int value from the *.ini file for the specified section
     * @param section Section name in *.ini file
     * @param key Key in the specified section
     * @param defaultValue Default value if load fails
     * @param saveDefaultValue Specify true if you want to save the default value in case of a load error
     * @returns Int value
     */
    protected loadIntValueFromSection(section: string, key: string, defaultValue: int = 0, saveDefaultValue: boolean = false): int {
        let result = IniFile.ReadInt(BaseSave.baseSavePathToIni, section, key);
        if (result === undefined) {
            result = defaultValue;
            if (saveDefaultValue)
                this.saveIntValue(key, result);
        }
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
    protected loadFloatValueFromSection(section: string, key: string, defaultValue: float = 0.0, saveDefaultValue: boolean = false): float {
        let result = IniFile.ReadFloat(BaseSave.baseSavePathToIni, section, key);
        if (result === undefined) {
            result = defaultValue;
            if (saveDefaultValue)
                this.saveFloatValue(key, result);
        }
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
    protected loadStringValueFromSection(section: string, key: string, defaultValue: string = "", saveDefaultValue: boolean = false): string {
        let result = IniFile.ReadString(BaseSave.baseSavePathToIni, section, key);
        if (result === undefined) {
            result = defaultValue;
            if (saveDefaultValue)
                this.saveStringValue(key, result);
        }
        return result;
    }

    /**
     * Returns a int value from the *.ini file in the current section
     * @param key Key in the current section
     * @param defaultValue Default value if load fails
     * @param saveDefaultValue Specify true if you want to save the default value in case of a load error 
     * @returns Int value
     */
    protected loadIntValue(key: string, defaultValue: int = 0, saveDefaultValue: boolean = false): int {
        return this.loadIntValueFromSection(this.baseSaveIniSectionName, key, defaultValue, saveDefaultValue);
    }

    /**
     * Returns a float value from the *.ini file in the current section
     * @param key Key in the current section
     * @param defaultValue Default value if load fails
     * @param saveDefaultValue Specify true if you want to save the default value in case of a load error 
     * @returns Float value
     */
    protected loadFloatValue(key: string, defaultValue: float = 0.0, saveDefaultValue: boolean = false): float {
        return this.loadFloatValueFromSection(this.baseSaveIniSectionName, key, defaultValue, saveDefaultValue);
    }

    /**
     * Returns a string value from the *.ini file in the current section
     * @param key Key in the current section
     * @param defaultValue Default value if load fails
     * @param saveDefaultValue Specify true if you want to save the default value in case of a load error 
     * @returns String value
     */
    protected loadStringValue(key: string, defaultValue: string = "", saveDefaultValue: boolean = false): string {
        return this.loadStringValueFromSection(this.baseSaveIniSectionName, key, defaultValue, saveDefaultValue);
    }

    /**
     * Saves an int value to a *.ini file in the current section
     * @param key Key in the current section
     * @param value New value
     */
    protected saveIntValue(key: string, value: int): void { IniFile.WriteInt(value, BaseSave.baseSavePathToIni, this.baseSaveIniSectionName, key); }

    /**
     * Saves an float value to a *.ini file in the current section
     * @param key Key in the current section
     * @param value New value
     */
    protected saveFloatValue(key: string, value: float): void { IniFile.WriteFloat(value, BaseSave.baseSavePathToIni, this.baseSaveIniSectionName, key); }

    /**
     * Saves an string value to a *.ini file in the current section
     * @param key Key in the current section
     * @param value New value
     */
    protected saveStringValue(key: string, value: string): void { IniFile.WriteString(value, BaseSave.baseSavePathToIni, this.baseSaveIniSectionName, key); }

    /**
     * Increases the value of a saved integer by 1 in the *.ini file in the current section
     * @param key Key in the current section
     * @param defaultValue Default value if load fails
     * @param saveIfDefault Specify true if you want to save the default value in case of a load error
     * @returns Increased int value
     */
    protected saveIntValueIncrease(key: string, defaultValue: int = 0, saveIfDefault: boolean = false): int {
        let newValue = this.loadIntValue(key, defaultValue, saveIfDefault) + 1;
        this.saveIntValue(key, newValue);
        return newValue;
    }



    constructor(iniSectionName: string) { this.baseSaveIniSectionName = iniSectionName; }

    //----------------------------------------------------------------------------------------------------

    private static baseSavePathToIni: string = __dirname + "\\Game.sav";

    private baseSaveIniSectionName: string = "";

}