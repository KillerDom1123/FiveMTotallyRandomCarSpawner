import * as fs from 'fs';
import { vehicleModels } from '../utils/vehicleModels';

console.log('[TotallyRandomCarSpawner]: Server Resource Started');

const configName = `${GetResourcePath(GetCurrentResourceName())}/random_car_spawner.json`;

let showHud: boolean;
let showTimer: boolean;
let availableVehicles: string[];

let randomEnabled = false;
let delay = 10; // In seconds
let currentSecond = delay + 1;

let randomRespawnIntervalId: void | NodeJS.Timer;
let timerIntervalId: void | NodeJS.Timer;

/**
 * If a config file does not exist, this will be the contents of it
 */
const defaultConfig = `{
    "showHud": true,
    "showTimer": true,
    "availableVehicles": [
        "${vehicleModels.join('",\n        "')}"
    ]
}`;

/**
 * Creates a config file if it does not exist.
 * Read the config file to set "showHud", "showTimer" and "availableVehicles".
 */
fs.access(configName, fs.constants.F_OK, async (err) => {
    if (err) {
        if (err.code === 'ENOENT') {
            // File doesn't exist
            console.log(`[TotallyRandomCarSpawner]: Creating config "${configName}"`);
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            fs.writeFile(configName, defaultConfig, () => {});
        }
    }
    //file exists
    console.log(`[TotallyRandomCarSpawner]: Loaded config "${configName}"`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fs.readFile(configName, { encoding: 'utf8' }, (err: any, data: any) => {
        setImmediate(() => {
            const loadedConfig = JSON.parse(data);
            showHud = loadedConfig['showHud'];
            showTimer = loadedConfig['showTimer'];
            availableVehicles = loadedConfig['availableVehicles'];
        });
        setClientConfigs(-1);
    });
});

/**
 * When a player joins set their 'configuration'
 */
onNet('playerJoining', (source: number) => setClientConfigs(source));

/**
 * When a user in the game uses the /trcs command to toggle on/off
 */
onNet('toggleRandomCarSpawn', () => {
    randomEnabled = !randomEnabled;
    console.log('[TotallyRandomCarSpawner]: triggerRandomCarSpawn', randomEnabled);
    setClientConfigs(-1);
    currentSecond = delay + 1;
    stopStartInterval();
});

/**
 * When a user in the game uses /trcs delay <newDelay> to set
 * the spawn interval in seconds
 */
onNet('setRandomCarSpawnDelay', (newDelay: number) => {
    delay = newDelay;
    currentSecond = newDelay + 1;
    stopStartInterval();
});

/**
 * Sets all the 'configurations' for the client, including if the spawning is on/off
 * as well as the other configs (show HUD, show timer, list of vehicles, etc)
 * @param source - The player's ID on the server
 */
const setClientConfigs = (source: number) => {
    emitNet('setRandomCarSpawn', source, randomEnabled);
    emitNet('setRandomCarSpawnConfig', source, { showHud, showTimer, availableVehicles });
};

/**
 * Shortcut to stop the interval to spawn a car and the timer interval
 * Sets the itnervals again if randomEnables is true (If the spawning is toggled on)
 */
const stopStartInterval = () => {
    if (randomRespawnIntervalId) clearInterval(randomRespawnIntervalId);
    if (timerIntervalId) clearInterval(timerIntervalId);

    if (randomEnabled) randomRespawnIntervalId = setInterval(doRandomSpawn, delay * 1000);
    if (randomEnabled) timerIntervalId = setInterval(setTimer, 1000);
};

/**
 * Sets the timer that gets sent to the player
 * The timer is how long is left until the player receives a random car
 */
const setTimer = () => {
    currentSecond -= 1;
    emitNet('setRandomCarSpawnTimerText', -1, currentSecond);
};

/**
 * Tells all clients to spawn a random car
 * Sets the currentSecond for the timer to the original delay
 */
const doRandomSpawn = () => {
    if (!randomEnabled) return;

    emitNet('doRandomSpawn', -1);
    currentSecond = delay + 1;
};
