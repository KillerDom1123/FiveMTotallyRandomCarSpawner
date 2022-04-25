import { vehicleModels } from '../utils/vehicleModels';

const Delay = (ms: number) => new Promise((res) => setTimeout(res, ms, undefined));

let serverEnabledHud = true;
let serverEnabledTimer = true;
let availableVehicles: string[] = [];

let showHud = true;
let isEnabledText = 'Disabled';
let timeToNextSpawn = 'Forever!';
let spawningCar = false;

RegisterCommand(
    'trcs',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (source: number, args: any) => {
        // Show the HUD
        if (args.includes('hud')) showHud = !showHud;
        //Set the delay
        else if (args.includes('delay')) {
            try {
                const newDelay = parseFloat(args[1]);
                emitNet('setRandomCarSpawnDelay', newDelay);
            } catch (err) {
                console.error(err);
                emit('chat:addMessage', {
                    args: [err],
                });
            }
        } else {
            // Toggles random car spawning on/off
            emit('chat:addMessage', {
                args: [`Random car spawning ${isEnabledText.toLowerCase()}`],
            });
            emitNet('toggleRandomCarSpawn');
        }
    },
    false,
);

setInterval(() => drawText(`Random Car Spawning: ${isEnabledText}`, 0, 0), 0);
setInterval(() => {
    if (isEnabledText && serverEnabledTimer) drawText(`Time Until Next Car: ${timeToNextSpawn}`, 0, 0.03), 0;
}, 0);

const drawText = (text: string, xPos: number, yPos: number) => {
    if (!serverEnabledHud) return;
    SetTextFont(4);
    const scale = 0.5;
    SetTextScale(scale, scale);
    SetTextColour(255, 255, 255, 255);
    SetTextEntry('STRING');
    SetTextDropShadow();
    SetTextOutline();
    AddTextComponentString(text);
    if (showHud) DrawText(xPos, yPos);
};

/**
 * When the server sends out the 'doRandomSpawn' event, choose and
 * spawn in a random vehicle for the player
 *
 * Chooses a random vehicle from the availableVehicles list
 *
 * TODO: Can we make the server choose a random vehicle for every client?
 * Are there any vulnerabilities with letting the client choose the vehicle?
 */
onNet('doRandomSpawn', async () => {
    const model = availableVehicles[Math.floor(Math.random() * vehicleModels.length)];
    if (!model) console.error('[TotallyRandomCarSpawner]: Server has no vehicles set?');
    console.log(`[TotallyRandomCarSpawner]: Chose vehicle ${model}`);
    const hash = GetHashKey(model);
    RequestModel(hash);
    spawningCar = true;
    while (!HasModelLoaded(hash)) {
        await Delay(1000);
    }

    const player = PlayerPedId();
    const playerCoords = GetEntityCoords(player, true);

    let currentSpeed = 0;
    let radioName = GetPlayerRadioStationName();
    if (radioName === null) radioName = 'OFF';

    const currentVehicle = GetVehiclePedIsIn(player, true);
    if (currentVehicle) {
        currentSpeed = GetEntitySpeed(currentVehicle);
        SetEntityAsMissionEntity(currentVehicle, true, true);
        DeleteVehicle(currentVehicle);
    }

    const newVehicle = CreateVehicle(
        hash,
        playerCoords[0],
        playerCoords[1],
        playerCoords[2],
        GetEntityHeading(player),
        true,
        false,
    );
    SetVehicleEngineOn(newVehicle, true, true, false);
    SetPedIntoVehicle(player, newVehicle, -1);
    SetVehRadioStation(newVehicle, radioName);
    SetVehicleForwardSpeed(newVehicle, currentSpeed);
    SetEntityAsNoLongerNeeded(newVehicle);
    SetModelAsNoLongerNeeded(model);
    spawningCar = false;
});

/**
 * Event sent from server to set if random vehicle spawning is
 * enabled or disabled
 */
onNet('setRandomCarSpawn', (enabled: boolean) => {
    isEnabledText = enabled ? 'Enabled' : 'Disabled';
    timeToNextSpawn = enabled ? timeToNextSpawn.toString() : 'Forever!';
});

/**
 * Event sent from server to set the client's configuration
 */
onNet(
    'setRandomCarSpawnConfig',
    (serverArgs: { showHud: boolean; showTimer: boolean; availableVehicles: string[] }) => {
        serverEnabledHud = serverArgs['showHud'];
        serverEnabledTimer = serverArgs['showTimer'];
        availableVehicles = serverArgs['availableVehicles'];
    },
);

/**
 * Event sent from server to set the current timer second
 */
onNet('setRandomCarSpawnTimerText', (currentSecond: number) => {
    if (spawningCar) timeToNextSpawn = '0';
    else timeToNextSpawn = currentSecond.toString();
});
