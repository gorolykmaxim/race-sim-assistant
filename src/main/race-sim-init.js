const os = require("node:os");
const process = require("node:process");
const path = require("node:path");
const fs = require("node:fs/promises");

let CURRENT_INIT_PROMISE = null;

async function readConfigFile(path) {
    const configData = await fs.readFile(path, {encoding: "utf8"});
    return JSON.parse(configData);
}

async function writeConfigFile(path, obj) {
    try {
        await fs.copyFile(path, path + ".backup", fs.constants.COPYFILE_EXCL);
    } catch (e) {
    }
    await fs.rm(path, {force: true});
    await fs.writeFile(path, JSON.stringify(obj));
}

function calculateTemperature(weatherGradient) {
    return Math.round(30 - weatherGradient * 10);
}

async function initAc(timeOfDayInMinutes, weatherGradient) {
    const configRootPath = path.join(
        process.env.LOCALAPPDATA,
        "AcTools Content Manager",
        "Presets",
        "Quick Drive"
    );
    const temperature = calculateTemperature(weatherGradient);
    const timeOfDayInSeconds = timeOfDayInMinutes * 60;
    const hours = Math.floor(timeOfDayInMinutes / 60);
    const minutes = timeOfDayInMinutes % 60;
    console.log(`AC time of day: ${hours}:${minutes.toString().padStart(2, "0")}`);
    let weatherId;
    if (weatherGradient < 0.1) {
        weatherId = "*15";
        console.log("AC weather: clear");
    } else if (weatherGradient < 0.2) {
        weatherId = "*16";
        console.log("AC weather: few clouds");
    } else if (weatherGradient < 0.3) {
        weatherId = "*17";
        console.log("AC weather: scattered clouds");
    } else if (weatherGradient < 0.4) {
        weatherId = "*18";
        console.log("AC weather: broken clouds");
    } else if (weatherGradient < 0.5) {
        weatherId = "*19";
        console.log("AC weather: overcast clouds");
    } else if (weatherGradient < 0.66) {
        weatherId = "*6";
        console.log("AC weather: light rain");
    } else if (weatherGradient < 0.82) {
        weatherId = "*7";
        console.log("AC weather: rain");
    } else {
        weatherId = "*8";
        console.log("AC weather: heavy rain");
    }
    for (const preset of ["imsa", "f1", "f2", "f3", "f4"]) {
        try {
            const presetPath = path.join(configRootPath, preset + ".cmpreset");
            const presetData = await readConfigFile(presetPath);
            presetData.Temperature = temperature;
            presetData.Time = timeOfDayInSeconds;
            presetData.WeatherId = weatherId;
            await writeConfigFile(presetPath, presetData);
        } catch (e) {
            console.log(`Failed to initialize AC ${preset}`);
            console.log(e);
        }
    }
}

async function initAcc(timeOfDayInMinutes, weatherGradient) {
    try {
        const configRootPath = path.join(os.homedir(), "Documents", "Assetto Corsa Competizione", "Config");
        const menuSettingsPath = path.join(configRootPath, "menuSettings.json");
        const menuSettings = await readConfigFile(menuSettingsPath);
        menuSettings.weatherType = "Custom";
        const customRace = menuSettings.seasonRaceEventData?.Free?.raceEventData?.CustomRace;
        if (customRace) {
            const hourOfDay = Math.floor(timeOfDayInMinutes / 60);
            console.log(`ACC time of day: ${hourOfDay}:00`);
            customRace.p1_TimeOfDay = hourOfDay;
            customRace.q_TimeOfDay = hourOfDay;
            customRace.r1_TimeOfDay = hourOfDay;
        }
        await writeConfigFile(menuSettingsPath, menuSettings);
        let weather;
        let track = {
            "idealLineGrip": 0.9800000190734864,
            "outsideLineGrip": 0.0,
            "wetLevel": 0.0,
            "puddlesLevel": 0.0,
            "wetDryLineLevel": 0.0,
            "marblesLevel": 0.0
        };
        if (weatherGradient < 0.16) {
            console.log("ACC weather: clear");
            weather = {
                "ambientTemperature": 27.0,
                "roadTemperature": 38.0,
                "windSpeed": 0.0,
                "windDirection": 0.0,
                "cloudLevel": 0.25,
                "rainLevel": 0.0
            };
        } else if (weatherGradient < 0.32) {
            console.log("ACC weather: light cloudy");
            weather = {
                "ambientTemperature": 27.0,
                "roadTemperature": 38.0,
                "windSpeed": 0.0,
                "windDirection": 0.0,
                "cloudLevel": 0.40,
                "rainLevel": 0.0
            };
        } else if (weatherGradient < 0.5) {
            console.log("ACC weather: cloudy");
            weather = {
                "ambientTemperature": 22.0,
                "roadTemperature": 27.0,
                "windSpeed": 0.0,
                "windDirection": 0.0,
                "cloudLevel": 0.550000011920929,
                "rainLevel": 0.0
            };
        } else if (weatherGradient < 0.625) {
            console.log("ACC weather: light rain");
            weather = {
                "ambientTemperature": 21.0,
                "roadTemperature": 26.0,
                "windSpeed": 0.0,
                "windDirection": 0.0,
                "cloudLevel": 0.6200000047683716,
                "rainLevel": 0.119999997317791
            };
            track.wetLevel = 0.10999999940395357;
            track.puddlesLevel = 0.20000000298023225;
            track.wetDryLineLevel = 0.10999999940395357;
        } else if (weatherGradient < 0.75) {
            console.log("ACC weather: medium rain");
            weather = {
                "ambientTemperature": 20.0,
                "roadTemperature": 19.0,
                "windSpeed": 0.0,
                "windDirection": 0.0,
                "cloudLevel": 0.699999988079071,
                "rainLevel": 0.27000001072883608
            };
            track.wetLevel = 0.20000000298023225;
            track.puddlesLevel = 0.30000001192092898;
            track.wetDryLineLevel = 0.20000000298023225;
        } else if (weatherGradient < 0.875) {
            console.log("ACC weather: heavy rain");
            weather = {
                "ambientTemperature": 14.0,
                "roadTemperature": 13.0,
                "windSpeed": 0.0,
                "windDirection": 0.0,
                "cloudLevel": 0.8799999952316284,
                "rainLevel": 0.6200000047683716
            };
            track.wetLevel = 0.4000000059604645;
            track.puddlesLevel = 0.4000000059604645;
            track.wetDryLineLevel = 0.4000000059604645;
        } else {
            console.log("ACC weather: storm");
            weather = {
                "ambientTemperature": 11.0,
                "roadTemperature": 10.0,
                "windSpeed": 0.0,
                "windDirection": 0.0,
                "cloudLevel": 1.0,
                "rainLevel": 0.8999999761581421
            };
            track.wetLevel = 0.699999988079071;
            track.puddlesLevel = 0.699999988079071;
            track.wetDryLineLevel = 0.699999988079071;
        }
        await writeConfigFile(path.join(configRootPath, "weatherStatus.json"), weather);
        await writeConfigFile(path.join(configRootPath, "trackStatus.json"), track);
    } catch (e) {
        console.log("Failed to initialize ACC");
        console.log(e);
    }
}

