export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  return new Intl.DateTimeFormat('en-AU', options).format(date);
};

export const formatDateShort = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const calculateDaysBetween = (start, end) => {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const differenceInTime = endDate - startDate;
  return Math.ceil(differenceInTime / (1000 * 3600 * 24));
};


export const formatDays = (days) => {
  return `${days} ${days === 1 ? 'day' : 'days'}`;
};

export const fireDataLayerEvent = (eventData) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(eventData);
    console.log(`${eventData.event} dataLayer pushed`);
  }
};

export const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

export const scrollToView = (selector) => {
  const element = document.querySelector(selector);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};
