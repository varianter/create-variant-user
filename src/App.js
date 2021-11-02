import './App.css';
import { useState } from 'react';


function NewVariantForm({addUser}){

  const [firstName, setFirstName] = useState();
  const [lastName, setLastName] = useState();
  const [email, setEmail] = useState();

  const handleSubmit= (e) => {
    addUser({firstName, lastName, email});
    e.preventDefault();
  }


  return (
  <form onSubmit={e => {handleSubmit(e)}}>
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

  const [created, setCreated] = useState("");
  const harvestAccountId = 968670;
  const harvestAuthKey = process.env.REACT_APP_HARVEST_AUTH_KEY;
  const harvestHeaders = {
    "User-Agent": "create-variant",
    "Authorization": "Bearer " + harvestAuthKey,
    "Harvest-Account-ID": harvestAccountId,
    "Content-Type": "application/json"
  };
  const baseUrl = "https://api.harvestapp.com/v2/";

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
        headers: harvestHeaders,
        body: JSON.stringify(data)
      });
      const json = await response.json();
      return json.id;      
    } catch(error)  {
      console.error('Error:', error);
    };
  }

  const assignUserToVariantTid = async (userId) => {
    console.log(userId);
    const variantTidProsjektIder = ['18275198','22639922','22639947','22640097','22646435','22639990','22640019']
    const data = {user_id : userId } ;
    for (let projectId of variantTidProsjektIder ){      
      let url = baseUrl + "projects/" + projectId + "/user_assignments";
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: harvestHeaders,
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
    const userId = await createHarvestUser(user);
    console.log(userId);
    const ok = await assignUserToVariantTid(userId);

    setCreated(ok);
  }

  return (
    <div className="App">
      <NewVariantForm addUser={addUser}/>
      <div>{created}</div>
    </div>
  );
}

export default App;
