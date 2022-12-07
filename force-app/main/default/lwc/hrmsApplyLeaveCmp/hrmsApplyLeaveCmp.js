import { LightningElement, track, wire, api } from 'lwc';
import getLeaveTypesAndBalance from '@salesforce/apex/EmployeeLeaveController.getLeaveBalances';
import getRecord from '@salesforce/apex/EmployeeLeaveController.getSearchedUsers';
import raiseLeave from '@salesforce/apex/EmployeeLeaveController.raiseLeaveRequest';

export default class HrmsApplyLeaveCmp extends LightningElement {
  months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  @track leaveTypeOptions = [];
  @track currentMonthDate = [];
  @track notifyPeoplePillsList = [];
  @track calendarMonthYear = {currentYear: 0, currentMonth: 0, currentMonthName: ''};
  @api searchTerm = '';
  @track searcheduserData = [];
  @track selectedUserList = [];
  @track leaveRequestData = {From_Date__c: '', To_Date__c: '', Leave_Type__c: '', Leave_Reason__c: '', Number_Of_Leave_Days__c: 0, First_Day_Second_Half__c: false, Last_Day_First_Half__c: false, Leave_Full_Day_Or_Half_Day__c: ''};
  @track isShowFirstHalfSecondHalf = {fullDayFirstHalfSecondHalf: false, firstHalfToSecondhalf: false};
  @wire(getRecord, { searchUser: '$searchTerm'})
    wiredUsers({ error, data }) {
        if (data) {
            this.searcheduserData = data;
        } else if (error) {
            this.searcheduserData = undefined;
        }
    }
  connectedCallback() {
    let date = new Date();
    this.getCalendarDates(date.getFullYear(), date.getMonth());
    getLeaveTypesAndBalance().then(result => {
      if(result) {
        for(let x of result) {
          this.leaveTypeOptions.push({label: x.Leave__r.Name + ' (' + x.Leave_Available__c + ')', value: x.Leave__r.Name});
        }
        this.template.querySelector('[data-id="leaveTypes"]').options = this.leaveTypeOptions;
      }
    }).catch(error => {
      console.log("error>>"+JSON.stringify(error));
    });
  }
  getCalendarDates(year, month) {
    let monthDates = [];
    let lastMonthDate = new Date(year, month, 0);
    let currentMonthStartDay = new Date(year, month, 1);
    let currentMonthEndDate = new Date(year, month + 1, 0);
    this.currentMonthDate = [];
    for(let i = 0; i < currentMonthStartDay.getDay(); i++) {
      monthDates.push({day: (lastMonthDate.getDate() - currentMonthStartDay.getDay() + 1) + i, textColor: 'color:rgb(212,212,212);'});
    }
    for(let i=1; i <= currentMonthEndDate.getDate(); i++) {
      monthDates.push({day: i, textColor: 'color:black;'});
      if(monthDates.length == 7) {
        this.currentMonthDate.push({dates: monthDates});
        monthDates = [];
      }
    }
    if(monthDates.length > 0) {
      this.currentMonthDate.push({dates: monthDates});
    }
    this.calendarMonthYear = {currentYear: year, currentMonth: month, currentMonthName: this.months[month]};
  }
  hideModalBox(event) {
    this.dispatchEvent(new CustomEvent('modalclose'));
  }
  handleNotifiedUsers(event) {
    if(event.target.value.length > 1) {
      this.searchTerm = event.target.value;
      this.template.querySelector('[data-id="userlistsection"]').classList.add('slds-is-open');
      this.isShowNotifylist = true;
    }
    else {
      this.searchTerm = '';
      this.template.querySelector('[data-id="userlistsection"]').classList.remove('slds-is-open');
    }
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
  handleNotifyUser(event) {
    let liValue = event.currentTarget.dataset.item;
    let value = {};
    for(let x of this.searcheduserData) {
      if(x.Id == liValue) {
        value = x;
        break;
      }
    }
    let obj = {type: 'avatar',href: '',label: value.Name,src: value.SmallPhotoUrl,fallbackIconName: 'standard:user',variant: 'circle',alternativeText: value.Name, name: value.Id};
    this.selectedUserList.push(obj);
    this.template.querySelector('[data-id="userlistsection"]').classList.remove('slds-is-open');
    this.template.querySelector('.search-input').value = '';
  }
  handleItemRemove(event) {
    const index = event.detail.index;
    this.selectedUserList.splice(index, 1);
  }
  handleLeaveTypeChange(event) {
    this.leaveRequestData.Leave_Type__c = event.detail.value;
  }
  handleInputChange(event) {
    if(event.target.name == "leaveNotes") {
      this.leaveRequestData.Leave_Reason__c = event.target.value;
      return;
    }
    if(event.target.name == 'fromdate') {
      this.leaveRequestData.From_Date__c = event.target.value;
    }
    else if(event.target.name == "todate") {
      this.leaveRequestData.To_Date__c = event.target.value;
    }
    if(this.leaveRequestData.From_Date__c && this.leaveRequestData.To_Date__c) {
      let fromDate = new Date(this.leaveRequestData.From_Date__c);
      let toDate = new Date(this.leaveRequestData.To_Date__c);
      const diffTime = Math.abs(toDate - fromDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      this.leaveRequestData.Number_Of_Leave_Days__c = diffDays;
      if(this.leaveRequestData.Number_Of_Leave_Days__c <= 1) {
        this.isShowFirstHalfSecondHalf.fullDayFirstHalfSecondHalf = true;
        this.isShowFirstHalfSecondHalf.firstHalfToSecondhalf = false;
        this.leaveRequestData.Leave_Full_Day_Or_Half_Day__c = 'Full Day';
      }
      else {
        this.isShowFirstHalfSecondHalf.fullDayFirstHalfSecondHalf = false;
        this.isShowFirstHalfSecondHalf.firstHalfToSecondhalf = true;
        this.leaveRequestData.Leave_Full_Day_Or_Half_Day__c = '';
      }
    }
    else {
      this.isShowFirstHalfSecondHalf.fullDayFirstHalfSecondHalf = false;
      this.isShowFirstHalfSecondHalf.firstHalfToSecondhalf = false;
    }
  }
  handleButtonClick(event) {
    try {
      let fromDate = new Date(this.leaveRequestData.From_Date__c);
      let toDate = new Date(this.leaveRequestData.To_Date__c);
      const diffTime = Math.abs(toDate - fromDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if(event.target.name === "firstDaySecondHalf") {
        this.leaveRequestData.First_Day_Second_Half__c = true;
      }
      else if(event.target.name === "firstDayFirstHalf") {
        this.leaveRequestData.First_Day_Second_Half__c = false;
      }
      else if(event.target.name === "secondDayFirstHalf") {
        this.leaveRequestData.Last_Day_First_Half__c = true;
      }
      else if(event.target.name === "secondDaySecondHalf") {
        this.leaveRequestData.Last_Day_First_Half__c = false;
      }
      else if(event.target.name === "oneDayFirstHalf") {
        this.leaveRequestData.Leave_Full_Day_Or_Half_Day__c = 'First Half';
      }
      else if(event.target.name === "oneDaySecondHalf") {
        this.leaveRequestData.Leave_Full_Day_Or_Half_Day__c = 'Second Half';
      }
      else {
        this.leaveRequestData.Leave_Full_Day_Or_Half_Day__c = 'Full Day';
      }
      if(this.isShowFirstHalfSecondHalf.fullDayFirstHalfSecondHalf) {
        let allBtn = this.template.querySelectorAll(".btngrp");
        for(let x of allBtn) {
          if(x.name === event.target.name) {
            x.variant = "brand";
          }
          else {
            x.variant = "neutral";
          }
        }
        if(event.target.name !== "oneDayFullDay" && this.leaveRequestData.From_Date__c && this.leaveRequestData.To_Date__c) {
          this.leaveRequestData.Number_Of_Leave_Days__c = diffDays - 0.5;
        }
        else {
          this.leaveRequestData.Number_Of_Leave_Days__c = 1;
        }
      }
      else if(this.isShowFirstHalfSecondHalf.firstHalfToSecondhalf) {
        let allbtn = this.template.querySelectorAll(".btngrp");
        let temp = '', temp1 = '';
        for(let x of allbtn) {
          if(x.name === event.target.name) {
            x.variant = "brand";
          }
          else if(event.target.classList.toString().includes("btngrp")) {
            x.variant = "neutral";
          }
          if(x.variant === "brand") {
            temp = x.name;
          }
        }

        let allbtn1 = this.template.querySelectorAll(".btn1grp1");
        for(let x of allbtn1) {
          if(x.name === event.target.name) {
            x.variant = "brand";
          }
          else if(event.target.classList.toString().includes("btn1grp1")) {
            x.variant = "neutral";
          }
          if(x.variant === "brand") {
            temp1 = x.name;
          }
        }
        if(temp === "firstDaySecondHalf" && temp1 === "secondDayFirstHalf") {
          this.leaveRequestData.Number_Of_Leave_Days__c = diffDays - 1;
        }
        else if(temp === "firstDaySecondHalf" || temp1 === "secondDayFirstHalf") {
          this.leaveRequestData.Number_Of_Leave_Days__c = diffDays - 0.5;
        }
        else {
          this.leaveRequestData.Number_Of_Leave_Days__c = diffDays;
        }
      }
    }
    catch(ex) {
      console.log(ex);
    }
  }
  raiseLeaveRequest(event) {
    console.log("leaveData>>"+JSON.stringify(this.leaveRequestData));
    let notifiedUsers = [];
    for(let x of this.selectedUserList) {
      notifiedUsers.push(x.name);
    }
    raiseLeave({leaveRequestData: this.leaveRequestData, notifiedUsersList: notifiedUsers}).then(result => {
      console.log(result);
    }).catch(error => {
      console.log(error);
    });
  }
}