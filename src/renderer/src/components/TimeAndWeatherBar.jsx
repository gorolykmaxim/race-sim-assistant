import {useEffect, useState} from "react";

export default function TimeAndWeatherBar({}) {
    const [timeAndWeather, setTimeAndWeather] = useState();
    const initTimeAndWeather = async () => setTimeAndWeather(await api.initTimeOfDayAndWeatherInAllSims());
    useEffect(
        () => {
            initTimeAndWeather();
        },
        []
    );
    let time = null;
    let weatherIcon = "sun";
    if (timeAndWeather) {
        const timeOfDayInMinutes = timeAndWeather.timeOfDayInMinutes;
        const hours = Math.floor(timeOfDayInMinutes / 60);
        const minutes = timeOfDayInMinutes % 60;
        time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        const weatherGradient = timeAndWeather.weatherGradient;
        if (weatherGradient < 0.25) {
            weatherIcon = "sun";
        } else if (weatherGradient < 0.5) {
            weatherIcon = "cloud-sun";
        } else if (weatherGradient < 0.75) {
            weatherIcon = "cloud-rain";
        } else {
            weatherIcon = "cloud-lightning-rain";
        }
    }
    return <div className={"row py-2"}>
        <div className={"d-flex justify-content-end align-items-center"}>
            <i className={`me-2 bi bi-${weatherIcon}`} style={{fontSize: "1.5 rem"}}></i>
            <span className={"me-3"}>{time}</span>
            <button type={"button"} className={"btn btn-sm btn-outline-secondary"} onClick={initTimeAndWeather}>Refresh</button>
        </div>
    </div>;
}