global class HRMSLoginController {
    public String password { get; set; }
    
    public String username { get; set; }
    
    public Boolean showUserNameAndPassPage { get; set; }
    
    global HRMSLoginController () {
        showUserNameAndPassPage = false;
    }
    
    global PageReference forwardToAuthPage() {
        
        String startUrl = System.currentPageReference().
            getParameters().get('startURL');
        
        String displayType = System.currentPageReference().
            getParameters().get('display');
        
        return Network.forwardToAuthPage(startUrl, displayType);
        
    }
    
    global PageReference RedirectToLogin()
        
    {
        
        return new PageReference( '/apex/HRMSLoginPage');
        
        /* 'StudentLogin' is the name of the VF Page for login that is created below */
        
    }
    
    public void loginUser()
        
    {
        System.debug(username+'-'+password);
        //return Site.login(username, password,'/HRMSPage');
        
        /* 'NeedSupport'  is the Page to which we will be redirected after Login */
        
    }
    global void showUserAndPassWordPage() {
        showUserNameAndPassPage = true;
    }
}