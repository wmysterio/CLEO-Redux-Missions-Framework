import { BaseMission } from "../BaseMission";
import { ADMIRAL, BALLAS1, FAM1, WMYST } from "../Models";

new class MISSI01 extends BaseMission {

	private friend: Char;
	private enemy: Char;

	public onStartEvent(): void {
		//this.enableProgressSaving = false;

		this.loadModelsNow(FAM1, BALLAS1, WMYST, ADMIRAL);

		this.refreshArea(1483.7892, -2493.9092, 13.5547, 30.0);
		this.putPlayerAt(1483.7892, -2493.9092, 13.5547, 90.2408);
		this.resetCamera();

		let car = this.addCar(ADMIRAL, 1410.7113, -2483.4412, 13.1667, 147.4876);
		this.addNeutralCharInsideCar(WMYST, car);

		this.loadWeaponModelsNow(30);
		this.addPickupWithAmmo(30, 40, 1411.1488, -2502.3442, 13.5547, true);
		this.unloadWeaponModels(30);

		this.friend = this.addFriendChar(FAM1, 1399.0282, -2500.4514, 13.5547, 270.8676);
		this.enemy = this.addEnemyChar(BALLAS1, 1398.4363, -2493.4631, 13.5547, 267.2758);

		this.unloadModels(FAM1, BALLAS1, WMYST, ADMIRAL);
		this.printText("INFO002", 5000);
	}

	public onUpdateEvent(): void {
		if (this.isCharDead(this.friend))
			this.fail("INFO003");
		if (this.isCharDead(this.enemy))
			this.complete();
	}

}