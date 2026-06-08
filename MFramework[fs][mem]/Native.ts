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