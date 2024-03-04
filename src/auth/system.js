// import { initializeApp} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";

// import {onAuthStateChanged, signInAnonymously, signOut, getAuth} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
// import { getDatabase, ref, set, get, onDisconnect } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";

import {initializeApp} from 'firebase/app';
import {getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword} from 'firebase/auth';
import {getDatabase, ref, set, get, onDisconnect} from 'firebase/database';

// creates random ids
import {nanoid} from 'https://cdnjs.cloudflare.com/ajax/libs/nanoid/3.3.4/nanoid.min.js'

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

        // room details of current room the user is connected to
        this.roomRef = null;
        this.room = null;
        this.rid = null;

        onAuthStateChanged(this.auth, (user) => {
            this.onAuthStateChanged(user);
        })
    }

    async createRoom(name){
        const rid = nanoid(8);
        console.log(`creating room: ${rid}`)

        /* 
         * room id
         * room name || default to 'New Room'
         * room users --> json of users in room where keys are UIDs and values are true
         * room messages --> array of messages
        */
        const room = {
            id: rid,
            name: name || 'New Room',
            users: {[this.uid]: true, '0':0},
            messages: ['Welcome to the room!'],
        }
        
        // create room
        this.roomRef = ref(this.db, `rooms/${rid}`);
        await this.setData(this.roomRef, room);

        // leave room if the user is already in a room
        await this.leaveRoom();
        
        // join room
        await this.joinRoom(rid);
    }

    async joinRoom(rid){
        // check if rid isn't empty
        if(rid === "") {console.log('no room entry'); return}
        
        // check if rid is valid
        this.roomRef = ref(this.db, `rooms/${rid}`);
        await get(this.roomRef).then((snapshot) => {

            console.log(`joining room: ${rid}`)

            if (snapshot.exists()) {
                this.rid = rid;
                this.room = snapshot.val();

                // add user to room
                if(!this.room.users[this.uid]){
                    console.log('adding user to room')
                    this.room.users[this.uid] = true;
                    this.setData(this.roomRef, this.room);
                }
                
                // add room id to user data
                get(this.userRef).then((snapshot) => {
                    if (snapshot.exists()) {
                        const user = snapshot.val();
                        user.room = rid;
                        this.setData(this.userRef, user);
                    } else {
                        console.log("No data available");
                    }
                })
            } else {
                console.log("No data available");
            }
        })
    }

    async leaveRoom(){
        // remove user from room
        await get(this.userRef).then((snapshot) => {
            if (snapshot.exists()) {
                // remove room id from user data
                const user = snapshot.val();
                
                if(user.room != ''){
                    const roomRef = ref(this.db, `rooms/${user.room}`);
    
                    // get rid from user data and remove user from room json
                    get(roomRef).then((snapshot) => {
                        if (snapshot.exists()) {
                            this.room = snapshot.val();
                            if(this.room.users[this.uid]){
    
                                // remove room id from user data
                                console.log(`user leaving room: ${this.room.id}`)
                                delete this.room.users[this.uid];
                                // set user room location to empty
                                user.room = '';
    
                                // update room and user data
                                this.setData(this.userRef, user);

                                // check if room is empty and delete if so
                                // otherwise update room data
                                if(Object.keys(this.room.users).length === 1){

                                    // delete room
                                    console.log(`deleting room: ${this.room.id}`)
                                    this.deleteRoom(roomRef);

                                } else {
                                    // update room
                                    this.setData(roomRef, this.room);
                                }
                            }
                            this.rid = null;
                        } else {
                            console.log("No data available");
                        }
                    })

                } else {
                    console.log('user is currently not in room')
                }

            } else {
                console.log("No data available");
            }
        })
    }

    async deleteRoom(roomRef){
        this.setData(roomRef, null);
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

                    this.setData(this.userRef, {
                        name: 'Guest',
                        id: user.uid,
                        room: '',
                        position: {
                            x: 0,
                            y: 0
                        },
                        window: {
                            width: 0,
                            height: 1
                        },
                    })
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
        await signInWithEmailAndPassword(this.auth, email, password)
        
        .catch((error) => {
            let errorCode = error.code;
            let errorMessage = error.message;
        
            console.log(errorCode, errorMessage);
        })
    }

    async register(email, password){
        await createUserWithEmailAndPassword(this.auth, email, password)
        
        .catch((error) => {
            let errorCode = error.code;
            let errorMessage = error.message;
        
            console.log(errorCode, errorMessage);
        })
    }

    async setData(ref, data){
        await set(ref, data);
    }

    // sign the user out
    async signOut(){
        await signOut(this.auth).then(() => {
            console.log('signed out')
            // remove user data
        }).catch((error) => {
            console.log(error)
        })
    }
}
  
export default System;