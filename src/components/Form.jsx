import { useEffect, useState } from 'preact/hooks';
import { isOpenResults, isTesting, planDetailsStore } from '../store';

const Form = ({ projectsWithTasks }) => {
  const [assignmentName, setAssignmentName] = useState('');
  const [assignmentType, setAssignmentType] = useState('');
  const [groupAssignment, setGroupAssignment] = useState('no');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [formValid, setFormValid] = useState(true);

  useEffect(() => {
    setDateFormat();

    if (isTesting.get()) {
      setAssignmentType('written-assessment');
      setStartDate('2025-03-20');
      setEndDate('2025-03-30');
      console.log('Default testing values set');
    }
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    let valid = true;

    if (!assignmentType || !groupAssignment || !startDate || !endDate) {
      valid = false;
    }

    const selectedProject = projectsWithTasks.find((proj) => proj.id === assignmentType);

    if (!valid || !selectedProject) {
      setFormValid(false);
      return;
    }

    setFormValid(true);
    isOpenResults.set(true);

    const dayCount = calculateDaysBetween(startDate, endDate);

    planDetailsStore.set({
      name: selectedProject.name || 'Unnamed Assignment',
      projectID: assignmentType,
      startDate,
      endDate,
      days: dayCount,
      tasks: selectedProject.tasks,
    });

    console.log('Form submitted successfully, isOpenResults:', isOpenResults.get());
  };

  const handleReset = () => {
    setAssignmentName('');
    setAssignmentType('');
    setGroupAssignment('no');
    setStartDate('');
    setEndDate('');
    setFormValid(true);
    isOpenResults.set(false);
    console.log('Form reset, isOpenResults:', isOpenResults.get());
  };

  const validateDates = () => {
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const dateErrorElement = document.getElementById('endDateError');

    if (!endDate) {
      dateErrorElement.textContent = 'Please provide an end date.';
    } else if (startDateObj && endDateObj && endDateObj <= startDateObj) {
      dateErrorElement.textContent = 'End date must be after the start date.';
    } else {
      dateErrorElement.textContent = '';
    }
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
    return Math.ceil(differenceInTime / (1000 * 3600 * 24));
  };

  return (
    <form id="assignmentDetails" className={`needs-validation ${formValid ? '' : 'was-validated'}`} noValidate onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="assignmentName">Assignment name (optional)</label>
        <input type="text" className="form-control" id="assignmentName" value={assignmentName} onChange={(e) => setAssignmentName(e.target.value)} placeholder="Enter assignment name" />
      </div>

      <div className="form-group">
        <label htmlFor="assignmentType">
          Assignment type<span className="req">*</span>
        </label>
        <select className="form-select" id="assignmentType" required value={assignmentType} onChange={(e) => setAssignmentType(e.target.value)}>
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
            className="form-control"
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
            className="form-control"
            id="endDate"
            aria-describedby="endDateFormat"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              validateDates();
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
