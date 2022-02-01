import './App.css';
import { useState } from 'react';


function NewVariantForm({addUser}){

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("0");

  const handleSubmit= (e) => {
    addUser({company, firstName, lastName, email});
    e.preventDefault();
  }


  return (
  <form onSubmit={e => {handleSubmit(e)}}>
    <label>Selskap</label>
    <select name='company' 
      value={company}
      onChange={e => setCompany(e.target.value)}
    >
      <option value="0"></option>
      <option value="1479429">Oslo</option>
      <option value="968670">Trondheim</option>
      <option value="1560398">Bergen</option>
    </select>
    <label>Fornavn</label>
    <input 
      name='firstName' 
      type='text'
      value={firstName}
      onChange={e => setFirstName(e.target.value)}
    />
    <label>Etternavn</label>
    <input 
      name='lastName' 
      type='text' 
      value={lastName}
      onChange={e => setLastName(e.target.value)}
    />
    <label>Epost-adresse</label>
    <input
      name='email' 
      type='email'
      value={email}
      onChange={e => setEmail(e.target.value)}
    />
    <input 
      className='submitButton'
      type='submit' 
      value='Opprett' 
    />
  </form>
)}

function App() {

  const [status, setStatus] = useState("");
  const harvestAuthKey = process.env.REACT_APP_HARVEST_AUTH_KEY;
  const getHarvestHeaders = (company) => {
    return {
      "User-Agent": "create-variant",
      "Authorization": "Bearer " + harvestAuthKey,
      "Harvest-Account-ID": company,
      "Content-Type": "application/json" 
    }
  };
  const baseUrl = "https://api.harvestapp.com/v2/";

  const getUserByEmail = async (user) => {
    //TODO: Støtte flere enn 100 brukere med paging
    let url = baseUrl + "users";
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getHarvestHeaders(user.company)
      });
      const json = await response.json();
      return await json.users.find( ({ email }) => email === user.email );
    } catch(error)  {
      console.error('Error:', error);
      return {ok:false, msg: error.message}; 
    };

  }

  const createHarvestUser = async (user) => {
    
    const data = {
      email : user.email, 
      first_name: user.firstName, 
      last_name: user.lastName, 
      can_see_rates: true,  
      weekly_capacity: 135000} ;

    let url = baseUrl + "users";
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: getHarvestHeaders(user.company),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        
        const error = await response.text();
        const msg = JSON.parse(error).message;
        return {ok:false, msg};
      }
      const json = await response.json();
      return {ok:true, id:json.id};      
    } catch(error)  {
      console.error('Error:', error);
      return {ok:false, msg: error.message}; 
    };
  }

  const assignUserToVariantTid = async (userId, user) => {
    console.log(userId);
    let variantTidProsjektIder = [];
    if (user.company === "968670"){ //trondheim
      variantTidProsjektIder = ['18275198','22639922','22639947','22640097','22646435','22639990','22640019']
    } else if (user.company === "1479429") { //oslo
      variantTidProsjektIder = ['29657291','29657318','29657321','29657351','29657372','29657382','29657393']
    } else if (user.company === "1560398") { //bergen
      variantTidProsjektIder = ['31431252','31431536', '31431565', '31431630', '31431686', '31431756', '31431787']
    } else {
      return "Selskap finnes ikke!"
    }
    
    const data = {user_id : userId } ;
    for (let projectId of variantTidProsjektIder ){      
      let url = baseUrl + "projects/" + projectId + "/user_assignments";
      try {
        await fetch(url, {
          method: 'POST',
          headers: getHarvestHeaders(user.company),
          body: JSON.stringify(data)
        });
      } catch(error)  {
        console.error('Error:', error);
        return "error";
      };
    }
    return "OK"
  }


  const addUser = async (user) => {

    setStatus("Finner bruker ...")
    let ret = await getUserByEmail(user);
    if (!ret){
      setStatus("Oppretter bruker ...")
      ret = await createHarvestUser(user);
      if (!ret.ok) {
        setStatus(ret.msg);
        return;
      }  
    }
    if (!ret.is_active){
      setStatus("Brukeren finnes, men må aktiveres")
      return;
    }
    const ok = await assignUserToVariantTid(ret.id, user);
    setStatus(ok);
  }

  return (
    <div className="App">
      <NewVariantForm addUser={addUser}/>
      <div>{status}</div>
    </div>
  );
}

export default App;
