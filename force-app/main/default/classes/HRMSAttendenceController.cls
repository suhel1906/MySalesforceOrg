public with sharing class HRMSAttendenceController {
    @AuraEnabled
    public static List<AttendenceWrapp> getAllAttendence(Integer year, Integer month){
        try {
            List<AttendenceWrapp> attendenceWrapp = new List<AttendenceWrapp>();
            Date currentAttendenceDate;
            Integer daysInMonth;
            if(month == Date.today().month()) {
                currentAttendenceDate = Date.today();
                daysInMonth = 30;
            }
            else {
                daysInMonth = Date.daysInMonth(year, month);
                currentAttendenceDate = Date.newInstance(year, month, daysInMonth);
            }
            List<Employee_Attendence__c> getAttendenceList = new List<Employee_Attendence__c>();
            getAttendenceList = [SELECT Id, In_Time__c, Out_Time__c, Employee_Present_Date__c FROM Employee_Attendence__c WITH SECURITY_ENFORCED ORDER BY Employee_Present_Date__c DESC LIMIT 30];
            List<Holiday__c> getAllHolidays = new List<Holiday__c>();
            getAllHolidays = [SELECT Id, Name, Holiday_Date__c FROM Holiday__c WITH SECURITY_ENFORCED ORDER BY Holiday_Date__c ASC];
            //All leave Requests of current year
            List<Employee_Leave_Request__c> allLeavesReq = new List<Employee_Leave_Request__c>();
            allLeavesReq = [SELECT Id, From_Date__c, To_Date__c, Leave_Type__c, Number_Of_Leave_Days__c FROM Employee_Leave_Request__c WHERE CALENDAR_YEAR(From_Date__c) =:currentAttendenceDate.year() AND CALENDAR_YEAR(To_Date__c) =:currentAttendenceDate.year() WITH SECURITY_ENFORCED];
            Map<Date, Employee_Leave_Request__c> dateVsLeaveMap = new Map<Date, Employee_Leave_Request__c>();
            for(Employee_Leave_Request__c leaveReq : allLeavesReq) {
                if(leaveReq.Number_Of_Leave_Days__c > 1) {
                    for(Integer i=0; i < Math.floor(leaveReq.Number_Of_Leave_Days__c); i++) {
                        dateVsLeaveMap.put(leaveReq.From_Date__c.addDays(i), leaveReq);
                    }
                }
                else {
                    dateVsLeaveMap.put(leaveReq.From_Date__c, leaveReq);
                }
            }
            Map<Date, Employee_Attendence__c> dateVsAttnedenceMap = new Map<Date, Employee_Attendence__c>();
            Set<Date> holidayDateSet = new Set<Date>();
            for(Holiday__c hldy : getAllHolidays) {
                holidayDateSet.add(hldy.Holiday_Date__c);
            }
            for(Employee_Attendence__c attObj : getAttendenceList) {
                dateVsAttnedenceMap.put(attObj.Employee_Present_Date__c, attObj);
            }
            for(Integer i = 0; i < daysInMonth; i++) {
                DateTime getDate = currentAttendenceDate.addDays(-i);
                String weekDayName = getDate.format('EEEE');
                AttendenceWrapp wrappObj = new AttendenceWrapp();
                wrappObj.dateFormat = getDate.format('dd MMM yyyy');
                if(weekDayName == 'Sunday' || weekDayName == 'Saturday') {
                    wrappObj.isWeekOff = true;
                }
                else if(holidayDateSet.contains(currentAttendenceDate.addDays(-i))) {
                    wrappObj.isHoliday = true;
                }
                else if(dateVsLeaveMap.containsKey(currentAttendenceDate.addDays(-i))) {
                    wrappObj.isOnLeave = true;
                    wrappObj.leaveType = dateVsLeaveMap.get(currentAttendenceDate.addDays(-i)).Leave_Type__c;
                }
                else if(dateVsAttnedenceMap.containsKey(currentAttendenceDate.addDays(-i))) {
                    Employee_Attendence__c attendenceObj = dateVsAttnedenceMap.get(currentAttendenceDate.addDays(-i));
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
        @AuraEnabled
        public boolean isOnLeave;
        @AuraEnabled
        public String leaveType;
    }
}