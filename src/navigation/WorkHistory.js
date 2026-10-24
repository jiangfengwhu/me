// A work replaces only its own detail entry; the shelf stays immediately behind it.
export class WorkHistory {
  constructor(history = window.history, location = window.location) {
    this.history = history;
    this.location = location;
  }
  state(view) { return { ...this.history.state, portfolioView: view }; }
  enterWork(id) {
    const hash = '#/work/' + id;
    if (this.history.state?.portfolioView === 'work' && this.history.length > 1) {
      this.replaceWork(id);
      return;
    }
    // Also seed a shelf entry when the first page is a direct work URL.
    this.history.replaceState(this.state('shelf'), '', '#/act-2');
    this.history.pushState(this.state('work'), '', hash);
  }
  replaceWork(id) {
    this.history.replaceState(this.state('work'), '', '#/work/' + id);
  }
  backToShelf() {
    if (this.history.state?.portfolioView === 'work' && this.history.length > 1) {
      this.history.back();
      return true;
    }
    this.history.replaceState(this.state('shelf'), '', '#/act-2');
    return false;
  }
}
