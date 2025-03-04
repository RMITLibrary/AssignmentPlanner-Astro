import { useEffect, useState } from 'preact/hooks';
import { isOpenResults, isTesting, planDetailsStore, isGroupAssignment } from '../store';

let Calendar; // Declare Calendar outside the component
const Form = ({ projectsWithTasks }) => {
  const [assignmentName, setAssignmentName] = useState('');
  const [assignmentType, setAssignmentType] = useState('');
  const [groupAssignment, setGroupAssignment] = useState('no');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [formValid, setFormValid] = useState(false);
  const [startDateValid, setStartDateValid] = useState(false);
  const [endDateValid, setEndDateValid] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isCalendarPreloaded, setIsCalendarPreloaded] = useState(false);

  useEffect(() => {
    setDateFormat();

    if (isTesting.get()) {
      setAssignmentType('literature-review-project');
      setStartDate('2025-03-05');
      setEndDate('2025-03-15');
      console.log('Default testing values set:', { assignmentType, startDate, endDate });
    }
  }, []);

  useEffect(() => {
    if (formValid) {
      document.getElementById('plan-detail').scrollIntoView({ behavior: 'smooth' });
    }
  }, [formValid]);

  useEffect(() => {
    isGroupAssignment.set(groupAssignment === 'yes');
    console.log('isGroupAssignment updated in form:', groupAssignment === 'yes');
  }, [groupAssignment]);

  useEffect(() => {
    //new useEffect
    const recalculateTaskDates = () => {
      const currentPlan = planDetailsStore.get();

      if (currentPlan && currentPlan.projectID) {
        const selectedProject = projectsWithTasks.find((proj) => proj.id === currentPlan.projectID);

        if (selectedProject) {
          const isGroup = groupAssignment === 'yes';
          const dayCount = calculateDaysBetween(currentPlan.startDate, currentPlan.endDate);
          const tasksWithDates = distributeTaskDates(selectedProject.tasks, dayCount, currentPlan.startDate, isGroup);
          console.log('tasksWithDates after distributeTaskDates:', tasksWithDates);
          planDetailsStore.set({
            ...currentPlan,
            tasks: tasksWithDates,
          });
        }
      }
    };

    if (submitted) {
      recalculateTaskDates();
    }
  }, [groupAssignment, submitted]);

  useEffect(() => {
    const preloadCalendar = async () => {
      if (!Calendar && !isCalendarPreloaded) {
        console.log('Preloading calendar library');
        const { default: importedCalendar } = await import('@toast-ui/calendar');
        Calendar = importedCalendar;
        setIsCalendarPreloaded(true);
        console.log('Calendar library preloaded');
      }
    };

    if (formValid) {
      preloadCalendar();
    }
  }, [formValid, isCalendarPreloaded]);

  const calculateWeeksToDisplay = (startDate, endDate) => {
    // Calculate the number of days between the start and end dates.
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 3600 * 24)) + 1; //+1 to ensure the last day is included
    // Calculate the number of full weeks.
    const visibleWeeksCount = Math.ceil(totalDays / 7);
    // Ensure we always show at least one week or 4 weeks
    const weeksToDisplay = Math.max(visibleWeeksCount, 1); //Minimum is 1 week not 4
    console.log({
      totalDays,
      visibleWeeksCount,
      weeksToDisplay,
    });
    return weeksToDisplay;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true); //set here
    console.log('Form submission attempt:', { assignmentType, startDate, endDate });

    if (!validateDates() || !assignmentType || !groupAssignment || !startDate || !endDate) {
      setFormValid(false);
      console.log('Form validation failed.');
      return;
    }

    const selectedProject = projectsWithTasks.find((proj) => proj.id === assignmentType);

    if (!selectedProject) {
      setFormValid(false);
      console.log('No selected project found, validation failed.');
      return;
    }

    setFormValid(true);
    isOpenResults.set(true);

    //this will get the current group status
    const isGroup = isGroupAssignment.get();
    const dayCount = calculateDaysBetween(startDate, endDate);
    const tasksWithDates = distributeTaskDates(selectedProject.tasks, dayCount, startDate, isGroup); // pass the group status to this function
    console.log('tasksWithDates after distributeTaskDates:', tasksWithDates);

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const currentPlan = planDetailsStore.get();
    planDetailsStore.set({
      ...currentPlan,
      name: selectedProject.name || 'Unnamed Assignment',
      assignmentName: assignmentName, // Add this line
      projectID: assignmentType,
      startDate,
      endDate,
      days: dayCount,
      tasks: tasksWithDates,
      weeksToDisplay: calculateWeeksToDisplay(startDateObj, endDateObj), // pass in the Date objects.
    });
  };

  const distributeTaskDates = (tasks, totalDays, startDate, isGroup) => {
    console.log('distributeTaskDates called with isGroup:', isGroup);
    const totalWeight = tasks.reduce((sum, task) => sum + (isGroup && task.groupWeight !== undefined ? task.groupWeight : task.weight), 0);
    console.log('totalWeight:', totalWeight);
    let currentStartDate = new Date(startDate);
    let remainingDays = totalDays;

    return tasks.map((task, index) => {
      const currentWeight = task.groupWeight !== undefined && isGroup ? task.groupWeight : task.weight;
      const fractionOfDays = (totalDays * currentWeight) / totalWeight;

      let roundedDays;
      if (index === tasks.length - 1) {
        roundedDays = remainingDays; // Last task gets all remaining days
      } else {
        roundedDays = Math.round(fractionOfDays);
        roundedDays = Math.max(roundedDays, 1); // add this line to ensure we dont go below 1
      }

      roundedDays = Math.min(roundedDays, remainingDays);
      remainingDays -= roundedDays;

      const displayTime = roundedDays > 1 ? `${roundedDays} days` : roundedDays === 1 ? '1 day' : 'less than one day';
      console.log(`Task ${index + 1} - roundedDays:`, roundedDays);

      const taskStartDate = new Date(currentStartDate);
      let taskEndDate = new Date(taskStartDate); // Default to start date if roundedDays is 1 or less

      if (roundedDays > 1) {
        taskEndDate = new Date(taskStartDate.getTime() + (roundedDays - 1) * (1000 * 60 * 60 * 24));
      }
      currentStartDate.setDate(currentStartDate.getDate() + roundedDays);

      return {
        ...task,
        roundedDays: roundedDays,
        displayTime: displayTime,
        startDate: taskStartDate.toISOString().split('T')[0],
        endDate: taskEndDate.toISOString().split('T')[0],
      };
    });
  };


  const handleReset = () => {
    setAssignmentName('');
    setAssignmentType('');
    setGroupAssignment('no');
    setStartDate('');
    setEndDate('');
    setFormValid(false);
    setStartDateValid(false);
    setEndDateValid(false);
    isOpenResults.set(false);
    setSubmitted(false);

    document.getElementById('endDateError').textContent = '';

    console.log('Form reset.');
  };

  const validateDates = () => {
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const dateErrorElement = document.getElementById('endDateError');

    console.log('Validating dates:', { startDateObj, endDateObj });

    let isValid = true;

    if (!startDate) {
      setStartDateValid(false);
      isValid = false;
    } else {
      setStartDateValid(true);
    }

    if (!endDate || isNaN(startDateObj) || isNaN(endDateObj) || endDateObj <= startDateObj) {
      dateErrorElement.textContent = endDate ? 'End date must be after the start date.' : 'Please provide an end date.';
      setEndDateValid(false);
      isValid = false;
    } else {
      dateErrorElement.textContent = '';
      setEndDateValid(true);
    }

    return isValid;
  };

  const setDateFormat = () => {
    const dateFormatter = new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const parts = dateFormatter.formatToParts(new Date());
    const dateFormatOrder = parts
      .map((part) => part.type)
      .filter((type) => ['day', 'month', 'year'].includes(type))
      .map((type) => (type === 'day' ? 'dd' : type === 'month' ? 'mm' : 'yyyy'))
      .join('/');

    document.getElementById('startDateFormatDisplay').textContent = dateFormatOrder;
    document.getElementById('endDateFormatDisplay').textContent = dateFormatOrder;
  };

  const calculateDaysBetween = (start, end) => {
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);
    const differenceInTime = endDateObj - startDateObj;
    const days = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    console.log('Calculating days between:', { startDate: start, endDate: end, days });
    return days;
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    if (submitted) {
      validateDates();
    }
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    if (submitted) {
      const endDateObj = new Date(e.target.value);
      const startDateObj = new Date(startDate);

      if (!e.target.value || endDateObj <= startDateObj || isNaN(endDateObj)) {
        setEndDateValid(false);
        document.getElementById('endDateError').textContent = endDateObj <= startDateObj ? 'End date must be after the start date.' : 'Please provide an end date.';
      } else {
        setEndDateValid(true);
        document.getElementById('endDateError').textContent = '';
      }
    }
  };
  const getSelectClass = () => {
    if (!submitted) {
      return 'form-select';
    }
    return `form-select ${assignmentType ? 'is-valid' : 'is-invalid'}`;
  };

  const getInputClass = (isValid) => {
    if (!submitted) {
      return 'form-control';
    }
    return `form-control ${isValid ? 'is-valid' : 'is-invalid'}`;
  };

  return (
    <form id="assignmentDetails" className={`${formValid || submitted ? 'was-validated' : ''}`} onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="assignmentName">Assignment name (optional)</label>
        <input type="text" className="form-control" id="assignmentName" value={assignmentName} onChange={(e) => setAssignmentName(e.target.value)} placeholder="Enter assignment name" />
      </div>

      <div className="form-group">
        <label htmlFor="assignmentType">
          Assignment type<span className="req">*</span>
        </label>
        <select className={getSelectClass()} id="assignmentType" required value={assignmentType} onChange={(e) => setAssignmentType(e.target.value)}>
          <option value="">Select type</option>
          {projectsWithTasks.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <div className="invalid-feedback">Please select an assignment type.</div>
      </div>

      <fieldset className="form-group">
        <legend>
          Is this a group assignment?<span className="req">*</span>
        </legend>
        <div className="form-check form-check-inline">
          <input className="form-check-input" type="radio" name="groupAssignment" id="groupYes" value="yes" checked={groupAssignment === 'yes'} onChange={() => setGroupAssignment('yes')} required />
          <label className="form-check-label" htmlFor="groupYes">
            Yes
          </label>
        </div>
        <div className="form-check form-check-inline">
          <input className="form-check-input" type="radio" name="groupAssignment" id="groupNo" value="no" checked={groupAssignment === 'no'} onChange={() => setGroupAssignment('no')} required />
          <label className="form-check-label" htmlFor="groupNo">
            No
          </label>
        </div>
        <div className="invalid-feedback">Please select an option.</div>
      </fieldset>

      <div className="dates">
        <div className="form-group">
          <label htmlFor="startDate">
            Start date<span className="req">*</span>
          </label>
          <input type="date" className={getInputClass(startDateValid)} id="startDate" aria-describedby="startDateFormat" value={startDate} onChange={handleStartDateChange} required />
          <div id="startDateFormat" className="form-text text-muted">
            <span className="visually-hidden">
              Date format: <span id="startDateFormatDisplay"></span>
            </span>
          </div>

          <div className="invalid-feedback">Please provide a start date.</div>
        </div>

        <div className="form-group ">
          <label htmlFor="endDate">
            End date<span className="req">*</span>
          </label>
          <input type="date" className={getInputClass(endDateValid)} id="endDate" aria-describedby="endDateFormat" value={endDate} onChange={handleEndDateChange} required />
          <div id="endDateFormat" className="form-text text-muted">
            <span className="visually-hidden">
              Date format: <span id="endDateFormatDisplay"></span>
            </span>
          </div>
          <div className="invalid-feedback" id="endDateError">
            Please provide an end date.
          </div>
        </div>
      </div>

      <button type="submit" className="btn btn-primary">
        Create assignment plan
      </button>
      <button type="reset" className="btn btn-secondary" onClick={handleReset}>
        Reset
      </button>
    </form>
  );
};

export default Form;
