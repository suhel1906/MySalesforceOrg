import { LightningElement, track } from 'lwc';
import getAttendence from '@salesforce/apex/HRMSAttendenceController.getAllAttendence';

export default class MyAttendenceLog extends LightningElement {
  months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  attendenceMonths = [];
  @track attendenceData = [];
  date = new Date();
  isShowSpinner = false;
  connectedCallback() {
    this.isShowSpinner = true;
    let currentMonth = this.date.getMonth() === 0 ? 1 : this.date.getMonth(), count = 1, currentYear = this.date.getFullYear();
    for(let i=1;i<=6;i++) {
      this.attendenceMonths.push({monthLabel: this.months[currentMonth - count], monthAndYear: (currentMonth - count) + 1 + '-' + currentYear});
      if(currentMonth - count === 0) {
        currentMonth = this.months.length;
        count = 1;
        currentYear = this.date.getFullYear - 1;
      }
      else {
        count += 1;
      }
    }
    this.getAttendenceData(this.date.getMonth() + 1, this.date.getFullYear());
  }
  handleClick(event) {
    let allBtn = this.template.querySelectorAll('[data-name="monthsbtn"]');
    for(let x of allBtn) {
      if(event.target.label === x.label) {
        x.variant = "brand";
      }
      else {
        x.variant = "neutral";
      }
    }
    this.isShowSpinner = true;
    if(event.target.label === "30 days") {
      this.getAttendenceData(this.date.getMonth() + 1, this.date.getFullYear());
    }
    else {
      let dateYearList = event.target.dataset.value.split("-");
      this.getAttendenceData(parseInt(dateYearList[0]), parseInt(dateYearList[1]));
    }
  }
  getAttendenceData(month, year) {
    this.attendenceData = [];
    getAttendence({month: month, year: year}).then(result => {
      if(result) {
        this.attendenceData = result;
      }
      this.isShowSpinner = false;
    }).catch(error => {
      console.log(JSON.stringify(error));
    });
  }
}