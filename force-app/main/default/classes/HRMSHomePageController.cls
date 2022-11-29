public with sharing class HRMSHomePageController {
    @AuraEnabled
    public static DataWrapper getAllHolidays(){
        try {
            List<Holiday__c> getAllHolidays = new List<Holiday__c>();
            getAllHolidays = [SELECT Id, Name, Holiday_Date__c FROM Holiday__c WITH SECURITY_ENFORCED ORDER BY Holiday_Date__c ASC ];
            List<Employee_Attendence__c> getAttendenceList = new List<Employee_Attendence__c>();
            getAttendenceList = [SELECT Id, In_Time__c, Out_Time__c, Employee_Present_Date__c FROM Employee_Attendence__c WHERE Employee_Present_Date__c =:Date.today() WITH SECURITY_ENFORCED];
            Set<Id> holidaySetId = new Set<Id>();
            for(Holiday__c holidayObj : getAllHolidays) {
                holidaySetId.add(holidayObj.Id);
            }
            List<ContentDocumentLink> getRelatedFiles = new List<ContentDocumentLink>();
            getRelatedFiles = [SELECT ContentDocumentId, LinkedEntityId FROM ContentDocumentLink WHERE LinkedEntityId IN :holidaySetId WITH SECURITY_ENFORCED];
            Map<Id, Id> contentDocVsLinkMap = new Map<Id,Id>();
            for(ContentDocumentLink conDocLinkObj : getRelatedFiles) {
                contentDocVsLinkMap.put(conDocLinkObj.LinkedEntityId, conDocLinkObj.ContentDocumentId);
            }
            List<ContentVersion> getFiles = new List<ContentVersion>();
            getFiles = [SELECT Id, VersionDataURL, ContentDocumentId FROM ContentVersion WHERE ContentDocumentId IN :contentDocVsLinkMap.values() WITH SECURITY_ENFORCED];
            Map<Id, ContentVersion> conDocIdVsVersion = new Map<Id,ContentVersion>();
            for(ContentVersion conVerObj : getFiles) {
                conDocIdVsVersion.put(conVerObj.ContentDocumentId, conVerObj);
            }
            List<DocumentDateWrapper> holidayDataWrapp = new List<DocumentDateWrapper>();
            for(Holiday__c holidayObj : getAllHolidays) {
                DocumentDateWrapper wrapper = new DocumentDateWrapper();
                wrapper.holidays = holidayObj;
                wrapper.documents = conDocIdVsVersion.get(contentDocVsLinkMap.get(holidayObj.Id));
                holidayDataWrapp.add(wrapper);
            }
            DataWrapper dataWrapp = new DataWrapper();
            dataWrapp.holidays = holidayDataWrapp;
            if(!getAttendenceList.isEmpty()) {
                dataWrapp.attendenceData = getAttendenceList[0];
            }
            return dataWrapp;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
    public static Employee_Attendence__c attendenceAction(String attendenceName, String currentDateTime){
        try {
            Map<String, Object> cuerrentDateTimeMap = (Map<String, Object>) JSON.deserializeUntyped(currentDateTime);
            List<Employee_Attendence__c> getTodayAttendence = new List<Employee_Attendence__c>();
            getTodayAttendence = [SELECT Id, In_Time__c, Out_Time__c FROM Employee_Attendence__c WHERE Employee_Present_Date__c =:Date.parse((String) cuerrentDateTimeMap.get('todayDate')) WITH SECURITY_ENFORCED ];
            if(getTodayAttendence != null && getTodayAttendence.size() > 0) {
                if(attendenceName == 'Clock In') {
                    getTodayAttendence[0].In_Time__c = Time.newInstance((Integer) cuerrentDateTimeMap.get('hours'), (Integer) cuerrentDateTimeMap.get('minutes'), (Integer) cuerrentDateTimeMap.get('seconds'), 0);
                }
                else if(attendenceName == 'Clock Out') {
                    getTodayAttendence[0].Out_Time__c = Time.newInstance((Integer) cuerrentDateTimeMap.get('hours'), (Integer) cuerrentDateTimeMap.get('minutes'), (Integer) cuerrentDateTimeMap.get('seconds'), 0);
                }
                SObjectAccessDecision decision = Security.stripInaccessible(AccessType.UPDATABLE, getTodayAttendence);
                return (Employee_Attendence__c) decision.getRecords()[0];
            }
            else {
                Employee_Attendence__c createAttendence = new Employee_Attendence__c();
                createAttendence.Name = String.valueOf(Date.today());
                createAttendence.Employee_Present_Date__c = Date.parse((String) cuerrentDateTimeMap.get('todayDate'));
                if(attendenceName == 'Clock In') {
                    createAttendence.In_Time__c = Time.newInstance((Integer) cuerrentDateTimeMap.get('hours'), (Integer) cuerrentDateTimeMap.get('minutes'), (Integer) cuerrentDateTimeMap.get('seconds'), 0);
                }
                else if(attendenceName == 'Clock Out') {
                    createAttendence.Out_Time__c = Time.newInstance((Integer) cuerrentDateTimeMap.get('hours'), (Integer) cuerrentDateTimeMap.get('minutes'), (Integer) cuerrentDateTimeMap.get('seconds'), 0);
                }
                List<Employee_Attendence__c> createTodayAttendencerec = new List<Employee_Attendence__c>();
                createTodayAttendencerec.add(createAttendence);
                SObjectAccessDecision decision = Security.stripInaccessible(AccessType.CREATABLE, createTodayAttendencerec);
                insert decision.getRecords();
                return (Employee_Attendence__c) decision.getRecords()[0];
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    public class DocumentDateWrapper {
        @AuraEnabled
        public Holiday__c holidays;
        @AuraEnabled
        public ContentVersion documents;
    }
    public Class DataWrapper {
        @AuraEnabled
        public List<DocumentDateWrapper> holidays;
        @AuraEnabled
        public Employee_Attendence__c attendenceData;
    }
}