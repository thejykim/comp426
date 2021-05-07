import firebase from 'firebase/app';

import 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyA2f-_CTG4gWMEyBm5DHPWjVjQtq2EIdFg",
    authDomain: "comp426-final-589e9.firebaseapp.com",
    projectId: "comp426-final-589e9",
    storageBucket: "comp426-final-589e9.appspot.com",
    messagingSenderId: "320476404936",
    appId: "1:320476404936:web:fccc37a2e1619fa7dc19fd"
};

firebase.initializeApp(firebaseConfig);

export function login(provider) {
    if (provider === 'google') {
        const provider = new firebase.auth.GoogleAuthProvider();
        return firebase.auth().signInWithPopup(provider);
    }
}

export function logout() {
    return firebase.auth().signOut();
}

export function getUser(listener) {
    return firebase.auth().onAuthStateChanged(listener);
}