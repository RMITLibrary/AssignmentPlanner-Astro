import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { planDetailsStore } from '../store';
import '@toast-ui/calendar/dist/toastui-calendar.min.css';
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';

const CalendarTabPane = () => {
  const [tasks, setTasks] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date()); // New state for tracking current date
  const calendarRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const unsubscribe = planDetailsStore.subscribe((details) => {
      setTasks(details.tasks || []);
      console.log('Tasks updated:', details.tasks);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && containerRef.current) {
      import('@toast-ui/calendar').then(({ default: Calendar }) => {
        const container = containerRef.current;

        if (calendarRef.current) {
          calendarRef.current.clear();
        } else {
          const calendar = new Calendar(container, {
            defaultView: 'month',
            usageStatistics: false,
            isReadOnly: true,
            useFormPopup: false,
            useDetailPopup: true,
            month: {
              visibleEventCount: Infinity,
              grid: { cellHeight: 50 },
            },
            calendars: [
              {
                id: '1',
                name: 'Tasks',
                backgroundColor: '#03bd9e',
                borderColor: '#03bd9e',
              },
            ],
          });

          calendarRef.current = calendar;
        }

        const calendar = calendarRef.current;

        const colors = [
          { textColor: '#000000', bgColor: '#fac800' },
          { textColor: '#000000', bgColor: '#70cfff' },
          { textColor: '#000000', bgColor: '#81e996' },
          { textColor: '#000000', bgColor: '#eb7ab6' },
          { textColor: '#000000', bgColor: '#f5904d' },
          { textColor: '#000000', bgColor: '#e66cef' },
          { textColor: '#000000', bgColor: '#00F2B6' },
          { textColor: '#000000', bgColor: '#99AFFF' },
          { textColor: '#000000', bgColor: '#CEF218' },
        ];

        const events = tasks.map((task, index) => {
          const color = colors[index % colors.length];
          return {
            id: task.id,
            calendarId: '1',
            title: task.data.description || 'No Description',
            body: task.body || 'No Details',
            start: new Date(task.startDate),
            end: new Date(task.endDate),
            category: 'allday',
            backgroundColor: color.bgColor,
            borderColor: color.bgColor,
            color: color.textColor,
          };
        });

        calendar.createEvents(events);

        if (tasks.length > 0) {
          const initialTaskDate = new Date(tasks[0].startDate);
          calendar.setDate(initialTaskDate);
          setCurrentDate(initialTaskDate); // Set state to match initial calendar date
        }
      });
    }

    return () => {
      if (calendarRef.current) {
        calendarRef.current.destroy();
        calendarRef.current = null;
      }
    };
  }, [tasks]);

  const handlePreviousMonth = () => {
    if (calendarRef.current) {
      calendarRef.current.prev();
      updateCurrentDate();
    }
  };

  const handleCurrentMonth = () => {
    if (calendarRef.current) {
      calendarRef.current.today();
      updateCurrentDate();
    }
  };

  const handleNextMonth = () => {
    if (calendarRef.current) {
      calendarRef.current.next();
      updateCurrentDate();
    }
  };

  const updateCurrentDate = () => {
    if (calendarRef.current) {
      setCurrentDate(calendarRef.current.getDate());
    }
  };

  const formatMonthYear = (date) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <div>
      <div className="cv-header">
        <h3 className="periodLabel">{formatMonthYear(currentDate)}</h3>
        <div className="cv-header-nav">
          <button className="btn btn-sm previousPeriod" onClick={handlePreviousMonth}>
            <span className="visually-hidden">Previous month</span>
          </button>
          <button className="btn btn-sm currentPeriod" onClick={handleCurrentMonth}>
            Today
          </button>
          <button className="btn btn-sm nextPeriod" onClick={handleNextMonth}>
            <span className="visually-hidden">Next month</span>
          </button>
        </div>
      </div>

      <div className="hscroll">
        <div ref={containerRef} style={{ height: '800px' }} className="calendar-container"></div>
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
