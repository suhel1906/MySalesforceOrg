import { LightningElement, track } from 'lwc';

export default class HrmsMyAttendenceShiftSchedule extends LightningElement {
  months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  @track calendarMonthYear = {currentYear: 0, currentMonth: 0, currentMonthName: ''};
  @track currentMonthDate = [];
  connectedCallback() {
    let date = new Date();
    this.getCalendarDates(date.getFullYear(), date.getMonth());
  }
  getCalendarDates(year, month) {
    let monthDates = [];
    let lastMonthDate = new Date(year, month, 0);
    let currentMonthStartDay = new Date(year, month, 1);
    let currentMonthEndDate = new Date(year, month + 1, 0);
    this.currentMonthDate = [];
    for(let i = 0; i < currentMonthStartDay.getDay(); i++) {
      monthDates.push({day: (lastMonthDate.getDate() - currentMonthStartDay.getDay() + 1) + i, textColor: 'color:rgb(212,212,212);height:10rem;width:10rem;', isShowAutoShift: false, isShowWeekOff: false, isShowLeave: false});
    }
    for(let i=1; i <= currentMonthEndDate.getDate(); i++) {
      let weekOff = false;
      if(monthDates.length == 6 || monthDates.length == 0) {
        monthDates.push({day: i, textColor: 'color:black;height:10rem;width:10rem;', isShowAutoShift: false, isShowWeekOff: true, isShowLeave: false});
      }
      else {
        monthDates.push({day: i, textColor: 'color:black;height:10rem;width:10rem;', isShowAutoShift: true, isShowWeekOff: false, isShowLeave: false});
      }
      if(monthDates.length == 7) {
        this.currentMonthDate.push({dates: monthDates});
        monthDates = [];
      }
    }
    if(monthDates.length > 0) {
      let totalLength = 7 - monthDates.length;
      for(let i=1; i <= totalLength;i++) {
        monthDates.push({day: i, textColor: 'color:rgb(212,212,212);height:10rem;width:10rem;', isShowAutoShift: false, isShowWeekOff: false, isShowLeave: false});
      }
      this.currentMonthDate.push({dates: monthDates});
    }
    this.calendarMonthYear = {currentYear: year, currentMonth: month, currentMonthName: this.months[month]};
  }
  handleCalendarChange(event) {
    if(event.target.name == 'nextMonth') {
      if(this.calendarMonthYear.currentMonth == 11) {
        this.getCalendarDates(this.calendarMonthYear.currentYear + 1, 0);
      }
      else {
        this.getCalendarDates(this.calendarMonthYear.currentYear, this.calendarMonthYear.currentMonth + 1);
      }
    }
    else if(event.target.name == 'previousMonth') {
      if(this.calendarMonthYear.currentMonth == 0) {
        this.getCalendarDates(this.calendarMonthYear.currentYear - 1, 11);
      }
      else {
        this.getCalendarDates(this.calendarMonthYear.currentYear, this.calendarMonthYear.currentMonth - 1);
      }
    }
  }
}