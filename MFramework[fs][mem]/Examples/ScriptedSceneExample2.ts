import { BaseScriptedScene } from "../BaseScriptedScene";
import { LANDSTAL, WMYST } from "../Models";

let sceneCar: Car;
let sceneChar: Char;

export class ScriptedSceneExample2 extends BaseScriptedScene {

    public onStartEvent(): void {
        this.refreshArea(2452.3093, -1649.698, 13.4468, 100.0);
        this.setCameraPosition(2447.998, -1656.2468, 13.3047);
        this.lookCameraAt(2434.3547, -1645.7083, 13.5132);
        this.loadModelsNow(LANDSTAL, WMYST);
        sceneCar = this.addCar(LANDSTAL, 2420.3801, -1660.4674, 12.9916, 271.7204);
        sceneChar = this.addCharInsideCar(WMYST, sceneCar);
        this.unloadModels(LANDSTAL, WMYST);
    }

    public onRunEvent(): void {
        this.wait(2900)
            .action(function () {
                Task.CarDriveToCoord(sceneChar, sceneCar, 2471.1074, -1662.801, 12.3246, 5.0, 0, 0, 0);
            })
            .wait(100)
            .action(() => {
                this.lookCameraAt(2433.967, -1657.6388, 13.3828, 1);
            })
            .wait(6000);
    }

    public onCleanupEvent(): void {
        this.playerChar.setCoordinates(2443.4963, -1651.0734, 12.402).setHeading(186.0984);
    }

}