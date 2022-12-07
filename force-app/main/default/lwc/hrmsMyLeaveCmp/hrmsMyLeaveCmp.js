import { LightningElement, track } from 'lwc';
import elephantimage from '@salesforce/resourceUrl/ElephantImg';
import getLeaveBalance from '@salesforce/apex/EmployeeLeaveController.getLeaveBalances';

export default class HrmsMyLeaveCmp extends LightningElement {
  leaveStatOptions = [{label: "Jan 2022 - Dec 2022", value:"2022"}, {label: "Jan 2023 - Dec 2023", value:"2023"}];
  leaveStatVal = '2022';
  elephantUrl = elephantimage;
  @track chartData = [];
  @track isShowApplyleave = false;
  connectedCallback() {
    let chartBorderColors = {casualLeave: ['rgb(152,180,51)', 'rgb(224,232,193)'], earnedLeave: ['rgb(241,197,51)', 'rgb(250,237,193)'], marriageLeave: ['rgb(93,158,211)', 'rgb(195 215 231)'], covidLeave: ['rgb(194,184,157)', 'RGB(234 212 154)']};
    getLeaveBalance().then(result => {
      if(result) {
        for(let x of result) {
          let chartObj = {data: [], borderColor: [], leaveBalanceData: x, isShowChart: true};
          if(x.Leave_Available__c == 0 && x.Leave_Consumed__c == 0) {
            chartObj.isShowChart = false;
          }
          else {
            chartObj.data.push(x.Leave_Available__c);
            chartObj.data.push(x.Leave_Consumed__c);
            if(x.Leave__r.Name.includes('Casual')) {
              chartObj.borderColor = chartBorderColors.casualLeave;
            }
            else if(x.Leave__r.Name.includes('Earn')) {
              chartObj.borderColor = chartBorderColors.earnedLeave;
            }
            else if(x.Leave__r.Name.includes('Marriage')) {
              chartObj.borderColor = chartBorderColors.marriageLeave;
            }
            else if(x.Leave__r.Name.includes('Covid')) {
              chartObj.borderColor = chartBorderColors.covidLeave;
            }
          }
          this.chartData.push(chartObj);
        }
      }
    }).catch(error => {
      console.log("error>>"+JSON.stringify(error));
    });
  }
  showApplyLeaveModal(event) {
    this.isShowApplyleave = true;
  }
  closeApplyLeaveModal(event) {
    this.isShowApplyleave = false;
  }
}