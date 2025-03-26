/// <reference path="../.config/sa.d.ts" />

let iniFilePath: string = __dirname + "\\game.sav";


    
export abstract class BaseSave {

    private sectionName: string = "";



    constructor( sectionName: string ) { this.sectionName = sectionName; }


    
    protected saveIntValue( key: string, value: int ) : void { IniFile.WriteInt( value, iniFilePath, this.sectionName, key ); }
    protected saveFloatValue( key: string, value: float ) : void { IniFile.WriteFloat( value, iniFilePath, this.sectionName, key ); }
    protected saveStringValue( key: string, value: string ) : void { IniFile.WriteString( value, iniFilePath, this.sectionName, key ); }


    
    protected loadIntValueFromSection( section: string, key: string, defaultValue: int = 0, saveIfDefault: boolean = false ) : int {
        let result = IniFile.ReadInt( iniFilePath, section, key );
        if( result === undefined ) {
            result = defaultValue;
            if( saveIfDefault )
                this.saveIntValue( key, result );
        }
        return result;
    }
    protected loadFloatValueFromSection( section: string, key: string, defaultValue: float = 0.0, saveIfDefault: boolean = false ) : float {
        let result = IniFile.ReadFloat( iniFilePath, section, key );
        if( result === undefined ) {
            result = defaultValue;
            if( saveIfDefault )
                this.saveFloatValue( key, result );
        }
        return result;
    }
    protected loadStringValueFromSection( section: string, key: string, defaultValue: string = "", saveIfDefault: boolean = false ) : string {
        let result = IniFile.ReadString( iniFilePath, section, key );
        if( result === undefined ) {
            result = defaultValue;
            if( saveIfDefault )
                this.saveStringValue( key, result );
        }
        return result;
    }
    protected loadIntValue( key: string, defaultValue: int = 0, saveIfDefault: boolean = false ) : int {
        return this.loadIntValueFromSection( this.sectionName, key, defaultValue, saveIfDefault );
    }
    protected loadFloatValue( key: string, defaultValue: float = 0.0, saveIfDefault: boolean = false ) : float {
        return this.loadFloatValueFromSection( this.sectionName, key, defaultValue, saveIfDefault );
    }
    protected loadStringValue( key: string, defaultValue: string = "", saveIfDefault: boolean = false ) : string {
        return this.loadStringValueFromSection( this.sectionName, key, defaultValue, saveIfDefault );
    }

    


    protected incrementSavedIntValue( key: string, defaultValue: int = 0, saveIfDefault: boolean = false ) : int { 
        let newValue = this.loadIntValue( key, defaultValue, saveIfDefault ) + 1;
        this.saveIntValue( key, newValue );
        return newValue;
    }

}