
   import React, { useState, useContext } from "react";
   import { tokenExpireError, AuthContext } from "Context/Auth";
   import { GlobalContext, showToast } from "Context/Global";
   
   
    
    

    
    
    
    
    
    
    
    
    
    
    const DashboardPage = () => {
      
      
      
      const {state, dispatch} = useContext(AuthContext);
    const {state:globalState, dispatch:globalDispatch} = useContext(GlobalContext);

      
      
      
    
      React.useEffect(() => {
        globalDispatch({
          type: "SETPATH",
          payload: {
            path: "{notes}",
          },
        });
      }, []);

      
      
      return (
        <div className=" shadow-md rounded  mx-auto p-5">
          
        </div>
      );
    };
    
    export default DashboardPage;