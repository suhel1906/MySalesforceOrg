import { LightningElement, track } from 'lwc';

export default class HrmsMyAttendenceCmp extends LightningElement {
  @track timeVal;
  @track seconds;
  @track todayDate;
  @track booleanVariables = {isShowAttendenceLog: true, isShowShiftSchedule: false, isShowAttendenceReq: false};
  connectedCallback() {
    this.todayDate = new Date();
    this.start();
  }
  start() {
    var parentThis = this;
    // Run timer code in every 100 milliseconds
    setInterval(function () {
      let currentTime = new Date();
      var hours = currentTime.getHours();
      var minutes = currentTime.getMinutes();
      var ampm = hours >= 12 ? ' PM' : ' AM';
      hours = hours % 12;
      hours = hours ? '0'+hours : 12;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      parentThis.timeVal = hours + ':' + minutes;
      parentThis.seconds = ":" + currentTime.getSeconds() + ampm;
    }, 1000);
  }
  handleClick(event) {
    if(event.target.label === "Attendence Log") {
      this.booleanVariables.isShowAttendenceLog = true;
      this.booleanVariables.isShowShiftSchedule = false;
      this.booleanVariables.isShowAttendenceReq = false;
    }
    else if(event.target.label === "Shift Schedule") {
      this.booleanVariables.isShowShiftSchedule = true;
      this.booleanVariables.isShowAttendenceLog = false;
      this.booleanVariables.isShowAttendenceReq = false;
    }
    else if(event.target.label === "Attendence Request") {
      this.booleanVariables.isShowAttendenceReq = true;
      this.booleanVariables.isShowAttendenceLog = false;
      this.booleanVariables.isShowShiftSchedule = true;
    }
    for(let x of this.template.querySelectorAll('[data-value="logAndrequest"]')) {
      if(x.label === event.target.label) {
        x.variant = "brand";
      }
      else {
        x.variant = "neutral";
      }
    }
  }
}