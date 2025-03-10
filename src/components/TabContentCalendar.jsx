import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { planDetailsStore, activeTabStore } from '../store';
import '@toast-ui/calendar/dist/toastui-calendar.min.css';
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';
import SwitchToTaskViewButton from './SwitchToTaskViewButton'; // Import the new component


let Calendar; // Keep this outside for pre-loading

const CalendarTabPane = () => {
  const [tasks, setTasks] = useState([]);
  const [dateRange, setDateRange] = useState({ start: new Date(), end: new Date() });
  const calendarRef = useRef(null);
  const containerRef = useRef(null);
  const [activeTab, setActiveTab] = useState(activeTabStore.get());
  const [weeksToDisplay, setWeeksToDisplay] = useState(5); // Default to 5 weeks

  useEffect(() => {
    const unsubscribeTasks = planDetailsStore.subscribe((details) => {
      setTasks(details.tasks || []);
      console.log('Tasks updated:', details.tasks);
      // Calculate weeks based on the project start and end dates
      const startDate = new Date(details.startDate);
      const endDate = new Date(details.endDate);
      calculateWeeksToDisplay(startDate, endDate);
      setDateRange({ start: startDate, end: endDate });
    });

    const unsubscribeActiveTab = activeTabStore.subscribe(setActiveTab);

    return () => {
      unsubscribeTasks();
      unsubscribeActiveTab();
    };
  }, []);

  const calculateWeeksToDisplay = (startDate, endDate) => {
    // Calculate the number of days between the start and end dates.
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 3600 * 24)) + 1; //+1 to ensure the last day is included
    // Calculate the number of full weeks.
    let visibleWeeksCount = Math.ceil(totalDays / 7);

    // Add an extra week if the project ends mid week
    if (endDate.getDay() !== 6) {
      visibleWeeksCount += 1;
    }
    // Ensure we always show at least one week or 4 weeks
    const weeksToDisplay = Math.max(visibleWeeksCount, 1); //Minimum is 1 week not 4
    console.log({
      totalDays,
      visibleWeeksCount,
      weeksToDisplay,
    });
    setWeeksToDisplay(weeksToDisplay);
  };


  

  const initializeCalendar = async () => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    if (!Calendar) {
      const { default: importedCalendar } = await import('@toast-ui/calendar');
      Calendar = importedCalendar;
    }

    if (calendarRef.current) {
      calendarRef.current.destroy();
      calendarRef.current = null;
    }

    const details = planDetailsStore.get(); // Get the details from the store
    const projectStartDate = new Date(details.startDate); // get the project start date
    const projectEndDate = new Date(details.endDate);

    // Calculate the preceding Sunday
    const precedingSunday = new Date(projectStartDate);
    precedingSunday.setDate(projectStartDate.getDate() - projectStartDate.getDay()); // Set to the preceding Sunday

    const startDateForView = precedingSunday;

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
        visibleWeeksCount: weeksToDisplay, // Use the calculated weeks here
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

    calendar.clear();
    if (tasks.length > 0) {
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
    }

    calendar.setDate(startDateForView);
    updateDateRange();
    console.log('Calendar initialized: Initial Date:', startDateForView, 'End date: ', projectEndDate);
  };

  const updateDateRange = () => {
    if (calendarRef.current) {
      const start = calendarRef.current.getDateRangeStart().toDate();
      const end = calendarRef.current.getDateRangeEnd().toDate();
      setDateRange({ start, end });
    }
  };

  useEffect(() => {
    if (activeTab === 'calendar') {
      initializeCalendar();
    }
  }, [tasks, activeTab, weeksToDisplay]); // Re-initialize on weeksToDisplay change

  const handlePreviousMonth = () => {
    if (calendarRef.current) {
      calendarRef.current.prev();
      const details = planDetailsStore.get(); // Get the details from the store
      const projectStartDate = new Date(details.startDate); // get the project start date
      const projectEndDate = new Date(details.endDate);
      calculateWeeksToDisplay(projectStartDate, projectEndDate);
      updateDateRange();
    }
  };

  const handleCurrentMonth = () => {
    if (calendarRef.current) {
      calendarRef.current.today();
      const details = planDetailsStore.get(); // Get the details from the store
      const projectStartDate = new Date(details.startDate); // get the project start date
      const projectEndDate = new Date(details.endDate);
      calculateWeeksToDisplay(projectStartDate, projectEndDate);
      updateDateRange();
    }
  };

  const handleNextMonth = () => {
    if (calendarRef.current) {
      calendarRef.current.next();
      const details = planDetailsStore.get(); // Get the details from the store
      const projectStartDate = new Date(details.startDate); // get the project start date
      const projectEndDate = new Date(details.endDate);
      calculateWeeksToDisplay(projectStartDate, projectEndDate);
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

  const calculateContainerHeight = () => {
    // Base height for 5 weeks
    let height = 800;
    // Add 100px for each additional week above 5
    if (weeksToDisplay > 5) {
      height += (weeksToDisplay - 5) * 100;
    } else if (weeksToDisplay < 5) {
      height -= (5 - weeksToDisplay) * 100;
    }
    return height;
  };

  const containerHeight = calculateContainerHeight();

  return (
    <div>
      <div className="cv-header">
        <h3 className="periodLabel">{formatMonthYearRange(dateRange.start, dateRange.end)}</h3>
        <div className="cv-header-nav" style="display:none">
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
      <div class="hscroll">
        <div ref={containerRef} style={{ height: `${containerHeight}px` }} className="calendar-container"></div>
      </div>
      <div className="btn-group-nav">
        <SwitchToTaskViewButton /> {/* Use the new component here */}
      </div>
    </div>
  );
};

export default CalendarTabPane;
