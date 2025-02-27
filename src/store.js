import { atom } from 'nanostores';

export const isOpenResults = atom(false);
export const isTesting = atom(false);
export const planDetailsStore = atom({
  name: '',
  projectID: '',
  startDate: '',
  endDate: '',
  days: 0,
  tasks: [],
  weeksToDisplay: 5, // Default to 5
});
export const activeTabStore = atom('task'); // Default to 'task'