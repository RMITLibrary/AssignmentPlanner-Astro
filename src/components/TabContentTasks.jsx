import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { planDetailsStore } from '../store';

const TabContentTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [daysAvailable, setDaysAvailable] = useState(planDetailsStore.get().days || 0);
  const [startDate, setStartDate] = useState(planDetailsStore.get().startDate || '');

  useEffect(() => {
    const unsubscribe = planDetailsStore.subscribe((details) => {
      setTasks(details.tasks || []);
      setDaysAvailable(details.days || 0);
      setStartDate(details.startDate || '');
      console.log('Tasks updated:', details.tasks);
    });

    return () => unsubscribe();
  }, []);

  const distributeRoundedDays = (tasks, totalDays) => {
    let totalWeight = tasks.reduce((sum, task) => sum + task.weight, 0);
    return tasks.map((task) => {
      const fractionDays = (totalDays * task.weight) / totalWeight;
      const roundedDays = Math.round(fractionDays);

      const displayDays = roundedDays > 1 ? `${roundedDays} days` : roundedDays === 1 ? '1 day' : 'less than one day';

      return { ...task, roundedDays, displayTime: displayDays };
    });
  };

  const formatDate = (date) => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const calculateCompletionDates = (tasks, startDate) => {
    let currentDate = new Date(startDate);
    return tasks.map((task) => {
      currentDate.setDate(currentDate.getDate() + task.roundedDays);
      return { ...task, completeBy: formatDate(new Date(currentDate)) };
    });
  };

  const dayAllocations = calculateCompletionDates(distributeRoundedDays(tasks, daysAvailable), startDate);

  const handlePDF = () => {
    console.log('Saving plan to PDF...');
  };

  const handleCalendarExport = () => {
    console.log('Exporting plan to calendar...');
  };

  return (
    <div>
      <div className="hscroll">
        <table className="table-striped" id="table-steps-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Complete by</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {dayAllocations.map((task, index) => (
              <tr key={index}>
                <td>
                  <h3>{`${index + 1}. ${task.data.description || 'Untitled Task'}`}</h3>
                  <div dangerouslySetInnerHTML={{ __html: task.rendered.html }} />
                </td>
                <td>{task.completeBy}</td>
                <td>{task.displayTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="btn-group-tools">
        <button className="btn btn-pdf" id="btn-pdf" type="button" onClick={handlePDF}>
          Save plan to PDF<span className="visually-hidden">&nbsp; (opens new window)</span>
        </button>
        <button className="btn btn-cal" id="btn-calendar" type="button" onClick={handleCalendarExport}>
          Export plan to calendar
        </button>
      </div>

      <div className="btn-group-nav">
        <a href="#form-plan" className="btn btn-default" role="button">
          Refine plan
        </a>
        <button className="btn btn-default" type="button">
          Calendar view
        </button>
      </div>
    </div>
  );
};

export default TabContentTasks;
