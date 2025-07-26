import "./WeeklyProgression.scss"
import {useState} from "react";
import {produce} from "immer";

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
                name: "GT3/LMH Mixed",
                checkpoints: ["LMU"],
                note: "<div><b>Required to pass:</b> top 5</div><div>You are taking part in a GT3 car</div>",
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
            {
                name: "GT3/LMH Mixed",
                checkpoints: ["LMU"],
                note: "<div><b>Required to pass:</b> top 5</div><div>You are taking part in an LMH car</div>",
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
const LOCAL_STORAGE_WEEKLY_PROGRESSION = "weeklyProgression";

export default function WeeklyProgression({className}) {
    const [isEditMode, setEditMode] = useState(false);
    const toggleEditMode = () => setEditMode(!isEditMode);
    if (isEditMode) {
        return <WeeklyProgressionEdit className={className} onClose={toggleEditMode}/>;
    } else {
        return <WeeklyProgressionInternal className={className} onEdit={toggleEditMode}/>;
    }
}

function WeeklyProgressionInternal({className, onEdit}) {
    const tracker = useProgressionTracker();
    const {progressions, progress} = tracker;
    const accordionId = "weeklyProgressionAccordion";
    const items = [];
    for (const progression of progressions) {
        const collapseId = "collapse" + progression.name;
        const milestonesProgress = progress[progression.name] || [];
        let milestonesCompleted = 0;
        for (let i = 0; i < progression.milestones.length; i++) {
            if (isMilestoneComplete(progression.milestones[i], milestonesProgress[i])) {
                milestonesCompleted++;
            }
        }
        const onMilestoneCheckpointToggle = (milestoneIndex, checkpoint) => tracker.saveProgressWithMilestoneCheckpointToggled(
            progression.name,
            milestoneIndex,
            checkpoint
        );
        const onGoToMilestone = (milestoneIndex) => tracker.saveProgressStartingWithMilestone(
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
        <div className={"mb-2 d-flex align-items-center"}>
            <span>Weekly Progression</span>
            <button type={"button"} className={"btn btn-sm btn-outline-secondary ms-2"} onClick={onEdit}>
                <i className={"bi bi-gear-fill"}/> Edit
            </button>
        </div>
        <div id={accordionId} className={`accordion ${className || ""}`}>
            {items}
        </div>
    </>;
}

function useProgressionTracker() {
    const [progressions] = useState(() => loadProgressions());
    const [progress, setProgress] = useState(() => loadProgress());
    return {
        progressions,
        progress,
        saveProgressWithMilestoneCheckpointToggled: function (progressionName, milestoneIndex, checkpoint) {
            const newProgress = produce(progress, p => {
                const checkpoints = p[progressionName][milestoneIndex];
                const i = checkpoints.indexOf(checkpoint);
                if (i > -1) {
                    checkpoints.splice(i, 1);
                } else {
                    checkpoints.push(checkpoint);
                }
            });
            setProgress(newProgress);
            saveProgressInLocalStorage(newProgress);
        },
        saveProgressStartingWithMilestone: function (progressionName, milestoneIndex) {
            const newProgress = produce(progress, p => {
                const milestones = p[progressionName];
                for (let i = milestoneIndex; i < milestones.length; i++) {
                    milestones[i] = [];
                }
            });
            setProgress(newProgress);
            saveProgressInLocalStorage(newProgress);
        }
    };
}

function loadProgress() {
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
    const progressions = loadProgressions();
    progress = initProgressForProgressions(progressions);
    saveProgressInLocalStorage(progress);
    return progress;
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

function isMilestoneComplete(milestone, progress) {
    return milestone.checkpoints.every(c => progress.includes(c));
}

function MilestoneStepper({milestoneNames, currentMilestoneIndex, onGoToMilestone}) {
    const items = [];
    for (let i = 0; i < milestoneNames.length; i++) {
        const milestoneName = milestoneNames[i];
        let iconClasses;
        let onClick;
        if (i < currentMilestoneIndex) {
            iconClasses = "bi-check-circle-fill text-success weekly-progression-clickable";
            onClick = () => onGoToMilestone(i);
        } else if (i === currentMilestoneIndex) {
            iconClasses = "bi-circle text-primary weekly-progression-clickable";
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

function WeeklyProgressionEdit({className, onClose}) {
    const editor = useProgressionEditor();
    const {progressions, progression, milestones, milestone} = editor;
    let milestoneListEdit = null;
    if (progression) {
        milestoneListEdit = <>
            <h6>Milestones</h6>
            <ListEdit items={milestones.map(m => m.name)} selectedItemIndex={milestones.indexOf(milestone)}
                      addButtonText={"Add Milestone"} onEdit={editor.editMilestone}
                      onMoveUp={i => editor.swapMilestones(i, i - 1)}
                      onMoveDown={i => editor.swapMilestones(i, i + 1)}
                      onDelete={editor.deleteMilestone}
                      onAdd={editor.addMilestone}/>
        </>;
    }
    let itemEdit = null;
    if (progression && milestone) {
        itemEdit = <MilestoneEdit key={milestone.name} milestones={milestones} milestone={milestone}
                                  onSave={editor.updateMilestone}/>;
    } else if (progression) {
        itemEdit = <ProgressionEdit key={progression.name} progressions={progressions} progression={progression}
                                    onSave={editor.updateProgression}/>;
    }
    return <>
        <div className={"mb-2 d-flex align-items-center"}>
            <span>Weekly Progression</span>
            <button type={"button"} className={"btn btn-sm btn-primary ms-2"}
                    onClick={() => editor.saveProgressions(onClose)}>
                Save
            </button>
            <button type={"button"} className={"btn btn-sm btn-secondary ms-2"} onClick={onClose}>Cancel</button>
        </div>
        <div className={`row ${className || ""}`}>
            <div className={"col"}>
                <h6>Progressions</h6>
                <ListEdit items={progressions.map(p => p.name)} selectedItemIndex={progressions.indexOf(progression)}
                          addButtonText={"Add Progression Path"} onEdit={editor.editProgression}
                          onMoveUp={i => editor.swapProgressions(i, i - 1)}
                          onMoveDown={i => editor.swapProgressions(i, i + 1)}
                          onDelete={editor.deleteProgression}
                          onAdd={editor.addProgression}/>
            </div>
            <div className={"col"}>
                {milestoneListEdit}
            </div>
            <div className={"col"}>
                {itemEdit}
            </div>
        </div>
    </>;
}

function useProgressionEditor() {
    const [progressions, setProgressions] = useState(() => loadProgressions());
    const [context, setContext] = useState({progressionName: null, milestoneName: null});
    const progression = progressions.find(p => p.name === context.progressionName);
    const milestones = progression?.milestones || [];
    const milestone = milestones.find(m => m.name === context.milestoneName);

    function updateProgressions(cb) {
        setProgressions(p => produce(p, d => {
            cb(d)
        }));
    }

    function updateMilestones(progressionName, cb) {
        updateProgressions(ps => {
            const milestones = ps.find(p => p.name === progressionName)?.milestones || [];
            cb(milestones);
        });
    }

    return {
        progressions,
        progression,
        milestones,
        milestone,
        editMilestone: function (i) {
            setContext({...context, milestoneName: milestones[i].name});
        },
        editProgression: function (i) {
            setContext({progressionName: progressions[i].name});
        },
        swapProgressions: function (i, j) {
            updateProgressions(ps => {
                [ps[i], ps[j]] = [ps[j], ps[i]];
            });
        },
        swapMilestones: function (i, j) {
            updateMilestones(context.progressionName, ms => {
                [ms[i], ms[j]] = [ms[j], ms[i]];
            });
        },
        saveProgressions: function (cb) {
            const progress = initProgressForProgressions(progressions);
            saveProgressionsInLocalStorage(progressions);
            saveProgressInLocalStorage(progress);
            cb();
        },
        deleteMilestone: function (i) {
            updateMilestones(context.progressionName, ms => {
                if (ms[i].name === context.milestoneName) {
                    setContext({...context, milestoneName: null});
                }
                ms.splice(i, 1);
            });
        },
        deleteProgression: function (i) {
            updateProgressions(ps => {
                if (ps[i].name === context.progressionName) {
                    setContext({});
                }
                ps.splice(i, 1);
            });
        },
        updateProgression: function (changes) {
            updateProgressions(ps => {
                const p = ps.find(p => p.name === context.progressionName);
                p.name = changes.name;
                setContext({progressionName: changes.name});
            });
        },
        updateMilestone: function (changes) {
            updateMilestones(context.progressionName, ms => {
                const m = ms.find(m => m.name === context.milestoneName);
                m.name = changes.name;
                m.checkpoints = changes.checkpoints;
                m.note = changes.note;
                setContext({...context, milestoneName: m.name});
            });
        },
        addProgression: function () {
            updateProgressions(ps => {
                const p = {
                    name: pickFreeNameWithPrefix("Progression", progressions.map(p => p.name)),
                    milestones: [],
                };
                ps.push(p);
                setContext({progressionName: p.name});
            });
        },
        addMilestone: function () {
            updateMilestones(context.progressionName, ms => {
                const m = {
                    name: pickFreeNameWithPrefix("Milestone", milestones.map(m => m.name)),
                    checkpoints: [],
                    note: "",
                };
                ms.push(m);
                setContext({...context, milestoneName: m.name});
            });
        }
    };
}

function ListEdit({
                      items,
                      selectedItemIndex,
                      addButtonText,
                      onMoveUp,
                      onMoveDown,
                      onEdit,
                      onDelete,
                      onAdd
                  }) {
    const callWithI = (i, cb) => () => cb(i);
    const listItems = [];
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const canBeMovedUp = i > 0;
        const canBeMovedDown = i < items.length - 1;
        listItems.push(
            <li key={item} className={`list-group-item ${i === selectedItemIndex ? "active" : ""} d-flex`}>
                <span className={"flex-grow-1"}>{item}</span>
                <i className={`bi bi-arrow-up ${canBeMovedUp ? "weekly-progression-clickable" : "text-secondary"} me-2`}
                   onClick={canBeMovedUp ? callWithI(i, onMoveUp) : null}/>
                <i className={`bi bi-arrow-down ${canBeMovedDown ? "weekly-progression-clickable" : "text-secondary"} me-2`}
                   onClick={canBeMovedDown ? callWithI(i, onMoveDown) : null}/>
                <i className={"bi bi-pencil-fill weekly-progression-clickable me-2"} onClick={callWithI(i, onEdit)}/>
                <i className={"bi bi-trash-fill weekly-progression-clickable"} onClick={callWithI(i, onDelete)}/>
            </li>
        );
    }
    return <ul className={"list-group"}>
        {listItems}
        <button type={"button"} className={"list-group-item list-group-item-action"} onClick={onAdd}>
            {addButtonText}
        </button>
    </ul>;
}

function ProgressionEdit({progressions, progression, onSave}) {
    const editor = useProgressionNameEditor(progressions, progression);
    const {name, isNameTaken} = editor;
    return <form onSubmit={e => editor.save(e, onSave)}>
        <h6>Edit Progression</h6>
        <label htmlFor={"nameEdit"} className={"form-label"}>Name</label>
        <input id={"nameEdit"} type={"text"} className={`form-control ${isNameTaken ? "is-invalid" : ""}`}
               required={true} autoFocus={true} value={name} onChange={editor.setName}/>
        <div className={"invalid-feedback"}>Name already taken</div>
        <EditButtonRow onCancel={editor.cancel}/>
    </form>;
}

function useProgressionNameEditor(progressions, progression) {
    const [name, setName] = useState(progression.name);
    const [isNameTaken, setNameTaken] = useState(false);
    return {
        name,
        isNameTaken,
        setName: function (e) {
            setName(e.target.value);
        },
        save: function (e, cb) {
            e.preventDefault();
            if (progression.name !== name && progressions.find(p => p.name === name)) {
                setNameTaken(true);
            } else {
                setNameTaken(false);
                cb({name});
            }
        },
        cancel: function () {
            setName(progression.name);
            setNameTaken(false);
        },
    };
}

function MilestoneEdit({milestones, milestone, onSave}) {
    const editor = useMilestoneEditor(milestones, milestone);
    const {name, checkpoints, note, isNameTaken} = editor;
    return <form onSubmit={e => editor.save(e, onSave)}>
        <h6>Edit Milestone</h6>
        <label htmlFor={"nameEdit"} className={"form-label"}>Milestone Name</label>
        <input id={"nameEdit"} type={"text"} className={`form-control ${isNameTaken ? "is-invalid" : ""}`}
               required={true} autoFocus={true} value={name} onChange={editor.setName}/>
        <div className={"invalid-feedback"}>Name already taken</div>
        <label htmlFor={"checkpointsEdit"} className={"form-label"}>Checkpoints</label>
        <input id={"checkpointsEdit"} type={"text"} className={"form-control"} required={true} value={checkpoints}
               onChange={editor.setCheckpoints}/>
        <label htmlFor={"noteEdit"} className={"form-label"}>Note</label>
        <input id={"noteEdit"} type={"text"} className={"form-control"} value={note} onChange={editor.setNote}/>
        <EditButtonRow onCancel={editor.cancel}/>
    </form>;
}

function useMilestoneEditor(milestones, milestone) {
    const [name, setName] = useState(milestone.name);
    const [checkpoints, setCheckpoints] = useState(milestone.checkpoints);
    const [note, setNote] = useState(milestone.note);
    const [isNameTaken, setNameTaken] = useState(false);
    return {
        name,
        checkpoints: checkpoints.join(","),
        note,
        isNameTaken,
        setName: function (e) {
            setName(e.target.value);
        },
        setCheckpoints: function (e) {
            setCheckpoints(e.target.value.split(","));
        },
        setNote: function (e) {
            setNote(e.target.value);
        },
        save: function (e, cb) {
            e.preventDefault();
            if (milestone.name !== name && milestones.find(m => m.name === name)) {
                setNameTaken(true);
            } else {
                setNameTaken(false);
                cb({name, checkpoints, note});
            }
        },
        cancel: function () {
            setName(milestone.name);
            setCheckpoints(milestone.checkpoints);
            setNote(milestone.note);
            setNameTaken(false);
        }
    };
}

function EditButtonRow({onCancel}) {
    return <div className={"d-flex justify-content-end mt-2"}>
        <button type={"button"} className={"btn btn-secondary me-2"} onClick={onCancel}>Cancel</button>
        <button type={"submit"} className={"btn btn-primary"}>Save</button>
    </div>;
}

function loadProgressions() {
    let progressions = localStorage.getItem(LOCAL_STORAGE_WEEKLY_PROGRESSION);
    if (!progressions) {
        saveProgressionsInLocalStorage(DEFAULT_PROGRESSION);
        progressions = localStorage.getItem(LOCAL_STORAGE_WEEKLY_PROGRESSION);
    }
    return JSON.parse(progressions);
}

function saveProgressInLocalStorage(progress) {
    localStorage.setItem(LOCAL_STORAGE_WEEKLY_PROGRESSION_PROGRESS, JSON.stringify({progress, timestamp: Date.now()}));
}

function saveProgressionsInLocalStorage(progressions) {
    localStorage.setItem(LOCAL_STORAGE_WEEKLY_PROGRESSION, JSON.stringify(progressions));
}

function initProgressForProgressions(progressions) {
    const progress = {};
    for (const progression of progressions) {
        progress[progression.name] = progression.milestones.map(() => []);
    }
    return progress;
}

function pickFreeNameWithPrefix(prefix, names) {
    for (let i = 1; i < Infinity; i++) {
        const name = `${prefix} ${i}`;
        if (!names.includes(name)) {
            return name;
        }
    }
    throw "All names are taken";
}
