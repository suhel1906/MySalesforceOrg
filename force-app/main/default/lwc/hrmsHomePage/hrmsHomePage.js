import { LightningElement, wire } from 'lwc';
import getHolidays from '@salesforce/apex/HRMSHomePageController.getAllHolidays';
import leaveIcon from '@salesforce/resourceUrl/OnLeavIcon';
import chartjs from '@salesforce/resourceUrl/ChartJs';
import { loadScript } from 'lightning/platformResourceLoader';
import getAllAccountsByRating from '@salesforce/apex/HRMSHomePageController.getAllAccountsByRating';

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
  chart;
  chartjsInitialized = false;
  config = {
    type: 'doughnut',
    data: {
      datasets: [
        {
          data: [10,20,30],
          backgroundColor: [
            'rgb(100,195,209)',
            'rgb(202,234,242)',
            'rgb(255,205,86)',
            'rgb(75,192,192)',
          ],
          label: 'Dataset 1',
          clip: {left: false, top: 2, right: -2, bottom: 0}
        }
      ],
      labels: []
    },
    options: {
      responsive: true,
      legend: {
        position: 'right'
      },
      animation: {
        animateScale: true,
        animateRotate: true
      }
    }
  };
  @wire(getAllAccountsByRating) accounts({ error, data }) {
    if (data) {
      for (var key in data) {
        //this.updateChart(data[key].count, data[key].label);
      }
      this.error = undefined;
    }
    else if (error) {
      this.error = error;
      this.accounts = undefined;
    }
  }
  updateChart(count, label) {

    this.chart.data.labels.push(label);
    this.chart.data.datasets.forEach((dataset) => {
      dataset.data.push(count);
    });
    this.chart.update();
  }
  start() {
    var parentThis = this;
    // Run timer code in every 100 milliseconds
    this.timeIntervalInstance = setInterval(function () {
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
    console.log("iconurl>>" + this.leaveIconUrl);
    var dateObj = new Date();
    this.currentDate = this.months[dateObj.getMonth()] + " " + dateObj.getDate() + ", " + dateObj.getFullYear() + " " + this.days[dateObj.getDay()];
    this.start();
    getHolidays().then(result => {
      if (result) {
        this.allHolidayList = result;
        this.holidayBgImg = "background-image: url(" + result[this.currentHolidayIndex].documents.VersionDataUrl + ");";
        this.currentHoliday = result[0].holidays;
        let date = new Date(this.currentHoliday.Holiday_Date__c);
        this.currentHolidayDate = date.toDateString();
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
  /*renderedCallback() {
    if (this.chartjsInitialized) {
      return;
    }
    this.chartjsInitialized = true;
    Promise.all([
      loadScript(this, chartjs)
    ]).then(() => {
      const ctx = this.template.querySelector('canvas.donut')
        .getContext('2d');
      this.chart = new window.Chart(ctx, this.config);
    })
      .catch(error => {
        console.log("error in loading chart>>" + error);
      });
  }*/
}