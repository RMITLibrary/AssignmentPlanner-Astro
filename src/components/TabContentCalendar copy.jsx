import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { planDetailsStore } from '../store';
import '@toast-ui/calendar/dist/toastui-calendar.min.css';
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';

const CalendarTabPane = () => {
  const [tasks, setTasks] = useState([]);
  const calendarRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const unsubscribe = planDetailsStore.subscribe((details) => {
      setTasks(details.tasks || []);
      console.log('Tasks updated:', details.tasks);
    });

    const initCalendar = () => {
      if (typeof window !== 'undefined' && tasks.length > 0 && containerRef.current) {
        import('@toast-ui/calendar').then(({ default: Calendar }) => {
          const container = containerRef.current;
          const initialDate = new Date(tasks[0].startDate || new Date());

          const calendar = new Calendar(container, {
            defaultView: 'month',
            usageStatistics: false,
            isReadOnly: true,
            useFormPopup: true,
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

          const colors = [
            { textColor: '#000000', bgColor: '#fac800' }, // highlight-1
            { textColor: '#000000', bgColor: '#70cfff' }, // highlight-2
            { textColor: '#000000', bgColor: '#81e996' }, // highlight-3
            { textColor: '#000000', bgColor: '#eb7ab6' }, // highlight-4
            { textColor: '#000000', bgColor: '#f5904d' }, // highlight-5
            { textColor: '#000000', bgColor: '#e66cef' }, // highlight-6
            { textColor: '#000000', bgColor: '#00F2B6' }, // highlight-7
            { textColor: '#000000', bgColor: '#99AFFF' }, // highlight-8
            { textColor: '#000000', bgColor: '#CEF218' }, // highlight-9
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
              color: color.textColor, // Text color for readability
            };
          });

          calendar.createEvents(events);
          calendar.setDate(initialDate);

          // Store calendar instance in ref
          calendarRef.current = calendar;

          return () => {
            calendar.destroy();
            calendarRef.current = null;
          };
        });
      }
    };

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        initCalendar(); // Initialize the calendar when it becomes visible
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      unsubscribe();
      observer.disconnect();
    };
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
