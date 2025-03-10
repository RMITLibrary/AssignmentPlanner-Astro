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
  const [needsRevalidation, setNeedsRevalidation] = useState(false);
  const [endDateEmpty, setEndDateEmpty] = useState(false);

  // Sort projects by name alphabetically
  const sortedProjects = [...projectsWithTasks].sort((a, b) => a.name.localeCompare(b.name));

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
    if (submitted && formValid) {
      console.log('Form submitted and valid, scrolling to plan detail');
      const planDetailElement = document.getElementById('plan-detail');
      const liveRegion = document.getElementById('form-submission-message');
      planDetailElement.scrollIntoView({ behavior: 'smooth' });
      // Set focus to #plan-detail after scrolling is complete
      setTimeout(() => {
        // Find first element that is tabbable within the plan details, and focus on that.
        const firstFocusableElement = planDetailElement.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusableElement) {
          firstFocusableElement.focus({ preventScroll: true });
        } else {
          planDetailElement.focus({ preventScroll: true });
        }
      }, 0);
      // Update the live region text
      if (liveRegion) {
        liveRegion.textContent = 'Assignment plan generated. Please review the details below.';
      }
    }
  }, [submitted, formValid]);

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

    preloadCalendar();
  }, [isCalendarPreloaded]);

  const calculateWeeksToDisplay = (startDate, endDate) => {
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 3600 * 24)) + 1;
    const visibleWeeksCount = Math.ceil(totalDays / 7);
    const weeksToDisplay = Math.max(visibleWeeksCount, 1);
    console.log({
      totalDays,
      visibleWeeksCount,
      weeksToDisplay,
    });
    return weeksToDisplay;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Form submission attempt:', { assignmentType, startDate, endDate, formValid });

    const isFormValid = validateForm(); // Validate first
    setFormValid(isFormValid);
    setSubmitted(true); // Always set submitted to indicate the user attempted to submit

    if (!isFormValid) {
      console.log('Form validation failed - other values.');
      return;
    }

    setNeedsRevalidation(true);

    const selectedProject = projectsWithTasks.find((proj) => proj.id === assignmentType);

    if (!selectedProject) {
      console.log('No selected project found, validation failed.');
      return;
    }

    isOpenResults.set(true);
    isGroupAssignment.set(groupAssignment === 'yes');
    console.log('isGroupAssignment updated in form:', groupAssignment === 'yes');

    const isGroup = groupAssignment === 'yes';
    const dayCount = calculateDaysBetween(startDate, endDate);
    const tasksWithDates = distributeTaskDates(selectedProject.tasks, dayCount, startDate, isGroup);
    console.log('tasksWithDates after distributeTaskDates:', tasksWithDates);

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const currentPlan = planDetailsStore.get();
    planDetailsStore.set({
      ...currentPlan,
      name: selectedProject.name || 'Unnamed Assignment',
      assignmentName, // Include the assignment name
      projectID: assignmentType,
      startDate,
      endDate,
      days: dayCount,
      tasks: tasksWithDates,
      weeksToDisplay: calculateWeeksToDisplay(startDateObj, endDateObj),
    });
    // Data Layer Push (AFTER successful form submission)
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'form_submission',
        formType: 'assignment_planner',
        assignmentType: selectedProject.name, // or assignmentType - use the name rather than ID
        isGroupWork: groupAssignment === 'yes',
        daysToComplete: dayCount+1,
        startDate: startDate,
        endDate: endDate,
      });
      console.log('dataLayer pushed');
    }
    if (!Calendar && !isCalendarPreloaded) {
      console.log('Preloading calendar library');
      const { default: importedCalendar } = await import('@toast-ui/calendar');
      Calendar = importedCalendar;
      setIsCalendarPreloaded(true);
      console.log('Calendar library preloaded');
    }
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
        roundedDays = remainingDays;
      } else {
        roundedDays = Math.round(fractionOfDays);
        roundedDays = Math.max(roundedDays, 1);
      }

      roundedDays = Math.min(roundedDays, remainingDays);
      remainingDays -= roundedDays;

      const displayTime = roundedDays > 1 ? `${roundedDays} days` : roundedDays === 1 ? '1 day' : 'less than one day';
      console.log(`Task ${index + 1} - roundedDays:`, roundedDays);

      const taskStartDate = new Date(currentStartDate);
      let taskEndDate = new Date(taskStartDate);

      if (roundedDays > 1) {
        taskEndDate = new Date(taskStartDate.getTime() + (roundedDays - 1) * (1000 * 60 * 60 * 24));
      }
      currentStartDate.setDate(currentStartDate.getDate() + roundedDays);

      return {
        ...task,
        roundedDays,
        displayTime,
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
    setIsCalendarPreloaded(false);
    setNeedsRevalidation(false);
    setEndDateEmpty(false);
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
      if (endDateEmpty) {
        dateErrorElement.textContent = 'Please provide an end date.';
      } else {
        dateErrorElement.textContent = endDate ? 'End date must be after the start date.' : 'Please provide an end date.';
      }
      setEndDateValid(false);
      isValid = false;
    } else {
      dateErrorElement.textContent = '';
      setEndDateValid(true);
    }
    return isValid;
  };

  const validateForm = () => {
    const isValidDates = validateDates();
    return isValidDates && assignmentType !== '' && groupAssignment !== '' && startDate && endDate;
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
    if (needsRevalidation) {
      setFormValid(false);
    }
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    setEndDateEmpty(e.target.value === '');
    if (needsRevalidation) {
      setFormValid(false);
    }
  };

  const handleGroupChange = (e) => {
    setGroupAssignment(e.target.value);
    if (needsRevalidation) {
      setFormValid(false);
    }
  };

  const handleAssignmentChange = (e) => {
    setAssignmentType(e.target.value);
    if (needsRevalidation) {
      setFormValid(false);
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

  // Helper function to decide if an input should display an error state
  const hasError = (isValid) => {
    return submitted && !isValid;
  };

  return (
    <div>
      <form id="assignmentDetails" className={`${submitted ? 'was-validated' : ''}`} onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="assignmentName">Assignment name (optional)</label>
          <input type="text" className="form-control" id="assignmentName" value={assignmentName} onChange={(e) => setAssignmentName(e.target.value)} placeholder="Enter assignment name" />
        </div>

        <div className="form-group">
          <label htmlFor="assignmentType">
            Assignment type<span className="req">*</span>
          </label>
          <select className={getSelectClass()} id="assignmentType" required value={assignmentType} onChange={handleAssignmentChange} aria-describedby={hasError(assignmentType) ? 'assignmentTypeFeedback' : undefined} aria-invalid={hasError(assignmentType)}>
            <option value="">Select type</option>
            {sortedProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          {submitted && !assignmentType && (
            <div id="assignmentTypeFeedback" className="invalid-feedback">
              Please select an assignment type.
            </div>
          )}
        </div>

        <fieldset className="form-group">
          <legend>
            Is this a group assignment?<span className="req">*</span>
          </legend>
          <div className="form-check form-check-inline">
            <input className="form-check-input" type="radio" name="groupAssignment" id="groupYes" value="yes" checked={groupAssignment === 'yes'} onChange={handleGroupChange} required aria-invalid={hasError(groupAssignment)} aria-describedby={hasError(groupAssignment) ? 'groupAssignmentFeedback' : undefined} />
            <label className="form-check-label" htmlFor="groupYes">
              Yes
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input className="form-check-input" type="radio" name="groupAssignment" id="groupNo" value="no" checked={groupAssignment === 'no'} onChange={handleGroupChange} required aria-invalid={hasError(groupAssignment)} aria-describedby={hasError(groupAssignment) ? 'groupAssignmentFeedback' : undefined} />
            <label className="form-check-label" htmlFor="groupNo">
              No
            </label>
          </div>
          {submitted && !groupAssignment && (
            <div id="groupAssignmentFeedback" className="invalid-feedback">
              Please select an option.
            </div>
          )}
        </fieldset>

        <div className="dates">
          <div className="form-group">
            <label htmlFor="startDate">
              Start date<span className="req">*</span>
            </label>
            <input type="date" className={getInputClass(startDateValid)} id="startDate" aria-invalid={hasError(startDateValid)} aria-describedby={hasError(startDateValid) ? 'startDateFeedback startDateFormat' : 'startDateFormat'} value={startDate} onChange={handleStartDateChange} required />
            <div id="startDateFormat" className="form-text text-muted">
              <span className="visually-hidden">
                Date format: <span id="startDateFormatDisplay"></span>
              </span>
            </div>
            {hasError(startDateValid) && (
              <div id="startDateFeedback" className="invalid-feedback">
                Please provide a start date.
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="endDate">
              End date<span className="req">*</span>
            </label>
            <input type="date" className={getInputClass(endDateValid)} id="endDate" aria-invalid={hasError(endDateValid)} aria-describedby={'endDateError endDateFormat'} value={endDate} onChange={handleEndDateChange} required />
            <div id="endDateFormat" className="form-text text-muted">
              <span className="visually-hidden">
                Date format: <span id="endDateFormatDisplay"></span>
              </span>
            </div>
            <div id="endDateError" className="invalid-feedback"></div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Create assignment plan
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleReset}>
          Reset
        </button>
      </form>
      <div id="form-submission-message" className="visually-hidden" aria-live="polite" aria-atomic="false"></div>
    </div>
  );
};

export default Form;
