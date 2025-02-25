import { useEffect, useState } from 'preact/hooks';
import { isOpenResults, isTesting, planDetailsStore } from '../store';

const Form = ({ projectsWithTasks }) => {
  const [assignmentName, setAssignmentName] = useState('');
  const [assignmentType, setAssignmentType] = useState('');
  const [groupAssignment, setGroupAssignment] = useState('no');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [formValid, setFormValid] = useState(false);
  const [startDateValid, setStartDateValid] = useState(false);
  const [endDateValid, setEndDateValid] = useState(false);

  useEffect(() => {
    setDateFormat();

    if (isTesting.get()) {
      setAssignmentType('written-assessment');
      setStartDate('2025-03-20');
      setEndDate('2025-03-30');
      console.log('Default testing values set:', { assignmentType, startDate, endDate });
    }
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
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

    const dayCount = calculateDaysBetween(startDate, endDate);
    const tasksWithDates = distributeTaskDates(selectedProject.tasks, dayCount, startDate);

    planDetailsStore.set({
      name: selectedProject.name || 'Unnamed Assignment',
      projectID: assignmentType,
      startDate,
      endDate,
      days: dayCount,
      tasks: tasksWithDates,
    });

    console.log('Form submitted successfully:', { assignmentType, startDate, endDate, dayCount });
  };

  const distributeTaskDates = (tasks, totalDays, startDate) => {
    const totalWeight = tasks.reduce((sum, task) => sum + task.weight, 0);
    let currentStartDate = new Date(startDate);

    return tasks.map((task) => {
      const fractionDays = (totalDays * task.weight) / totalWeight;
      const roundedDays = Math.round(fractionDays);

      const displayTime = roundedDays > 1 ? `${roundedDays} days` : roundedDays === 1 ? '1 day' : 'less than one day';

      const taskStartDate = new Date(currentStartDate);
      const taskEndDate = new Date(currentStartDate);
      taskEndDate.setDate(taskEndDate.getDate() + Math.max(roundedDays - 1, 0));

      currentStartDate.setDate(currentStartDate.getDate() + roundedDays);

      console.log(`Distributing task: ${task.name}`, { taskStartDate, taskEndDate });

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

  return (
    <form id="assignmentDetails" className={`needs-validation ${formValid ? '' : 'was-validated'}`}  onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="assignmentName">Assignment name (optional)</label>
        <input type="text" className="form-control" id="assignmentName" value={assignmentName} onChange={(e) => setAssignmentName(e.target.value)} placeholder="Enter assignment name" />
      </div>

      <div className="form-group">
        <label htmlFor="assignmentType">
          Assignment type<span className="req">*</span>
        </label>
        <select className={`form-select ${assignmentType ? 'is-valid' : 'is-invalid'}`} id="assignmentType" required value={assignmentType} onChange={(e) => setAssignmentType(e.target.value)}>
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
          <input
            type="date"
            className={`form-control ${startDateValid ? 'is-valid' : 'is-invalid'}`}
            id="startDate"
            aria-describedby="startDateFormat"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              validateDates();
            }}
            required
          />
          <div id="startDateFormat" className="form-text text-muted">
            <span className="visually-hidden">Date format:</span>
            <span id="startDateFormatDisplay"></span>
          </div>
          <div className="invalid-feedback">Please provide a start date.</div>
        </div>

        <div className="form-group">
          <label htmlFor="endDate">
            End date<span className="req">*</span>
          </label>
          <input
            type="date"
            className={`form-control ${endDateValid ? 'is-valid' : 'is-invalid'}`}
            id="endDate"
            aria-describedby="endDateFormat"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              const endDateObj = new Date(e.target.value);
              const startDateObj = new Date(startDate);

              if (!e.target.value || endDateObj <= startDateObj || isNaN(endDateObj)) {
                setEndDateValid(false);
                document.getElementById('endDateError').textContent = endDateObj <= startDateObj ? 'End date must be after the start date.' : 'Please provide an end date.';
              } else {
                setEndDateValid(true);
                document.getElementById('endDateError').textContent = '';
              }
            }}
            required
          />
          <div id="endDateFormat" className="form-text text-muted">
            <span className="visually-hidden">Date format:</span>
            <span id="endDateFormatDisplay"></span>
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
