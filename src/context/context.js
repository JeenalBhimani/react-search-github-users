import React, { useState, useEffect } from 'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';

const rootUrl = 'https://api.github.com';

const GithubContext = React.createContext(); 

const GithubProvider = ({children}) =>{ 
    const [githubUser,setGithubUser] = useState(mockUser);
    const[repos,setRepos] = useState(mockRepos);    
    const[follower,setFollower] = useState(mockFollowers)
    //request loading
    const [loading,setLoading] = useState(false);
    const [requests,setRequests] = useState(0);
    //error
    const [error,setError] = useState({show:false,msg:""})

    //search user
    const searchGithubUser = async(user)=>{
        //here once error thrrn you write correct then error gone 
        toggleError();
        setLoading(true);
        const response  = await axios(`${rootUrl}/users/${user}`)
        .catch((error)=> console.log(error));

        if(response){
            setGithubUser(response.data)
            const {login,followers_url} = response.data;
            
        await Promise.allSettled([
          axios(`${rootUrl}/users/${login}/repos?per_page=100`),  
          axios(`${followers_url}?per_page=100`)
        ]).then((results)=>{
            console.log(results)
                const[repos,followers] = results;
                const status  =  "fulfilled";
                //for repos 
                if(repos.status === status){
                    setRepos(repos.value.data)
                }
                //  for followers
                if(followers.status === status){
                    setFollower(followers.value.data)
                }
            }).catch((error)=> console.log(error))
        }
        else{
            toggleError(true,"there is no user with this username")
        }
        checkRequests();
        setLoading(false);
    }
    //check rate    
       const checkRequests = ()=>{
                axios(`${rootUrl}/rate_limit`)
                .then(({data})=>{
                    let {rate:{remaining}}=data;
                    setRequests(remaining)
                    if(remaining === 0){
                        toggleError(true,"sorry, you havve exeeded our late limit!!")
                    }
                })
                .catch((err)=>console.log(err))
        }

    useEffect(()=>{
        checkRequests();
    },[])

    function toggleError(show=false,msg=""){
       setError({show,msg})
    }

     return(
        <GithubContext.Provider 
        value={{
            githubUser,
            repos,
            follower,
            requests,
            error,
            searchGithubUser,
            loading,
        }}>
            {children}
        </GithubContext.Provider>
    );
     
}
export {GithubContext,GithubProvider};