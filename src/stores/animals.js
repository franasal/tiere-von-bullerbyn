import { defineStore } from 'pinia';

export const useAnimalsStore = defineStore('animals', {
  state: () => ({
    list: [],
    loading: false,
    error: null,
    lastUpdated: null,
  }),
  actions: {
    setAnimals(data) {
      this.list = data;
    }
  }
});
