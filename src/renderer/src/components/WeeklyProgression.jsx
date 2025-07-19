import "./WeeklyProgression.scss"
import {useState} from "react";

const DEFAULT_PROGRESSION = [
    {
        name: "GT",
        milestones: [
            {
                name: "BTCC",
                checkpoints: ["RF2"],
                note: "<div><b>Required to pass:</b> top 10</div>",
            },
            {
                name: "GT3",
                checkpoints: ["RF2", "LMU"],
                note: "<div><b>Required to pass:</b> top 7</div>",
            },
            {
                name: "GTE",
                checkpoints: ["RF2", "LMU"],
                note: "<div><b>Required to pass:</b> top 5</div>",
            },
        ],
    },
    {
        name: "LMP",
        milestones: [
            {
                name: "LMP3",
                checkpoints: ["RF2"],
                note: "<div><b>Required to pass:</b> top 10</div>",
            },
            {
                name: "LMP2",
                checkpoints: ["RF2", "LMU"],
                note: "<div><b>Required to pass:</b> top 7</div>",
            },
            {
                name: "LMH",
                checkpoints: ["RF2", "LMU"],
                note: "<div><b>Required to pass:</b> top 5</div><div>Cars to use in RF2: Vanwall, Cadillac DPI</div>",
            },
        ],
    },
    {
        name: "Formula",
        milestones: [
            {
                name: "F4",
                checkpoints: ["RF2"],
                note: "<div><b>Required to pass:</b> top 10</div><div>Cars to use in RF2: Tatuus F4-T014, Tatuus USF-17</div>",
            },
            {
                name: "F3",
                checkpoints: ["RF2"],
                note: "<div><b>Required to pass:</b> top 7</div><div>Cars to use in RF2: Tatuus F.3 T318, Tatuus FT-60, Tatuus MSV F3-T016</div>",
            },
            {
                name: "F2",
                checkpoints: ["RF2"],
                note: "<div><b>Required to pass:</b> top 5</div><div>Cars to use in RF2: Formula2 2012</div>",
            },
            {
                name: "F1",
                checkpoints: ["RF2"],
                note: "<div><b>Required to pass:</b> top 3</div><div>Cars to use in RF2: Formula Pro, Formula ISI 2012</div>",
            },
        ],
    },
];
const LOCAL_STORAGE_WEEKLY_PROGRESSION_PROGRESS = "weeklyProgressionProgress";

export default function WeeklyProgression({className}) {
    const [progress, setProgress] = useState(() => loadProgress(DEFAULT_PROGRESSION));
    const accordionId = "weeklyProgressionAccordion";
    const items = [];
    for (const progression of DEFAULT_PROGRESSION) {
        const collapseId = "collapse" + progression.name;
        const milestonesProgress = progress[progression.name] || [];
        let milestonesCompleted = 0;
        for (let i = 0; i < progression.milestones.length; i++) {
            if (isMilestoneComplete(progression.milestones[i], milestonesProgress[i])) {
                milestonesCompleted++;
            }
        }
        const onMilestoneCheckpointToggle = (milestoneIndex, checkpoint) => saveProgressWithMilestoneCheckpointToggled(
            progress,
            setProgress,
            progression.name,
            milestoneIndex,
            checkpoint
        );
        const onGoToMilestone = (milestoneIndex) => saveProgressStartingWithMilestone(
            progress,
            setProgress,
            progression.name,
            milestoneIndex
        );
        items.push(
            <div key={progression.name} className={"accordion-item"}>
                <h2 className={"accordion-header"}>
                    <button className={"accordion-button collapsed"} type={"button"} data-bs-toggle={"collapse"}
                            data-bs-target={`#${collapseId}`}>
                        {progression.name} ({milestonesCompleted}/{progression.milestones.length})
                    </button>
                </h2>
                <div id={collapseId} className={"accordion-collapse collapse"} data-bs-parent={`#${accordionId}`}>
                    <ProgressionPath milestones={progression.milestones} progress={milestonesProgress}
                                     onMilestoneCheckpointToggle={onMilestoneCheckpointToggle}
                                     onGoToMilestone={onGoToMilestone}/>
                </div>
            </div>
        );
    }
    return <>
        <p className={"mb-2"}>Weekly Progression</p>
        <div id={accordionId} className={`accordion ${className || ""}`}>
            {items}
        </div>
    </>;
}

function loadProgress(progressions) {
    let progress = localStorage.getItem(LOCAL_STORAGE_WEEKLY_PROGRESSION_PROGRESS);
    if (progress) {
        progress = JSON.parse(progress);
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let daysSinceLastTuesday = now.getDay() - 2;
        if (daysSinceLastTuesday < 0) {
            daysSinceLastTuesday += 7;
        }
        const msInDay = 1000 * 60 * 60 * 24;
        const lastTuesdayTs = todayStart.getTime() - daysSinceLastTuesday * msInDay;
        const shouldResetProgress = Date.now() > lastTuesdayTs && progress.timestamp < lastTuesdayTs;
        if (!shouldResetProgress) {
            return progress.progress;
        }
    }
    progress = {};
    for (const progression of progressions) {
        progress[progression.name] = progression.milestones.map(() => []);
    }
    saveProgressInLocalStorage(progress);
    return progress;
}

