public with sharing class EmployeeLeaveController {
    @AuraEnabled
    public static LeaveDataWrapper getLeaveBalances(){
        try {
            List<Employee_Leave_Balance__c> myLeaves = new List<Employee_Leave_Balance__c>();
            myLeaves = [SELECT Id, Name, Leave__r.Name, Leave__c, Leave_Accured_So_Far__c, Leave_Annual_Quota__c, Leave_Available__c, Leave_Carryover__c, Leave_Consumed__c FROM Employee_Leave_Balance__c WITH SECURITY_ENFORCED ORDER BY Leave__r.Name ASC];

            List<Employee_Leave_Request__c> allLeaveRequest = new List<Employee_Leave_Request__c>();
            allLeaveRequest = [SELECT Id, Leave_Status__c, From_Date__c, To_Date__c, Leave_Type__c, Leave_Reason__c, CreatedBy.Name, CreatedDate, Number_Of_Leave_Days__c, First_Day_Second_Half__c, Last_Day_First_Half__c FROM Employee_Leave_Request__c WITH SECURITY_ENFORCED ORDER BY CreatedDate DESC];
            LeaveDataWrapper leaveDataObj = new LeaveDataWrapper();
            leaveDataObj.leaveBalanceList = myLeaves;
            leaveDataObj.pendingLeaveRequestList = new List<Employee_Leave_Request__c>();
            leaveDataObj.leaveHistory = new List<Employee_Leave_Request__c>();
            for(Employee_Leave_Request__c leavereq : allLeaveRequest) {
                if(leavereq.Leave_Status__c == 'Pending' || leavereq.Leave_Status__c == 'Partially Approved') {
                    leaveDataObj.pendingLeaveRequestList.add(leavereq);
                }
                else if(leavereq.Leave_Status__c == 'Approved') {
                    leaveDataObj.leaveHistory.add(leavereq);
                }
            }
            leaveRequestStats(leaveDataObj,allLeaveRequest);
            return leaveDataObj;
        } catch (Exception e) {
            throw new AuraHandledException('Exception>>'+e.getMessage()+' at line>>'+e.getLineNumber());
        }
    }
    @AuraEnabled (cacheable = true)
    public static List<User> getSearchedUsers(String searchUser){
        try {
            if(String.isNotBlank(searchUser) && String.isNotEmpty(searchUser)) {
                searchUser = '%'+searchUser+'%';
                SObjectAccessDecision securityDecision = Security.stripInaccessible(AccessType.READABLE, [SELECT Id, Name, SmallPhotoUrl, FullPhotoUrl FROM User WHERE Name LIKE :searchUser LIMIT 25]);
                return securityDecision.getRecords();
            }
            return null;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
    public static string raiseLeaveRequest(Employee_Leave_Request__c leaveRequestData, List<String> notifiedUsersList){
        try {
            if(leaveRequestData != null) {
                leaveRequestData.Leave_Status__c = 'Pending';
                SObjectAccessDecision securityDecision = Security.stripInaccessible(AccessType.CREATABLE, new List<Employee_Leave_Request__c>{leaveRequestData});
                insert securityDecision.getRecords();
                return 'success';
            }
            return 'fail';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    private static void leaveRequestStats(LeaveDataWrapper leaveDataObj, List<Employee_Leave_Request__c> leaveReqList) {
        try {
            Map<String, Double> weeklyLeaveMap = new Map<String,Double>{'Sun' => 0, 'Mon' => 0, 'Tue' => 0, 'Wed' => 0, 'Thu' => 0, 'Fri' => 0, 'Sat' => 0};
            List<Double> monthlyLeave = new List<Double>{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
            Map<String, Double> consumedLeaves = new Map<String, Double>();
            for(Employee_Leave_Request__c leaveReqObj : leaveReqList) {
                if(leaveReqObj.From_Date__c.year() == Date.today().year() && leaveReqObj.To_Date__c.year() == Date.today().year() && leaveReqObj.Leave_Status__c != 'Rejected') {
                    if(leaveReqObj.Number_Of_Leave_Days__c == 1) {
                        DateTime fromDate = (DateTime) leaveReqObj.From_Date__c;
                        Double addleavedate = weeklyLeaveMap.get(fromDate.format('E')) + 1;
                        weeklyLeaveMap.put(fromDate.format('E'), addleavedate);
                    }
                    else if(leaveReqObj.Number_Of_Leave_Days__c == 0.5) {
                        DateTime fromDate = (DateTime) leaveReqObj.From_Date__c;
                        Double addleavedate = weeklyLeaveMap.get(fromDate.format('E')) + 0.5;
                        weeklyLeaveMap.put(fromDate.format('E'), addleavedate);
                    }
                    else if(leaveReqObj.Number_Of_Leave_Days__c > 1) {
                        Date fromDate = leaveReqObj.From_Date__c;
                        Date toDate = leaveReqObj.To_Date__c;
                        Integer noOfDays = fromDate.daysBetween(toDate);
                        Double addleavedate;
                        for(Integer i = 0; i < noOfDays; i++) {
                            DateTime dt = (DateTime)fromDate.addDays(i);
                            if((i == 0 && leaveReqObj.First_Day_Second_Half__c) || (noOfDays == i-1 && leaveReqObj.Last_Day_First_Half__c)) {
                                addleavedate = weeklyLeaveMap.get(dt.format('E')) + 0.5;
                            }
                            else {
                                addleavedate = weeklyLeaveMap.get(dt.format('E')) + 1;
                            }
                            weeklyLeaveMap.put(dt.format('E'), addleavedate);
                        }
                    }
                    if(leaveReqObj.From_Date__c.month() == leaveReqObj.To_Date__c.month()) {
                        monthlyLeave[leaveReqObj.From_Date__c.month() - 1] += leaveReqObj.Number_Of_Leave_Days__c;
                    }
                    else {
                        monthlyLeave[leaveReqObj.From_Date__c.month() - 1] += 1;
                        monthlyLeave[leaveReqObj.To_Date__c.month() - 1] += 1;
                    }
                    if(consumedLeaves.containsKey(leaveReqObj.Leave_Type__c)) {
                        Double getDays = consumedLeaves.get(leaveReqObj.Leave_Type__c) + leaveReqObj.Number_Of_Leave_Days__c;
                        consumedLeaves.put(leaveReqObj.Leave_Type__c, getDays);
                    }
                    else {
                        consumedLeaves.put(leaveReqObj.Leave_Type__c, leaveReqObj.Number_Of_Leave_Days__c);
                    }
                }
            }
            leaveDataObj.weeklyLeaves = weeklyLeaveMap.values();
            leaveDataObj.monthlyLeaves = monthlyLeave;
            leaveDataObj.consumedLeaves = consumedLeaves.values();
            leaveDataObj.consumedLeaveTypeName = new List<String>();
            leaveDataObj.consumedLeaveTypeName.addAll(consumedLeaves.keySet());
        } catch(Exception e) {
            throw new AuraHandledException('Exception>>'+e.getMessage()+' at line>>'+e.getLineNumber());
        }
    }
    public class LeaveDataWrapper {
        @AuraEnabled
        public List<Employee_Leave_Balance__c> leaveBalanceList;
        @AuraEnabled
        public List<Employee_Leave_Request__c> pendingLeaveRequestList;
        @AuraEnabled
        public List<Employee_Leave_Request__c> leaveHistory;
        @AuraEnabled
        public List<Double> weeklyLeaves;
        @AuraEnabled
        public List<Double> monthlyLeaves;
        @AuraEnabled
        public List<String> consumedLeaveTypeName;
        @AuraEnabled
        public List<Double> consumedLeaves;
    }
}