public with sharing class HRMSAttendenceController {
    @AuraEnabled
    public static List<AttendenceWrapp> getAllAttendence(){
        try {
            List<Employee_Attendence__c> getAttendenceList = new List<Employee_Attendence__c>();
            getAttendenceList = [SELECT Id, In_Time__c, Out_Time__c, Employee_Present_Date__c FROM Employee_Attendence__c WITH SECURITY_ENFORCED ORDER BY Employee_Present_Date__c DESC LIMIT 30];
            List<Holiday__c> getAllHolidays = new List<Holiday__c>();
            getAllHolidays = [SELECT Id, Name, Holiday_Date__c FROM Holiday__c WITH SECURITY_ENFORCED ORDER BY Holiday_Date__c ASC];
            Map<Date, Employee_Attendence__c> dateVsAttnedenceMap = new Map<Date, Employee_Attendence__c>();
            Set<Date> holidayDateSet = new Set<Date>();
            for(Holiday__c hldy : getAllHolidays) {
                holidayDateSet.add(hldy.Holiday_Date__c);
            }
            for(Employee_Attendence__c attObj : getAttendenceList) {
                dateVsAttnedenceMap.put(attObj.Employee_Present_Date__c, attObj);
            }
            List<AttendenceWrapp> attendenceWrapp = new List<AttendenceWrapp>();
            for(Integer i = 0; i < 30; i++) {
                DateTime getDate = Date.today().addDays(-i);
                String weekDayName = getDate.format('EEEE');
                AttendenceWrapp wrappObj = new AttendenceWrapp();
                wrappObj.dateFormat = getDate.format('dd MMM yyyy');
                if(weekDayName == 'Sunday' || weekDayName == 'Saturday') {
                    wrappObj.isWeekOff = true;
                }
                else if(holidayDateSet.contains(Date.today().addDays(-i))) {
                    wrappObj.isHoliday = true;
                }
                else if(dateVsAttnedenceMap.containsKey(Date.today().addDays(-i))) {
                    Employee_Attendence__c attendenceObj = dateVsAttnedenceMap.get(Date.today().addDays(-i));
                    wrappObj.inTime = attendenceObj.In_Time__c;
                    wrappObj.outTime = attendenceObj.Out_Time__c;
                    wrappObj.empPresentDate = attendenceObj.Employee_Present_Date__c;
                    wrappObj.isNoTimeEntriesLogged = false;
                    if(attendenceObj.Out_Time__c != null && attendenceObj.In_Time__c != null) {
                        wrappObj.effectiveHours = (attendenceObj.Out_Time__c.hour() - attendenceObj.In_Time__c.hour()) + 'h ' + (attendenceObj.Out_Time__c.minute() - attendenceObj.In_Time__c.minute()) + 'm';
                        wrappObj.grossHours = wrappObj.effectiveHours;
                        Decimal calcHourPercent = (attendenceObj.Out_Time__c.hour() - attendenceObj.In_Time__c.hour()) + ((Decimal)(attendenceObj.Out_Time__c.minute() - attendenceObj.In_Time__c.minute()) / 100);
                        wrappObj.hoursPercent = 'background-image: linear-gradient(to top, rgb(100, 195, 209) '+ ((calcHourPercent / 9) * 100)+'%, transparent 0px);';
                    }
                    else {
                        wrappObj.effectiveHours = '0h 0m +';
                        wrappObj.grossHours = '0h 0m +';
                        wrappObj.hoursPercent = 'background-image: linear-gradient(to top, rgb(100, 195, 209) 0%, transparent 0px);';
                    }
                    wrappObj.isTimeEntriesLogged = true;
                }
                else {
                    wrappObj.isNoTimeEntriesLogged = true;
                }
                attendenceWrapp.add(wrappObj);
            }
            return attendenceWrapp;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    public class AttendenceWrapp {
        @AuraEnabled
        public Time inTime;
        @AuraEnabled
        public Time outTime;
        @AuraEnabled
        public String dateFormat;
        @AuraEnabled
        public Date empPresentDate;
        @AuraEnabled
        public boolean isWeekOff;
        @AuraEnabled
        public boolean isHoliday;
        @AuraEnabled
        public boolean isNoTimeEntriesLogged;
        @AuraEnabled
        public boolean isTimeEntriesLogged;
        @AuraEnabled
        public String effectiveHours;
        @AuraEnabled
        public String grossHours;
        @AuraEnabled
        public String hoursPercent;
    }
}