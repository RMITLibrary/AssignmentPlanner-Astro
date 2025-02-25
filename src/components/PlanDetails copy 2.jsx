import { useState, useEffect } from 'preact/hooks';
import { planDetailsStore, isOpenResults, activeTabStore } from '../store';
import TabContentTasks from './TabContentTasks';
import TabContentCalendar from './TabContentCalendar';

const PlanDetails = () => {
  const [details, setDetails] = useState(planDetailsStore.get());
  const [isOpen, setIsOpen] = useState(isOpenResults.get());
  const [activeTab, setActiveTab] = useState(activeTabStore.get());

  useEffect(() => {
    const unsubscribeDetails = planDetailsStore.subscribe(setDetails);
    const unsubscribeOpen = isOpenResults.subscribe(setIsOpen);
    const unsubscribeActiveTab = activeTabStore.subscribe(setActiveTab);

    console.log('PlanDetails component mounted.');

    return () => {
      unsubscribeDetails();
      unsubscribeOpen();
      unsubscribeActiveTab();
      console.log('PlanDetails component unmounted.');
    };
  }, []);

  const changeTab = (tab) => {
    activeTabStore.set(tab);
  };

  const exportToCalendar = (viewType) => {
    const tasks = details.tasks;
    console.log('Tasks:', tasks);

    if (!Array.isArray(tasks) || tasks.length === 0) {
      console.warn('No tasks available for export.');
      return;
    }

    let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\n';

    tasks.forEach((task) => {
      try {
        if (!task.startDate || !task.endDate) {
          console.warn(`Missing start or end date for task: ${task.data.description}`);
          return;
        }

        const taskStartDate = new Date(`${task.startDate}T09:00:00`);
        const taskEndDate = new Date(`${task.endDate}T21:00:00`);

        if (isNaN(taskStartDate.getTime()) || isNaN(taskEndDate.getTime())) {
          console.warn(`Invalid dates for task: ${task.data.description}`);
          return;
        }

        const taskStart = taskStartDate.toISOString().replace(/-/g, '').replace(/:/g, '').split('.')[0] + 'Z';
        const taskEnd = taskEndDate.toISOString().replace(/-/g, '').replace(/:/g, '').split('.')[0] + 'Z';

        let icsEvent = `BEGIN:VEVENT\nSUMMARY:[Assignment Planner] ${task.data.description}\nDESCRIPTION:${task.body.replace(/\n/g, '\\n')}\n`;

        if (viewType === 'Multiday') {
          icsEvent += `DTSTART:${taskStart}\nDTEND:${taskEnd}\n`;
        } else if (viewType === 'Milestone') {
          icsEvent += `DTSTART:${taskStart}\nDTEND:${taskStart}\n`;
        }

        icsEvent += 'END:VEVENT\n';
        icsContent += icsEvent;
      } catch (error) {
        console.error('Error processing task:', task, error);
      }
    });

    icsContent += 'END:VCALENDAR';

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `assignment_tasks.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('Exported to calendar...');
  };

  if (!isOpen || !details.projectID) return null;

  return (
    <section id="plan-detail">
      <h2>
        Assignment plan: <span>{details.name || 'N/A'}</span>
      </h2>
      <div className="plan-dates">
        <p>
          <strong>Start date:</strong> <span>{formatDate(details.startDate)}</span>
        </p>
        <p>
          <strong>End date:</strong> <span>{formatDate(details.endDate)}</span>
        </p>
      </div>
      <p className="deadline">
        You have{' '}
        <strong>
          <span>{formatDays(calculateDaysBetween(details.startDate, details.endDate))}</span>
        </strong>{' '}
        to complete your assignment.
      </p>

      <ul className="nav nav-tabs" role="tablist">
        <li className="nav-item" role="presentation">
          <button className={`nav-link ${activeTab === 'task' ? 'active' : ''}`} id="task-tab" role="tab" onClick={() => changeTab('task')}>
            Task view
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button className={`nav-link ${activeTab === 'calendar' ? 'active' : ''}`} id="calendar-tab" role="tab" onClick={() => changeTab('calendar')}>
            Calendar view
          </button>
        </li>
      </ul>

      <div className="tab-content">
        <div className={`tab-pane fade ${activeTab === 'task' ? 'show active' : ''}`} id="task-tab-pane" role="tabpanel" aria-labelledby="task-tab" tabIndex="0">
          <TabContentTasks />
        </div>
        <div className={`tab-pane fade page-break ${activeTab === 'calendar' ? 'show active' : ''}`} id="calendar-tab-pane" role="tabpanel" aria-labelledby="calendar-tab" tabIndex="0">
          <TabContentCalendar />
        </div>
      </div>

      <div className="btn-group-tools">
        <button className="btn btn-pdf" onClick={() => window.print()}>
          Save to PDF
        </button>
        <button className="btn btn-cal" onClick={() => exportToCalendar('Multiday')}>
          Export to Calendar (Multiday)
        </button>
        <button className="btn btn-cal" onClick={() => exportToCalendar('Milestone')}>
          Export to Calendar (Milestone)
        </button>
      </div>
    </section>
  );

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function calculateDaysBetween(start, end) {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const differenceInTime = endDate - startDate;
    return Math.ceil(differenceInTime / (1000 * 3600 * 24));
  }

  function formatDays(days) {
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  }
};

export default PlanDetails;
