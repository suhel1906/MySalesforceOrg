import { LightningElement } from 'lwc';
import elephantimage from '@salesforce/resourceUrl/ElephantImg';

export default class HrmsMeTabCmp extends LightningElement {
  leaveStatOptions = [{label: "Jan 2022 - Dec 2022", value:"2022"}, {label: "Jan 2023 - Dec 2023", value:"2023"}];
  leaveStatVal = '2022';
  elephantUrl = elephantimage;
}