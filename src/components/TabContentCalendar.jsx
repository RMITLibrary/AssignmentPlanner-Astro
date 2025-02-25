import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { planDetailsStore, activeTabStore } from '../store';
import '@toast-ui/calendar/dist/toastui-calendar.min.css';
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';

const CalendarTabPane = () => {
  const [tasks, setTasks] = useState([]);
  const [dateRange, setDateRange] = useState({ start: new Date(), end: new Date() });
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

  // Function to initialize the calendar
  const initializeCalendar = () => {
    if (typeof window !== 'undefined' && containerRef.current && tasks.length > 0) {
      import('@toast-ui/calendar').then(({ default: Calendar }) => {
        if (calendarRef.current) {
          calendarRef.current.destroy();
        }

        const startDates = tasks.map((task) => new Date(task.startDate));
        const endDates = tasks.map((task) => new Date(task.endDate));
        const initialDate = startDates.reduce((earliest, date) => (date < earliest ? date : earliest), new Date());
        const lastDate = endDates.reduce((latest, date) => (date > latest ? date : latest), new Date());
        const weeksDiff = Math.ceil((lastDate - initialDate) / (1000 * 3600 * 24 * 7));
        const visibleWeeksCount = Math.min(Math.max(weeksDiff, 1), 6);

        const calendar = new Calendar(containerRef.current, {
          defaultView: 'month',
          usageStatistics: false,
          isReadOnly: true,
          useFormPopup: false,
          useDetailPopup: false,
          calendars: [
            {
              id: '1',
              name: 'Tasks',
              backgroundColor: '#03bd9e',
              borderColor: '#03bd9e',
            },
          ],
          month: {
            visibleWeeksCount,
            grid: { cellHeight: 50 },
          },
        });

        calendarRef.current = calendar;

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
        calendar.setDate(initialDate);
        updateDateRange();
        console.log('Calendar initialized: Initial Date:', initialDate);
      });
    }
  };

  const updateDateRange = () => {
    if (calendarRef.current) {
      const start = calendarRef.current.getDateRangeStart().toDate();
      const end = calendarRef.current.getDateRangeEnd().toDate();
      setDateRange({ start, end });
    }
  };

  useEffect(() => {
    activeTabStore.subscribe((activeTab) => {
      if (activeTab === 'calendar') {
        console.log('Calendar tab is active, initializing calendar.');
        requestAnimationFrame(initializeCalendar);
      }
    });

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
      updateDateRange();
    }
  };

  const handleCurrentMonth = () => {
    if (calendarRef.current) {
      calendarRef.current.today();
      updateDateRange();
    }
  };

  const handleNextMonth = () => {
    if (calendarRef.current) {
      calendarRef.current.next();
      updateDateRange();
    }
  };

  const formatMonthYearRange = (start, end) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const startMonth = monthNames[start.getMonth()];
    const startYear = start.getFullYear();
    const endMonth = monthNames[end.getMonth()];
    const endYear = end.getFullYear();

    if (startYear === endYear) {
      if (startMonth === endMonth) {
        return `${startMonth} ${startYear}`;
      }
      return `${startMonth} - ${endMonth} ${endYear}`;
    }
    return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
  };

  return (
    <div>
      <div className="cv-header">
        <h3 className="periodLabel">{formatMonthYearRange(dateRange.start, dateRange.end)}</h3>
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

      <div ref={containerRef} style={{ height: '800px' }} className="calendar-container"></div>

      <div className="btn-group-nav">
        <a href="#form-plan" className="btn btn-default" role="button" tabIndex="0">
          Refine plan
        </a>
        <button className="btn btn-default" data-bs-target="#task-tab-pane" id="btn-task-view" type="button" tabIndex="0">
          Task view
        </button>
      </div>
    </div>
  );
};

export default CalendarTabPane;
