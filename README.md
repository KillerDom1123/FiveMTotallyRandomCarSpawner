# FiveMTotallyRandomCarSpawner
Fun resource for FiveM servers to spawn in a random vehicle

## Installation
1. Download the `FiveMTotallyRandomCarSpawner.zip` from the [latest release](https://github.com/KillerDom1123/FiveMTotallyRandomCarSpawner/releases)
2. Copy the `TotallyRandomCarSpawner` folder into your server resources directory
3. Add `ensure TotallyRandomCarSpawner` to your `server.cfg`
4. Edit the `random_car_spawner.json` in the `TotallyRandomCarSpawner` resource folder ([See the configuration options below](https://github.com/KillerDom1123/FiveMTotallyRandomCarSpawner#configuration))
5. Restart the server

## Configuration
| **Configuration Name** | **Description**                                                                                                              | **Values**                                         |
|------------------------|------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------|
| showHud                | Enable or disable the HUD completely                                                                                         | Boolean (true/false)                               |
| showTimer              | Enable or disable the timer on the HUD completely                                                                            | Boolean (true/false)                               |
| availableVehicles      | The list of vehicles that can be spawned. Add any modded vehicles in here by their model name (e.g 'police', 'police2', etc) | List of strings (['dinghy', 'tug', 'blista', etc]) |

## Commands
`/trcs` - Server wide, toggle spawning random vehicles for every player

`/trcs hud` - Client side, show/hide hud toggle

`/trcs delay <seconds>` - Server wide, set the interval for spawning a random vehicle, set in seconds

## License (The Short Version)
FiveMTotallyRandomCarSpawner - Fun resource for FiveM servers to spawn in a random vehicle

Copyright (C) 2022 Dom & Contributors

This program Is free software: you can redistribute it And/Or modify it under the terms Of the GNU General Public License As published by the Free Software Foundation, either version 3 Of the License, Or (at your option) any later version.

This program Is distributed In the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty Of MERCHANTABILITY Or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License For more details.

You should have received a copy Of the GNU General Public License along with this program. If Not, see http://www.gnu.org/licenses/.
