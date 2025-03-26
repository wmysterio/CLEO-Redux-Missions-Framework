/// Created by wmysterio, 26.03.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../.config/sa.d.ts" />

const pathToIni: string = __dirname + "\\Game.sav";

/** Base class for the save system */
export abstract class BaseSave {

    /** @param sectionName Section name in *.ini file */
    constructor(sectionName: string) { this.sectionName = sectionName; }

    /**
     * Returns a int value from the *.ini file for the specified section
     * @param section Section name in *.ini file
     * @param key Key in the specified section
     * @param defaultValue Default value if load fails
     * @param saveDefaultValue Specify true if you want to save the default value in case of a load error
     * @returns Int value
     */
    protected loadIntValueFromSection(section: string, key: string, defaultValue: int = 0, saveDefaultValue: boolean = false): int {
        let result = IniFile.ReadInt(pathToIni, section, key);
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
        let result = IniFile.ReadFloat(pathToIni, section, key);
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
        let result = IniFile.ReadString(pathToIni, section, key);
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
        return this.loadIntValueFromSection(this.sectionName, key, defaultValue, saveDefaultValue);
    }

    /**
     * Returns a float value from the *.ini file in the current section
     * @param key Key in the current section
     * @param defaultValue Default value if load fails
     * @param saveDefaultValue Specify true if you want to save the default value in case of a load error 
     * @returns Float value
     */
    protected loadFloatValue(key: string, defaultValue: float = 0.0, saveDefaultValue: boolean = false): float {
        return this.loadFloatValueFromSection(this.sectionName, key, defaultValue, saveDefaultValue);
    }

    /**
     * Returns a string value from the *.ini file in the current section
     * @param key Key in the current section
     * @param defaultValue Default value if load fails
     * @param saveDefaultValue Specify true if you want to save the default value in case of a load error 
     * @returns String value
     */
    protected loadStringValue(key: string, defaultValue: string = "", saveDefaultValue: boolean = false): string {
        return this.loadStringValueFromSection(this.sectionName, key, defaultValue, saveDefaultValue);
    }

    /**
     * Saves an int value to a *.ini file in the current section
     * @param key Key in the current section
     * @param value New value
     */
    protected saveIntValue(key: string, value: int): void { IniFile.WriteInt(value, pathToIni, this.sectionName, key); }

    /**
     * Saves an float value to a *.ini file in the current section
     * @param key Key in the current section
     * @param value New value
     */
    protected saveFloatValue(key: string, value: float): void { IniFile.WriteFloat(value, pathToIni, this.sectionName, key); }

    /**
     * Saves an string value to a *.ini file in the current section
     * @param key Key in the current section
     * @param value New value
     */
    protected saveStringValue(key: string, value: string): void { IniFile.WriteString(value, pathToIni, this.sectionName, key); }

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

    //----------------------------------------------------------------------------------------------------

    private sectionName: string = "";

}