function calculateLmuSky(weatherGradient) {
    if (weatherGradient < 0.1) {
        console.log("LMU weather: clear");
        return 0;
    } else if (weatherGradient < 0.2) {
        console.log("LMU weather: light clouds");
        return 1;
    } else if (weatherGradient < 0.3) {
        console.log("LMU weather: partially cloudy");
        return 2;
    } else if (weatherGradient < 0.4) {
        console.log("LMU weather: mostly cloudy");
        return 3;
    } else if (weatherGradient < 0.5) {
        console.log("LMU weather: overcast");
        return 4;
    } else if (weatherGradient < 0.58) {
        console.log("LMU weather: cloudy & drizzle");
        return 5;
    } else if (weatherGradient < 0.66) {
        console.log("LMU weather: cloudy & light rain");
        return 6;
    } else if (weatherGradient < 0.74) {
        console.log("LMU weather: overcast & light rain");
        return 7;
    } else if (weatherGradient < 0.82) {
        console.log("LMU weather: overcast & rain");
        return 8;
    } else if (weatherGradient < 0.90) {
        console.log("LMU weather: overcast & heavy rain");
        return 9;
    } else {
        console.log("LMU weather: overcast & storm");
        return 10;
    }
}

function createLmuWeather(i, sky, weatherGradient) {
    const duration = 30;
    return {
        "Duration": duration,
        "Humidity": Math.round(60 + weatherGradient * 30),
        "RainChance": Math.round(weatherGradient < 0.5 ? 0 : 70 + (weatherGradient - 0.5) * 60),
        "Sky": sky,
        "StartTime": 540 + i * duration,
        "Temperature": calculateTemperature(weatherGradient),
        "WindDirection": 2,
        "WindSpeed": Math.round(Math.random() * 14)
    };
}

function createLmuSessionWeather(sky, weatherGradient, realRoadPreset) {
    const weather = [];
    for (let i = 0; i < 5; i++) {
        weather.push(createLmuWeather(i, sky, weatherGradient));
    }
    return {
        "Road": {
            "LoadTemperaturesFromRealRoadFile": false,
            "RealRoad": `preset:${realRoadPreset}.RRBIN`,
            "WaterDepth": weatherGradient < 0.5 ? 0 : weatherGradient * 0.75
        },
        "Weather": weather
    };
}

