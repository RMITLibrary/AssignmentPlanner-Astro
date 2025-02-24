import { useState, useEffect } from 'preact/hooks';
import { planDetailsStore, isOpenResults } from '../store';
import TabContentTasks from './TabContentTasks';
import TabContentCalendar from './TabContentCalendar';

const PlanDetails = () => {
  const [details, setDetails] = useState(planDetailsStore.get());
  const [isOpen, setIsOpen] = useState(isOpenResults.get());
  const [activeTab, setActiveTab] = useState('task');

  useEffect(() => {
    const unsubscribeDetails = planDetailsStore.subscribe((newDetails) => {
      setDetails(newDetails);
      console.log('Details updated:', newDetails);
    });

    const unsubscribeOpen = isOpenResults.subscribe((newOpenState) => {
      setIsOpen(newOpenState);
      console.log('isOpenResults updated:', newOpenState);
    });

    console.log('PlanDetails component mounted.');

    return () => {
      unsubscribeDetails();
      unsubscribeOpen();
      console.log('PlanDetails component unmounted.');
    };
  }, []);

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
          <button className={`nav-link ${activeTab === 'task' ? 'active' : ''}`} id="task-tab" role="tab" onClick={() => setActiveTab('task')}>
            Task view
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button className={`nav-link ${activeTab === 'calendar' ? 'active' : ''}`} id="calendar-tab" role="tab" onClick={() => setActiveTab('calendar')}>
            Calendar view
          </button>
        </li>
      </ul>

      <div className="tab-content">
        <div className={`tab-pane fade ${activeTab === 'task' ? 'show active' : ''}`} id="task-tab-pane" role="tabpanel" aria-labelledby="task-tab" tabIndex="0">
          <TabContentTasks />
        </div>
        <div className={`tab-pane fade ${activeTab === 'calendar' ? 'show active' : ''}`} id="calendar-tab-pane" role="tabpanel" aria-labelledby="calendar-tab" tabIndex="0">
          <TabContentCalendar />
        </div>
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
