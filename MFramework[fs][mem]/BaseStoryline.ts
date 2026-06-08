import { BaseMission } from "./BaseMission";
import { Core } from "./Core";

/** Abstract base class for managing storylines and their associated missions. */
export abstract class BaseStoryline {

    /**
     * Registers a mission in the core system.
     * @param baseMissionType - The constructor of a BaseMission subclass.
     */
    public addMission<TBaseMission extends BaseMission>(baseMissionType: new () => TBaseMission) {
        Core.RegisterMission(baseMissionType, -1, -1);
    }

    /**
     * Registers a mission in the core system with progress check.
     * @param baseMissionType - The constructor of a BaseMission subclass.
     * @param storylineIndex - The index of the storyline to check (must exist).
     * @param minStorylineProgress - The minimum number of completed missions required.
     */
    public addMissionWithStorylineProgress<TBaseMission extends BaseMission>(baseMissionType: new () => TBaseMission, storylineIndex: int, minStorylineProgress: int) {
        Core.RegisterMission(baseMissionType, storylineIndex, 0 > minStorylineProgress ? 0 : minStorylineProgress);
    }

}