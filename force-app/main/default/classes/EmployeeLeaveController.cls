public with sharing class EmployeeLeaveController {
    @AuraEnabled
    public static List<Employee_Leave_Balance__c> getLeaveBalances(){
        try {
            List<Employee_Leave_Balance__c> myLeaves = new List<Employee_Leave_Balance__c>();
            myLeaves = [SELECT Id, Name, Leave__r.Name, Leave__c, Leave_Accured_So_Far__c, Leave_Annual_Quota__c, Leave_Available__c, Leave_Carryover__c, Leave_Consumed__c FROM Employee_Leave_Balance__c WITH SECURITY_ENFORCED ORDER BY Leave__r.Name ASC];
            return myLeaves;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
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
                SObjectAccessDecision securityDecision = Security.stripInaccessible(AccessType.CREATABLE, new List<Employee_Leave_Request__c>{leaveRequestData});
                insert securityDecision.getRecords();
                return 'success';
            }
            return 'fail';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}