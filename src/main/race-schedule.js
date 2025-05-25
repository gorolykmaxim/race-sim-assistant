import {parse} from "node-html-parser";

export async function fetchRaceSchedule() {
    try {
        const result = [];
        const url = "https://www.racecontrol.gg";
        const res = await fetch(url);
        const raw = await res.text();
        const html = parse(raw);
        for (const section of html.querySelectorAll("body div.container section")) {
            if ("Upcoming Daily Races" !== section.querySelector("div h3")?.innerHTML) {
                continue;
            }
            const gameSchedule = {
                logoImageUrl: url + section.querySelector("div div img").getAttribute("src"),
                races: [],
            };
            for (const card of section.querySelectorAll("div.scheduled-race-card")) {
                const raceHeaders = card.querySelectorAll("div.race-info div.race_header span");
                gameSchedule.races.push({
                    name: card.querySelector("div.race-info h4").innerHTML.trim(),
                    logoImageUrl: card.querySelector("div a img").getAttribute("src"),
                    trackName: raceHeaders[raceHeaders.length - 1].innerHTML.trim()
                });
            }
            result.push(gameSchedule);
        }
        return result;
    } catch (e) {
        console.log("Failed to fetch schedule");
        console.log(e);
        return [];
    }
}