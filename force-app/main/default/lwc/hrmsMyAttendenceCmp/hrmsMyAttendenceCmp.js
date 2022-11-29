import { LightningElement, track } from 'lwc';
import getAttendence from '@salesforce/apex/HRMSAttendenceController.getAllAttendence';

export default class HrmsMyAttendenceCmp extends LightningElement {
  @track attendenceData = [];
  connectedCallback() {
    getAttendence().then(result => {
      if(result) {
        this.attendenceData = result;
        console.log(JSON.stringify(result));
      }
    }).catch(error => {
      console.log(JSON.stringify(error));
    });
  }
}