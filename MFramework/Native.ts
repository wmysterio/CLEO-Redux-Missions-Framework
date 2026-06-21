export class NativePed {

    public static GetMaxHealth(char: Char): float {
        return Memory.ReadFloat(Memory.GetPedPointer(char) + 0x0544, false);
    }

    /*
    public static GetWeaponSkill(char: Char): int {
        return Memory.Fn.ThiscallU8(0x5E6580, Memory.GetPedPointer(char))();
    }

    public static GetWalkAnimationSpeed(char: Char): float {
        return Memory.Fn.ThiscallFloat(0x5E04B0, Memory.GetPedPointer(char))();
    }
    */



    private constructor() { }

}

export class NativeCamera {

    private static readonly POINTER: int = 0xB6F028;
    private static readonly _getFadingStatus = Memory.Fn.ThiscallU32(0x50AE20, this.POINTER);

    public static GetFadingStatus(): int {
        return this._getFadingStatus();
    }



    private constructor() { }

}

export class NativeVehicle {

    public static GetBombStatus(car: Car): int {
        return Memory.ReadI8(Memory.GetVehiclePointer(car) + 0x04A8, false);
    }



    private constructor() { }

}

export class NativeTxdStore {

    //public static readonly AddTxdSlot = Memory.Fn.Cdecl(0x731C80);
    //public static readonly AddRef = Memory.Fn.Cdecl(0x731A00);
    //public static readonly PushCurrentTxd = Memory.Fn.Cdecl(0x7316A0);
    //public static readonly SetCurrentTxd = Memory.Fn.Cdecl(0x7319C0);
    //public static readonly PopCurrentTxd = Memory.Fn.Cdecl(0x7316B0);
    //public static readonly RemoveTxdSlot = Memory.Fn.Cdecl(0x731CD0);
    //public static readonly RemoveScriptTextureDictionary = Memory.Fn.Cdecl(0x465A40);

    public static readonly FindTxdSlot = Memory.Fn.CdeclI32(0x731850);
    public static readonly LoadTxd = Memory.Fn.CdeclU8(0x7320B0);



    private constructor() { }

}