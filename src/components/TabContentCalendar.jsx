import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { planDetailsStore } from '../store';
import '@toast-ui/calendar/dist/toastui-calendar.min.css';
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';

const CalendarTabPane = () => {
  const [tasks, setTasks] = useState([]);
  const calendarRef = useRef(null);

  useEffect(() => {
    const unsubscribe = planDetailsStore.subscribe((details) => {
      setTasks(details.tasks || []);
      console.log('Tasks updated:', details.tasks);
    });

    if (typeof window !== 'undefined' && tasks.length > 0) {
      import('@toast-ui/calendar').then(({ default: Calendar }) => {
        const container = document.getElementById('calendar-view-container');

        const initialDate = new Date(tasks[0].startDate);

        const calendar = new Calendar(container, {
          defaultView: 'month',
          usageStatistics: false,
          isReadOnly: true,
          useFormPopup: true,
          useDetailPopup: true,
          date: initialDate,
          calendars: [
            {
              id: '1',
              name: 'Tasks',
              backgroundColor: '#03bd9e',
              borderColor: '#03bd9e',
            },
          ],
        });

        const colors = ['#FF5733', '#33FF57', '#3357FF', '#F33FF5', '#F5A623']; // Example color array
        const events = tasks.map((task, index) => ({
          id: task.id,
          calendarId: '1',
          title: task.name,
          body: task.body, // Add the task body here for the popup
          start: task.startDate,
          end: task.completeBy,
          category: 'allday',
          bgColor: colors[index % colors.length],
          dragBackgroundColor: colors[index % colors.length],
          borderColor: colors[index % colors.length],
        }));

        calendar.createEvents(events);

        calendarRef.current = calendar;

        return () => {
          calendar.destroy();
          calendarRef.current = null;
        };
      });
    }

    return () => unsubscribe();
  }, [tasks]);

  const handlePreviousMonth = () => {
    if (calendarRef.current) calendarRef.current.prev();
  };

  const handleCurrentMonth = () => {
    if (calendarRef.current) calendarRef.current.today();
  };

  const handleNextMonth = () => {
    if (calendarRef.current) calendarRef.current.next();
  };

  return (
    <div>
      <div className="cv-header">
        <div className="cv-header-nav">
          <button className="btn btn-sm previousPeriod" onClick={handlePreviousMonth}>
            Previous
          </button>
          <button className="btn btn-sm currentPeriod" onClick={handleCurrentMonth}>
            Today
          </button>
          <button className="btn btn-sm nextPeriod" onClick={handleNextMonth}>
            Next
          </button>
        </div>
      </div>
      <div className="hscroll">
        <div id="calendar-view-container" style={{ height: '600px' }} className="calendar-container"></div>
      </div>
      <div className="btn-group-tools">
        <button className="btn btn-pdf" onClick={() => console.log('Saving plan to PDF...')}>
          Save to PDF
        </button>
        <button className="btn btn-cal" onClick={() => console.log('Exporting to calendar...')}>
          Export to Calendar
        </button>
      </div>
    </div>
  );
};

export default CalendarTabPane;
