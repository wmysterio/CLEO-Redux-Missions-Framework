export class NativePed {

    public static GetMaxHealth(char: Char): float {
        return Memory.ReadFloat(Memory.GetPedPointer(char) + 0x544, false);
    }

}

export class NativeCamera {

    private static readonly _pointer: int = 0xB6F028;
    private static readonly _getFadingStatus = Memory.Fn.ThiscallU32(0x50AE20, this._pointer);

    public static GetFadingStatus(): int {
        return this._getFadingStatus();
    }

}

export class NativeVehicle {

    public static GetBombStatus(car: Car): int {
        return Memory.ReadI8(Memory.GetVehiclePointer(car) + 0x04A8, false);
    }

}