function saveProgressWithMilestoneCheckpointToggled(
    progress,
    setProgress,
    targetProgressionName,
    targetMilestoneIndex,
    targetCheckpointName
) {
    const newProgress = {};
    for (const progressionName in progress) {
        const newMilestones = [];
        const milestones = progress[progressionName];
        for (let i = 0; i < milestones.length; i++) {
            const newCheckpoints = milestones[i].slice();
            if (targetProgressionName === progressionName && i === targetMilestoneIndex) {
                const checkpointIndex = newCheckpoints.indexOf(targetCheckpointName);
                if (checkpointIndex > -1) {
                    newCheckpoints.splice(checkpointIndex, 1);
                } else {
                    newCheckpoints.push(targetCheckpointName);
                }
            }
            newMilestones.push(newCheckpoints);
        }
        newProgress[progressionName] = newMilestones;
    }
    setProgress(newProgress);
    saveProgressInLocalStorage(newProgress);
}

function saveProgressStartingWithMilestone(
    progress,
    setProgress,
    targetProgressionName,
    targetMilestoneIndex
) {
    const newProgress = {};
    for (const progressionName in progress) {
        const newMilestones = [];
        const milestones = progress[progressionName];
        for (let i = 0; i < milestones.length; i++) {
            if (targetProgressionName === progressionName && i >= targetMilestoneIndex) {
                newMilestones.push([]);
            } else {
                newMilestones.push(milestones[i].slice());
            }
        }
        newProgress[progressionName] = newMilestones;
    }
    setProgress(newProgress);
    saveProgressInLocalStorage(newProgress);
}

function saveProgressInLocalStorage(progress) {
    localStorage.setItem(LOCAL_STORAGE_WEEKLY_PROGRESSION_PROGRESS, JSON.stringify({progress, timestamp: Date.now()}));
}

function ProgressionPath({milestones, progress, onMilestoneCheckpointToggle, onGoToMilestone}) {
    const milestoneNames = [];
    let currentMilestoneIndex = 0;
    let isPreviousMilestoneComplete = false;
    for (let i = 0; i < milestones.length; i++) {
        const isComplete = isMilestoneComplete(milestones[i], progress[i]);
        if (!isComplete && isPreviousMilestoneComplete) {
            currentMilestoneIndex = i;
        }
        milestoneNames.push(milestones[i].name);
        isPreviousMilestoneComplete = isComplete;
    }
    const onCheckpointToggle = checkpointName => onMilestoneCheckpointToggle(currentMilestoneIndex, checkpointName);
    if (isPreviousMilestoneComplete) {
        return <div>
            <MilestoneStepper milestoneNames={milestoneNames} currentMilestoneIndex={milestoneNames.length}
                              onGoToMilestone={onGoToMilestone}/>
            <ProgressionCongratulation/>
        </div>;
    } else {
        return <div>
            <MilestoneStepper milestoneNames={milestoneNames} currentMilestoneIndex={currentMilestoneIndex}
                              onGoToMilestone={onGoToMilestone}/>
            <MilestoneCheckpointRow checkpoints={milestones[currentMilestoneIndex]?.checkpoints || []}
                                    achievedCheckpoints={progress[currentMilestoneIndex] || []}
                                    onCheckpointToggle={onCheckpointToggle}/>
            <MilestoneNote note={milestones[currentMilestoneIndex]?.note}/>
        </div>;
    }
}

function MilestoneStepper({milestoneNames, currentMilestoneIndex, onGoToMilestone}) {
    const items = [];
    for (let i = 0; i < milestoneNames.length; i++) {
        const milestoneName = milestoneNames[i];
        let iconClasses;
        let onClick;
        if (i < currentMilestoneIndex) {
            iconClasses = "bi-check-circle-fill text-success weekly-progression-step-icon-enabled";
            onClick = () => onGoToMilestone(i);
        } else if (i === currentMilestoneIndex) {
            iconClasses = "bi-circle text-primary weekly-progression-step-icon-enabled";
            onClick = () => onGoToMilestone(i);
        } else {
            iconClasses = "bi-x-circle text-secondary";
            onClick = null;
        }
        items.push(
            <div key={milestoneName} className={"d-flex align-items-center m-2"}>
                <i className={`bi ${iconClasses} weekly-progression-step-icon me-2`} onClick={onClick}/> {milestoneName}
            </div>
        );
        if (i !== milestoneNames.length - 1) {
            items.push(<div key={`${milestoneName}-line`} className={"weekly-progression-step-line"}/>);
        }
    }
    return <div className={"d-flex justify-content-between align-items-center"}>
        {items}
    </div>;
}

function MilestoneCheckpointRow({checkpoints, achievedCheckpoints, onCheckpointToggle}) {
    const items = [];
    for (const checkpoint of checkpoints) {
        let buttonClass;
        let buttonContent;
        if (achievedCheckpoints.includes(checkpoint)) {
            buttonClass = "btn-success";
            buttonContent = <><i className={"bi bi-check"}/> {checkpoint}</>;
        } else {
            buttonClass = "btn-outline-success";
            buttonContent = checkpoint;
        }
        items.push(
            <button key={checkpoint} type={"button"} className={`btn ${buttonClass} me-2`}
                    onClick={() => onCheckpointToggle(checkpoint)}>
                {buttonContent}
            </button>
        );
    }
    return <div className={"d-flex p-2"}>
        {items}
    </div>;
}

function MilestoneNote({note}) {
    return <div className={"p-2"} dangerouslySetInnerHTML={{__html: note}}/>;
}

function ProgressionCongratulation() {
    return <div className={"d-flex flex-column justify-content-center align-items-center"}>
        <h4><i className={"bi bi-trophy-fill text-success"}/> Congratulations!</h4>
        <div className={"pb-2"}>You've completed this path</div>
    </div>;
}

function isMilestoneComplete(milestone, progress) {
    return milestone.checkpoints.every(c => progress.includes(c));
}