async function initLmu(timeOfDayInMinutes, weatherGradient) {
    try {
        const configRootPath = path.join(
            process.env["ProgramFiles(x86)"],
            "Steam",
            "steamapps",
            "common",
            "Le Mans Ultimate",
            "UserData",
            "player"
        );
        const settingsPath = path.join(configRootPath, "Settings.json");
        const settings = await readConfigFile(settingsPath);
        const raceConditions = settings['Race Conditions'];
        if (raceConditions) {
            const hours = Math.floor(timeOfDayInMinutes / 60);
            const minutes = timeOfDayInMinutes % 60;
            timeOfDayInMinutes -= minutes;
            if (minutes > 30) {
                timeOfDayInMinutes += 30;
                console.log(`LMU time of day: ${hours}:30`);
            } else {
                console.log(`LMU time of day: ${hours}:00`);
            }
            raceConditions['Practice1StartingTime'] = timeOfDayInMinutes;
            raceConditions['QualifyingStartingTime'] = timeOfDayInMinutes;
            raceConditions['RaceStartingTime'] = timeOfDayInMinutes;
        }
        await writeConfigFile(settingsPath, settings);
        const trackWeather = {};
        const sky = calculateLmuSky(weatherGradient);
        trackWeather["Practice"] = createLmuSessionWeather(sky, weatherGradient, "LIGHT");
        trackWeather["Qualifying"] = createLmuSessionWeather(sky, weatherGradient, "MEDIUM");
        trackWeather["Race"] = createLmuSessionWeather(sky, weatherGradient, "HEAVY");
        const weatherRootPath = path.join(configRootPath, "Settings");
        await writeConfigFile(path.join(weatherRootPath, "Bahrain", "BAHRAINWEC_ENDCEs.wet"), trackWeather);
        await writeConfigFile(path.join(weatherRootPath, "Bahrain", "BAHRAINWEC_OUTERs.wet"), trackWeather);
        await writeConfigFile(path.join(weatherRootPath, "Bahrain", "BAHRAINWEC_PADDOCKs.wet"), trackWeather);
        await writeConfigFile(path.join(weatherRootPath, "Bahrain", "BAHRAINWECs.wet"), trackWeather);
        await writeConfigFile(path.join(weatherRootPath, "Circuit Of The Americas", "COTAWEC_NATIONALs.wet"), trackWeather);
        await writeConfigFile(path.join(weatherRootPath, "Circuit Of The Americas", "COTAWECs.wet"), trackWeather);
        await writeConfigFile(path.join(weatherRootPath, "Fuji", "FUJIWECs.wet"), trackWeather);
        await writeConfigFile(path.join(weatherRootPath, "Fuji_Cl", "FUJIWEC_CLs.wet"), trackWeather);
        await writeConfigFile(path.join(weatherRootPath, "Imola", "IMOLAWECs.wet"), trackWeather);
        await writeConfigFile(path.join(weatherRootPath, "Interlagos", "INTERLAGOSWECs.wet"), trackWeather);
        await writeConfigFile(path.join(weatherRootPath, "Lemans", "LEMANSWEC_MULSANNEs.wet"), trackWeather);
        await writeConfigFile(path.join(weatherRootPath, "Lemans", "LEMANSWECs.wet"), trackWeather);
        await writeConfigFile(path.join(weatherRootPath, "Monza", "MONZAWEC_GRANDEs.wet"), trackWeather);
        await writeConfigFile(path.join(weatherRootPath, "Monza", "MONZAWECs.wet"), trackWeather);
        await writeConfigFile(path.join(weatherRootPath, "Portimao", "PORTIMAOWECs.wet"), trackWeather);
        await writeConfigFile(path.join(weatherRootPath, "Sebring", "SEBRINGWEC_SCHOOLs.wet"), trackWeather);
        await writeConfigFile(path.join(weatherRootPath, "Sebring", "SEBRINGWECs.wet"), trackWeather);
        await writeConfigFile(path.join(weatherRootPath, "Spa", "SPAWECs.wet"), trackWeather);
        await writeConfigFile(path.join(weatherRootPath, "Spa_Endce", "SPAWEC_ENDCEs.wet"), trackWeather);
    } catch (e) {
        console.log("Failed to initialize LMU");
        console.log(e);
    }
}

function pickTimeOfDayInMinutes() {
    if (Math.random() < 0.2) {
        // Pick time of day or night
        return Math.round(Math.random() * 24 * 60);
    } else {
        // Pick time from 9:00 to 21:00
        return Math.round((9 + Math.random() * 12) * 60);
    }
}

function pickWeatherGradient() {
    // Weather gradient is a gradient of weather conditions where 0 is sunny and clear and 1 is maximum rain and cloudy.
    // Any value that is greater than 0.5 is at least some form of a rain.
    if (Math.random() < 0.2) {
        // Pick any weather (including rain)
        return Math.random();
    } else {
        // Pick any weather that has no rain
        return Math.random() / 2;
    }
}

export async function initTimeOfDayAndWeatherInAllSims() {
    const timeOfDayInMinutes = pickTimeOfDayInMinutes();
    const weatherGradient = pickWeatherGradient();
    if (CURRENT_INIT_PROMISE) {
        await CURRENT_INIT_PROMISE;
    }
    CURRENT_INIT_PROMISE = Promise.all([
        initAc(timeOfDayInMinutes, weatherGradient),
        initAcc(timeOfDayInMinutes, weatherGradient),
        initLmu(timeOfDayInMinutes, weatherGradient)
    ]);
    await CURRENT_INIT_PROMISE;
    CURRENT_INIT_PROMISE = null;
    return {timeOfDayInMinutes, weatherGradient};
}