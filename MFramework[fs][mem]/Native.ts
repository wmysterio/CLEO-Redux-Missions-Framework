/** Utility class for native operations with pedestrians. */
export class NativePed {

    /**
     * Retrieves the maximum health of a pedestrian.
     * @param char - The pedestrian character to check.
     * @returns The maximum health value.
     */
    public static GetMaxHealth(char: Char): float {
        return Memory.ReadFloat(Memory.GetPedPointer(char) + 0x544, false);
    }

}

/** Utility class for native camera operations. */
export class NativeCamera {

    private static readonly POINTER: int = 0xB6F028;
    private static readonly _getFadingStatus = Memory.Fn.ThiscallU32(0x50AE20, this.POINTER);

    /**
     * Retrieves the fading status of the game camera.
     * @returns The fading status (e.g., 0 for transparent, 1 for fading in, 2 for opaque).
     */
    public static GetFadingStatus(): int {
        return this._getFadingStatus();
    }

}

/** Utility class for native vehicle operations. */
export class NativeVehicle {

    /**
     * Retrieves the bomb status of a vehicle.
     * @param car - The vehicle to check.
     * @returns The bomb status.
     */
    public static GetBombStatus(car: Car): int {
        return Memory.ReadI8(Memory.GetVehiclePointer(car) + 0x04A8, false);
    }

}