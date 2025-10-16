import {JSDOM} from "jsdom";

async function fetchLMURF2RaceSchedules() {
    try {
        const result = [];
        const url = "https://www.racecontrol.gg";
        const res = await fetch(url);
        const raw = await res.text();
        const dom = new JSDOM(raw);
        for (const section of dom.window.document.querySelectorAll("body div.container section")) {
            if ("Upcoming Daily Races" !== section.querySelector(":scope > div h2")?.innerHTML) {
                continue;
            }
            const gameSchedule = {
                logoImageUrl: url + section.querySelector(":scope > div div img").getAttribute("src"),
                races: [],
            };
            for (const card of section.querySelectorAll("div.scheduled-race-card")) {
                const raceHeaders = card.querySelectorAll("div.race-info div.race-header span");
                gameSchedule.races.push({
                    name: card.querySelector("div.race-info h4").innerHTML.trim(),
                    logoImageUrl: card.querySelector(":scope > div a img").getAttribute("src"),
                    trackName: raceHeaders[raceHeaders.length - 1].innerHTML.trim()
                });
            }
            result.push(gameSchedule);
        }
        return result;
    } catch (e) {
        console.log("Failed to fetch LMU/RF2 schedule");
        console.log(e);
        return [];
    }
}

async function fetchLFMRaceSchedule() {
    try {
        const lfmUrl = "https://lowfuelmotorsport.com";
        const res = await fetch("https://api3.lowfuelmotorsport.com/api/seasons/getMinifiedSeasonBySim");
        const json = await res.json();
        const accSeries = Object.values(json["series"]).find(v => v["simulation"] === "Assetto Corsa Competizione");
        const races = [];
        const GT3_CLASS = 0;
        const GT4_CLASS = 1;
        const tracks = [new Set(), new Set()];
        for (const series of accSeries["series"]) {
            if (series["event_style"] !== "daily") {
                continue;
            }
            const name = series["series_name"];
            const nameUpper = name.toUpperCase();
            let seriesClass;
            if (nameUpper.indexOf("GT3") !== -1) {
                seriesClass = GT3_CLASS;
            } else if (nameUpper.indexOf("GT4") !== -1) {
                seriesClass = GT4_CLASS;
            } else {
                continue;
            }
            const trackName = series["active_track"]["track_name"];
            const classTracks = tracks[seriesClass];
            if (classTracks.has(trackName)) {
                continue;
            }
            races.push({
                name: name,
                logoImageUrl: lfmUrl + "/assets/img/seriesbg/" + series["background"],
                trackName,
            });
            classTracks.add(trackName);
        }
        return [{
            logoImageUrl: lfmUrl + accSeries["icon_big"],
            races,
        }];
    } catch (e) {
        console.log("Failed to fetch LFM schedule");
        console.log(e);
        return [];
    }
}

export async function fetchRaceSchedule() {
    const results = await Promise.all([
        fetchLMURF2RaceSchedules(),
        fetchLFMRaceSchedule()
    ]);
    return results.flat();
}