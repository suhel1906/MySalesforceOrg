import { LightningElement, wire } from 'lwc';
import getHolidays from '@salesforce/apex/HRMSHomePageController.getAllHolidays';
import leaveIcon from '@salesforce/resourceUrl/OnLeavIcon';
import attendenceActions from '@salesforce/apex/HRMSHomePageController.attendenceAction';

export default class HrmsHomePage extends LightningElement {
  months = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
  days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  currentDate = '';
  timeVal;
  leaveIconUrl;
  seconds;
  isShowInbox = false;
  allHolidayList = [];
  currentHoliday = {};
  currentHolidayIndex = 0;
  currentHolidayDate = '';
  holidayBgImg = '';
  start() {
    var parentThis = this;
    // Run timer code in every 100 milliseconds
    setInterval(function () {
      let currentTime = new Date();
      var hours = currentTime.getHours();
      var minutes = currentTime.getMinutes();
      var ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      parentThis.timeVal = hours + ':' + minutes;
      parentThis.seconds = ":" + currentTime.getSeconds() + ampm;
    }, 1000);
  }
  connectedCallback() {
    this.leaveIconUrl = leaveIcon;
    var dateObj = new Date();
    this.currentDate = this.months[dateObj.getMonth()] + " " + dateObj.getDate() + ", " + dateObj.getFullYear() + " " + this.days[dateObj.getDay()];
    this.start();
    getHolidays().then(result => {
      if (result) {
        this.allHolidayList = result.holidays;
        this.holidayBgImg = "background-image: url(" + result.holidays[this.currentHolidayIndex].documents.VersionDataUrl + ");";
        this.currentHoliday = result.holidays[0].holidays;
        let date = new Date(this.currentHoliday.Holiday_Date__c);
        this.currentHolidayDate = date.toDateString();
        if(result.attendenceData) {
          if(result.attendenceData.In_Time__c && result.attendenceData.Out_Time__c) {
            this.template.querySelector('[data-id="clockin"]').variant = "neutral";
            this.template.querySelector('[data-id="clockin"]').label = "Clock In";
          }
          else {
            this.template.querySelector('[data-id="clockin"]').variant = "destructive";
            this.template.querySelector('[data-id="clockin"]').label = "Clock Out";
          }
        }
      }
    }).catch(error => {
      console.log(error);
    });
  }
  changeHoliday(event) {
    if (event.target.value === 'previousHoliday') {
      this.currentHolidayIndex = this.currentHolidayIndex - 1;
      if (this.currentHolidayIndex < 0) {
        this.currentHolidayIndex = this.allHolidayList.length - 1;
      }
      this.currentHoliday = this.allHolidayList[this.currentHolidayIndex].holidays;
      let date = new Date(this.currentHoliday.Holiday_Date__c);
      this.currentHolidayDate = date.toDateString();
      this.holidayBgImg = "background-image: url(" + this.allHolidayList[this.currentHolidayIndex].documents.VersionDataUrl + ");";
    }
    else if (event.target.value === 'nextHoliday') {
      this.currentHolidayIndex = this.currentHolidayIndex + 1;
      if (this.currentHolidayIndex >= this.allHolidayList.length) {
        this.currentHolidayIndex = 0;
      }
      this.currentHoliday = this.allHolidayList[this.currentHolidayIndex].holidays;
      let date = new Date(this.currentHoliday.Holiday_Date__c);
      this.currentHolidayDate = date.toDateString();
      this.holidayBgImg = "background-image: url(" + this.allHolidayList[this.currentHolidayIndex].documents.VersionDataUrl + ");";
    }
  }
  handleAttendance(event) {
    let inorOut = event.target.label;
    if(event.target.label == 'Clock In') {
      event.target.variant = 'destructive';
      event.target.label = 'Clock Out';
      event.target.disabled = true;
    }
    else if(event.target.label == 'Clock Out') {
      event.target.variant = 'neutral';
      event.target.label = 'Clock In';
    }
    let date = new Date();
    let target = event.target;
    let currentDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
    let currentDateTimeWrapp = {todayDate: currentDate, hours: new Date().getHours(), minutes: date.getMinutes(), seconds: date.getSeconds()};
    attendenceActions({attendenceName: inorOut, currentDateTime: JSON.stringify(currentDateTimeWrapp)})
      .then(result => {
        if(result) {
          target.disabled = false;
        }
      }).catch(error => {
        console.log(JSON.stringify(error));
      });
  }
}