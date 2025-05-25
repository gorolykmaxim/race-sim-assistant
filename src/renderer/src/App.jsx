import TimeAndWeatherBar from "./components/TimeAndWeatherBar";
import RaceSchedule from "./components/RaceSchedule";

export default function App() {
    return (
        <>
            <div className="container">
                <TimeAndWeatherBar/>
                <RaceSchedule/>
            </div>
        </>
    );
}