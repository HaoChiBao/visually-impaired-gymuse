import { useState, useEffect } from "react";
import './css/Login.css';

import System from "../auth/system";


const system = new System();

// system.signOut()

const Login = () => {
    const handleSubmit = (e)=>{
        e.preventDefault();
        const input = e.target.querySelector('input');
        const value = input.value;
        if(value !== ''){
            const email = `${value}@gmail.com`;
            console.log(email)
            system.register(email, 'password', value);
        }
    }

    useEffect(() => {
        console.log('login page')
    },[]);

    return (
        <section className = 'Login'>
            <form action="" onSubmit={handleSubmit}>
                <input placeholder="username"></input>
                <button>
                    +
                </button>
            </form>
        </section>
    );
}

export default Login;