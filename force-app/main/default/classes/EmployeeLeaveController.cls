public with sharing class EmployeeLeaveController {
    @AuraEnabled
    public static List<Employee_Leave_Balance__c> getLeaveBalances(){
        try {
            List<Employee_Leave_Balance__c> myLeaves = new List<Employee_Leave_Balance__c>();
            myLeaves = [SELECT Id, Name, Leave__r.Name, Leave_Accured_So_Far__c, Leave_Annual_Quota__c, Leave_Available__c, Leave_Carryover__c, Leave_Consumed__c FROM Employee_Leave_Balance__c WITH SECURITY_ENFORCED];
            return myLeaves;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}