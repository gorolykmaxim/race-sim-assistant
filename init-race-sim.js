const os = require("node:os");
const path = require("node:path");
const fs = require("node:fs/promises");

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

async function initAcc(hourOfDay, weatherGradient) {
    const configRootPath = path.join(os.homedir(), "Documents", "Assetto Corsa Competizione", "Config");
    const menuSettingsPath = path.join(configRootPath, "menuSettings.json");
    const menuSettings = await readConfigFile(menuSettingsPath);
    menuSettings.weatherType = "Custom";
    const customRace = menuSettings.seasonRaceEventData?.Free?.raceEventData?.CustomRace;
    if (customRace) {
        console.log(`Time of day: ${hourOfDay}:00`);
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
}

function pickHourOfDay() {
    if (Math.random() < 0.2) {
        // Pick hour any time of day or night
        return Math.round(Math.random() * 24);
    } else {
        // Pick hour from 9:00 to 21:00
        return 9 + Math.round(Math.random() * 12);
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

async function main() {
    const hourOfDay = pickHourOfDay();
    const weatherGradient = pickWeatherGradient();
    await initAcc(hourOfDay, weatherGradient);
}

main();