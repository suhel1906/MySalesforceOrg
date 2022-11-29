import { LightningElement, track } from 'lwc';

export default class HrmsHomePageComponent extends LightningElement {
  @track showTabBool = {homeTab: true, meTab: false, inboxTab: false, myTeamTab: false, myFinance: false, orgTab: false};
  onTabChange(event) {
    let tabName = event.currentTarget.dataset.value;
    if(tabName === "HomeTab") {
      this.showTabBool = {homeTab: true, meTab: false, inboxTab: false, myTeamTab: false, myFinance: false, orgTab: false};
    }
    else if(tabName === "MeTab") {
      this.showTabBool = {homeTab: false, meTab: true, inboxTab: false, myTeamTab: false, myFinance: false, orgTab: false};
    }
  }
}