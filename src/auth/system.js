// import { initializeApp} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";

// import {onAuthStateChanged, signInAnonymously, signOut, getAuth} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
// import { getDatabase, ref, set, get, onDisconnect } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";

import {initializeApp} from 'firebase/app';
import {getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword, getUserByEmail} from 'firebase/auth';
import {getDatabase, ref, set, get, onDisconnect} from 'firebase/database';

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
}

// Initialize Firebase
class System {
    constructor() {
        this.app = initializeApp(firebaseConfig);
        this.auth = getAuth(this.app);
        this.db = getDatabase(this.app);
    
        // this.analytics = getAnalytics(this.app);

        // user details
        this.userRef = null;
        this.user = null;
        this.uid = null;

        this.data = {
            username: 'Username',
            details: {
                name: 'unnamed',
                weight: 0,
                height: 0,
                age: 0,
            },
            goals: {

            }
        }

        onAuthStateChanged(this.auth, (user) => {
            this.onAuthStateChanged(user);
        })
    }
    // user details
    onAuthStateChanged(user){
        if(user){
            console.log(user)
            this.user = user;
            this.userRef = ref(this.db, 'users/' + this.user.uid);
            this.uid = this.user.uid;

            // get user data
            get(this.userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const user = snapshot.val();
                    console.log(user)
                } else {
                    console.log("creating user data");
                    console.log(this.data)
                    this.setData(this.userRef, this.data)
                }
            })

            // onDisconnect(this.userRef).remove();

        } else {
            this.user = null;
            this.userRef = null;
            this.uid = null;
        }
    }

    async signIn(email, password){
        try{
            const response = await signInWithEmailAndPassword(this.auth, email, password)
            console.log(response)
            
        } catch(error){
            let errorCode = error.code;
            let errorMessage = error.message;
        
            console.log(errorCode, errorMessage);
        }

    }

    async register(email, password, username = 'Username'){
        return new Promise( async (resolve, reject) => {
            this.data.username = username;
            await createUserWithEmailAndPassword(this.auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log(user)
                resolve(user);
            })
            .catch((error) => {
                let errorCode = error.code;
                let errorMessage = error.message;
                
                console.log(errorCode, errorMessage);
                
                resolve(false);
                if(errorCode === 'auth/email-already-in-use'){
                    this.signIn(email, password);
                    return true
                } else {
                }
            })
        })
    }

    async getUserNumber(username){
        return new Promise( async (resolve, reject) => {
            const nameRef = ref(this.db, 'names/' + username);
            const snapshot = await get(nameRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                resolve(data);
            } else {
                resolve(0);
            }
        })
    }

    async addUserNumber(username){
        return new Promise( async (resolve, reject) => {
            const nameRef = ref(this.db, 'names/' + username);
            const snapshot = await get(nameRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                await set(nameRef, data + 1);
                resolve(data + 1);
            } else {
                await set(nameRef, 0);
                resolve(0);
            }
        })
    }

    async setData(ref, data){
        await set(ref, data);
    }

    // sign the user out
    async signOut(){
        await signOut(this.auth).then(() => {
            console.log('signed out')
            this.user = null;
            // remove user data
        }).catch((error) => {
            console.log(error)
        })
    }   
}
  
export default System;