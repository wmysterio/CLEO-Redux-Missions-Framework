import { BaseMission } from "../BaseMission";
import { Screen } from "../Drawing";
import { ADMIRAL, BALLAS1, FAM1, WMYST } from "../Models";

new class MISSI03 extends BaseMission {

	private friend: Char;
	private enemy: Char;

	public onStartEvent(): void {
		//this.enableProgressSaving = false;

		this.loadModelsNow(FAM1, BALLAS1, WMYST, ADMIRAL);

		this.refreshArea(1779.2375, -2639.5527, 13.5469, 30.0);
		this.putPlayerAt(1779.2375, -2639.5527, 13.5469, 223.4112);
		this.resetCamera();

		let car = this.addCar(ADMIRAL, 1790.4808, -2665.8655, 13.1542, 316.7554);
		this.addNeutralCharInsideCar(WMYST, car);

		this.loadWeaponModelsNow(30);
		this.addPickupWithAmmo(30, 40, 1789.3159, -2643.5605, 13.5469, true);
		this.unloadWeaponModels(30);

		this.friend = this.addFriendChar(FAM1, 1797.7399, -2649.8286, 13.5469, 98.0742);
		this.enemy = this.addEnemyChar(BALLAS1, 1798.0334, -2656.4163, 13.5469, 100.2675);

		this.unloadModels(FAM1, BALLAS1, WMYST, ADMIRAL);
		this.printText("INFO002", 5000);

		this.timer.reset(20000);
	}

	public onUpdateEvent(): void {
		if (0 >= this.timer.millisecondsLeft)
			this.fail("BB_17"); // ~r~Time Expired!
		if (this.isCharDead(this.friend))
			this.fail("INFO003");
		if (this.isCharDead(this.enemy))
			this.complete();

		Text.UseCommands(true);
		Screen.DisplayTimeLeft(this.timer);
		Screen.DisplayCounterWith2Numbers(this.friend.getHealth(), this.getCharMaxHealth(this.friend), 1, "INFO004");
		Screen.DisplayCharHealthBar(this.enemy, 2, "INFO005");
	}

	public onCleanupEvent(): void {
		Text.UseCommands(false);
	}

}