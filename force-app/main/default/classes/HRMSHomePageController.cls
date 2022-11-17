public with sharing class HRMSHomePageController {
    @AuraEnabled
    public static List<DocumentDateWrapper> getAllHolidays(){
        try {
            List<Holiday__c> getAllHolidays = new List<Holiday__c>();
            getAllHolidays = [SELECT Id, Name, Holiday_Date__c FROM Holiday__c ORDER BY Holiday_Date__c ASC];
            Set<Id> holidaySetId = new Set<Id>();
            for(Holiday__c holidayObj : getAllHolidays) {
                holidaySetId.add(holidayObj.Id);
            }
            List<ContentDocumentLink> getRelatedFiles = new List<ContentDocumentLink>();
            getRelatedFiles = [SELECT ContentDocumentId, LinkedEntityId FROM ContentDocumentLink WHERE LinkedEntityId IN :holidaySetId];
            Map<Id, Id> contentDocVsLinkMap = new Map<Id,Id>();
            for(ContentDocumentLink conDocLinkObj : getRelatedFiles) {
                contentDocVsLinkMap.put(conDocLinkObj.LinkedEntityId, conDocLinkObj.ContentDocumentId);
            }
            List<ContentVersion> getFiles = new List<ContentVersion>();
            getFiles = [SELECT Id, VersionDataURL, ContentDocumentId FROM ContentVersion WHERE ContentDocumentId IN :contentDocVsLinkMap.values()];
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
            return holidayDataWrapp;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled(cacheable=true)
        public static List<DataSet> getAllAccountsByRating(){
        List<AggregateResult> result =  [Select Count(Id) cnt, Rating from Account  group by Rating limit 10];
        List<DataSet> dataSet = new List<DataSet>();
        for(AggregateResult ar:result){
        String status =  (String)ar.get('Rating') ;
        Integer total =(Integer)ar.get('cnt');
        dataSet.add(new DataSet(status ,total));
        }
        System.debug('dataSet'+dataSet);
        return dataSet ;
    }
    public class DataSet{
        public DataSet(String label ,Integer count){
        this.label  = label ;
        this.count = count ;
        }
        @AuraEnabled
        public String label {get;set;}
        @AuraEnabled
        public Integer  count {get;set;}
    }
    public class DocumentDateWrapper {
        @AuraEnabled
        public Holiday__c holidays;
        @AuraEnabled
        public ContentVersion documents;
    }
}