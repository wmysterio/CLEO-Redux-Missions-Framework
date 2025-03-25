/// <reference path="../.config/sa.d.ts" />

let iniFilePath: string = __dirname + "\\game.sav";

export abstract class BaseSave {

    private sectionName: string = "";

    constructor( sectionName: string ) { this.sectionName = sectionName; }

    protected saveIntValue( key: string, value: int ) : void { IniFile.WriteInt( value, iniFilePath, this.sectionName, key ); }
    protected saveFloatValue( key: string, value: float ) : void { IniFile.WriteFloat( value, iniFilePath, this.sectionName, key ); }
    protected saveStringValue( key: string, value: string ) : void { IniFile.WriteString( value, iniFilePath, this.sectionName, key ); }

    protected loadIntValue( key: string, defaultValue: int = 0, saveIfDefault: boolean = false ) : int {
        let result = IniFile.ReadInt( iniFilePath, this.sectionName, key );
        if( result === undefined ) {
            result = defaultValue;
            if( saveIfDefault )
                this.saveIntValue( key, result );
        }
        return result;
    }
    protected loadFloatValue( key: string, defaultValue: float = 0.0, saveIfDefault: boolean = false ) : float {
        let result = IniFile.ReadFloat( iniFilePath, this.sectionName, key );
        if( result === undefined ) {
            result = defaultValue;
            if( saveIfDefault )
                this.saveFloatValue( key, result );
        }
        return result;
    }
    protected loadStringValue( key: string, defaultValue: string = "", saveIfDefault: boolean = false ) : string {
        let result = IniFile.ReadString( iniFilePath, this.sectionName, key );
        if( result === undefined ) {
            result = defaultValue;
            if( saveIfDefault )
                this.saveStringValue( key, result );
        }
        return result;
    }
    
    protected incrementSavedIntValue( key: string, defaultValue: int = 0, saveIfDefault: boolean = false ) : int { 
        let newValue = this.loadIntValue( key, defaultValue, saveIfDefault ) + 1;
        this.saveIntValue( key, newValue );
        return newValue;
    }

}