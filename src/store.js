import { atom } from 'nanostores';

export const isOpenResults = atom(false);
export const isTesting = atom(true);
export const planDetailsStore = atom({
  name: '',
  projectID:'',
  startDate: '',
  endDate: '',
  days: '',
  tasks: [],
});
export const activeTabStore = atom('task'); // Default to 'task'