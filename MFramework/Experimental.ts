import { Core } from "./Core";
import { Logger } from "./Logger";
import { NativeTxdStore } from "./Native";

export class Experimental {

    /**
     * Loads the texture dictionary from project directory for use in drawing sprites (038D) on the screen.
     * @param name - The file name
     * @param spriteNamesToLoad - Texture names (max: 128 names)
     */
    public static LoadTxdDictionary(name: string, ...spriteNamesToLoad: string[]): void {
        const path = `${Core.GetProjectInfoAt(Core.ActiveMissionInfo.projectIndex).rootDirectory}\\${name}.txd`
        const pathLength = path.length;
        //log(path);
        if (!Fs.DoesFileExist(path))
            Logger.Exit(`File '${path}' not found!`);
        if (pathLength > 258)
            Logger.Exit(`Incorrect path '${path}' length!`);
        const pScriptSlotName = Core.WriteStringToMemory("script");
        if (pScriptSlotName.pointer !== undefined) {
            const slot = NativeTxdStore.FindTxdSlot(pScriptSlotName.pointer);
            //log(`slot: ${slot}`);
            Memory.Free(pScriptSlotName.pointer);
            const pPath = Core.WriteStringToMemory(path);
            if (pPath.pointer !== undefined) {
                const state = NativeTxdStore.LoadTxd(slot, pPath.pointer);
                Memory.Free(pPath.pointer);
                if (state === 0)
                    Logger.Exit(`Cannot read file '${path}'!`);
                let spriteNamesToLoadLength = spriteNamesToLoad.length;
                if (spriteNamesToLoadLength > 128)
                    Logger.Exit(`Overflow memory slots!`);
                for (let i = 0, j = 1; i < spriteNamesToLoadLength; ++i, ++j)
                    Txd.LoadSprite(j, spriteNamesToLoad[i]);
                return;
            }
        }
        Logger.Exit(`Failed allocate memory!`);
    }



    private constructor() { }

}